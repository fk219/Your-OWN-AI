import 'dotenv/config';

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: number(process.env.PORT, 4300),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vectorsearch',
  corsOrigin: process.env.CORS_ORIGIN || '',
  nodeEnv: process.env.NODE_ENV || 'development'
};
