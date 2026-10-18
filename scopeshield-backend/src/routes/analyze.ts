import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { errorHandler } from '../middleware/errorHandler.js';
import { analyzeInputSchema, analyzeResponseSchema } from '../schemas/analysisSchema.js';
import { extractContractText, MAX_FILE_SIZE, UnsupportedContractError } from '../services/contractExtractor.js';
import { assessContract, GeminiUpstreamError } from '../services/geminiAnalyzer.js';
import { calculateEstimatedCost } from '../services/pricing.js';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = Number.parseInt(process.env.ANALYZE_RATE_LIMIT_MAX_REQUESTS || '10', 10);
const requestsByIp = new Map<string, { count: number; resetAt: number }>();

export const scopeShieldRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1, fields: 3, fieldSize: 4_000 },
  fileFilter: (_req, file, callback) => {
    const extension = file.originalname.toLowerCase().split('.').pop();
    const mimeType = file.mimetype.toLowerCase().split(';')[0]?.trim();
    const supported =
      (extension === 'pdf' && mimeType === 'application/pdf') ||
      (extension === 'txt' && mimeType === 'text/plain');

    if (!supported) {
      callback(new UnsupportedContractError());
      return;
    }
    callback(null, true);
  }
});

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const ip = req.ip || 'unknown';
  let entry = requestsByIp.get(ip);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    requestsByIp.set(ip, entry);
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
    res.status(429).json({
      error: { code: 'RATE_LIMITED', message: 'Too many analysis requests. Try again later.' }
    });
    return;
  }

  entry.count += 1;
  next();
}

scopeShieldRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'ScopeShield AI'
  });
});

scopeShieldRouter.post(
  '/analyze',
  rateLimit,
  upload.single('contract'),
  (req: Request, res: Response, next: NextFunction) => {
    void handleAnalysis(req, res, next);
  }
);

async function handleAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({
        error: { code: 'CONTRACT_REQUIRED', message: 'Upload a PDF or TXT contract in the "contract" field.' }
      });
      return;
    }

    const input = analyzeInputSchema.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid analysis request.',
          details: input.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }
      });
      return;
    }

    const contractText = await extractContractText(req.file);
    const assessment = await assessContract(contractText, input.data.clientRequest);
    const response = analyzeResponseSchema.safeParse({
      ...assessment,
      estimatedExtraHours: input.data.estimatedExtraHours,
      hourlyRate: input.data.hourlyRate,
      estimatedExtraCost: calculateEstimatedCost(input.data.estimatedExtraHours, input.data.hourlyRate),
      currency: 'INR'
    });
    if (!response.success) {
      throw new GeminiUpstreamError('The completed analysis response failed validation.');
    }

    res.status(200).json(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid analysis request.'
        }
      });
      return;
    }
    next(error);
  }
}

scopeShieldRouter.use(errorHandler);
