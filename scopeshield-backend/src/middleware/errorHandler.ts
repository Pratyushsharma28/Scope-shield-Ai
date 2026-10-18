import { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { ContractInputError, UnsupportedContractError } from '../services/contractExtractor.js';
import {
  GeminiUnavailableError,
  GeminiUpstreamError,
  isGeminiRateLimit,
  isGeminiTimeout
} from '../services/geminiAnalyzer.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof UnsupportedContractError) {
    res.status(400).json({
      error: { code: 'UNSUPPORTED_FILE_TYPE', message: 'Contract must be a PDF or TXT file.' }
    });
    return;
  }
  if (error instanceof multer.MulterError) {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    res.status(status).json({
      error: {
        code: status === 413 ? 'FILE_TOO_LARGE' : 'INVALID_UPLOAD',
        message: status === 413 ? 'Contract file must be 10 MB or smaller.' : 'Invalid upload.'
      }
    });
    return;
  }
  if (error instanceof ContractInputError) {
    res.status(400).json({ error: { code: 'INVALID_CONTRACT', message: error.message } });
    return;
  }
  if (error instanceof GeminiUnavailableError) {
    res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: error.message } });
    return;
  }
  if (error instanceof GeminiUpstreamError) {
    res.status(502).json({ error: { code: 'UPSTREAM_ERROR', message: error.message } });
    return;
  }
  if (isGeminiTimeout(error)) {
    res.status(504).json({
      error: { code: 'REQUEST_TIMEOUT', message: 'Contract analysis timed out. Try again.' }
    });
    return;
  }
  if (isGeminiRateLimit(error)) {
    res.status(503).json({
      error: { code: 'UPSTREAM_RATE_LIMITED', message: 'The analysis service is temporarily rate limited. Try again shortly.' }
    });
    return;
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = error.status;
    if (status === 400 || status === 413) {
      res.status(status).json({
        error: {
          code: status === 413 ? 'REQUEST_TOO_LARGE' : 'INVALID_REQUEST',
          message: status === 413 ? 'Request is too large.' : 'Invalid request.'
        }
      });
      return;
    }
  }

  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.' }
  });
};
