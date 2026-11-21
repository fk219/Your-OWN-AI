import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { router } from './routes.js';

export function createApp() {
  const app = express();
  const origins = config.corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: origins.length ? origins : true,
      credentials: false
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', router);

  app.use((_req, res) => {
    res.status(404).json({ error: { message: 'Not found' } });
  });

  app.use((error, _req, res, _next) => {
    const status = error.statusCode || 400;
    res.status(status).json({ error: { message: error.message || 'Request failed' } });
  });

  return app;
}
