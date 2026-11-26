import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { router } from './routes.js';
import { requestContext } from './observability.js';
import { apiLimiter } from './security.js';

export function createApp() {
  const app = express();
  const origins = config.corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(requestContext('vector-search-api'));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: origins.length ? origins : true,
      credentials: false
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', apiLimiter);
  app.use('/api', router);

  app.use((_req, res) => {
    res.status(404).json({ error: { message: 'Not found' } });
  });

  app.use((error, _req, res, _next) => {
    const status = error.statusCode || 400;
    res.status(status).json({
      error: { message: error.message || 'Request failed', requestId: _req.id }
    });
  });

  return app;
}
