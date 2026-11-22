import rateLimit from 'express-rate-limit';

const limitHandler = (req, res) => {
  res.status(429).json({
    error: { message: 'Too many requests', requestId: req.id }
  });
};

const base = { standardHeaders: true, legacyHeaders: false, handler: limitHandler };

export const apiLimiter = rateLimit({ ...base, windowMs: 60_000, limit: 150 });
export const searchLimiter = rateLimit({ ...base, windowMs: 60_000, limit: 60 });
export const expensiveLimiter = rateLimit({ ...base, windowMs: 60_000, limit: 20 });
export const writeLimiter = rateLimit({ ...base, windowMs: 60_000, limit: 15 });

export function requireOperator(req, res, next) {
  const expected = process.env.ADMIN_TOKEN || 'demo-operator-key';
  if (req.get('x-demo-admin-token') !== expected) {
    return res.status(401).json({
      error: { message: 'Operator token required', requestId: req.id }
    });
  }
  next();
}
