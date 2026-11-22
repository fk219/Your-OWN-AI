import { randomUUID } from 'node:crypto';

export function requestContext(service) {
  return (req, res, next) => {
    const requestId = req.get('x-request-id') || randomUUID();
    req.id = requestId;
    res.setHeader('x-request-id', requestId);

    const started = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      console.log(
        JSON.stringify({
          level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
          service,
          requestId,
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          durationMs: Number(durationMs.toFixed(1))
        })
      );
    });

    next();
  };
}
