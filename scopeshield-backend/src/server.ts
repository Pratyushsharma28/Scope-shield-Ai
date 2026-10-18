import dotenv from 'dotenv';
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { scopeShieldRouter } from './routes/analyze.js';

dotenv.config();

const app = express();
const port = Number.parseInt(process.env.PORT || '3000', 10);
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const requestTimeoutMs = 60_000;

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (origin === frontendOrigin) {
    res.setHeader('Access-Control-Allow-Origin', frontendOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  }

  if (req.method === 'OPTIONS') {
    if (origin && origin !== frontendOrigin) {
      res.status(403).json({
        error: { code: 'CORS_ORIGIN_DENIED', message: 'This origin is not allowed.' }
      });
      return;
    }
    res.sendStatus(204);
    return;
  }

  next();
});
app.use(express.json({ limit: '16kb' }));
app.use('/api', scopeShieldRouter);
app.use((_req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'The requested endpoint was not found.' }
  });
});
app.use(errorHandler);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[ScopeShield AI] Server listening on port ${port}`);
});
server.requestTimeout = requestTimeoutMs;
server.headersTimeout = requestTimeoutMs + 5_000;
server.setTimeout(requestTimeoutMs, socket => socket.destroy());
