import { config } from './config.js';
import { connectDb, disconnectDb } from './db.js';
import { seedData } from './seed.js';
import { engine } from './engine.js';
import { createApp } from './app.js';

await connectDb(config.mongoUri);
await seedData();
await engine.rebuild();

const app = createApp();
const server = app.listen(config.port, () => {
  process.stdout.write(`Vector AI API listening on ${config.port}\n`);
});

const shutdown = async () => {
  server.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
