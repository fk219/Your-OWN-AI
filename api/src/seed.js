import { DEMO_VECTORS, SEED_DOCUMENTS } from './data.js';
import { embedText, EMBEDDING_DIMS, EMBEDDING_PROVIDER } from './embedding.js';
import { DemoVector, Document } from './models.js';

export async function seedData({ force = false } = {}) {
  if (force) {
    await DemoVector.deleteMany({});
    await Document.deleteMany({});
  }

  if ((await DemoVector.countDocuments()) === 0) {
    await DemoVector.insertMany(DEMO_VECTORS);
  }

  if ((await Document.countDocuments()) === 0) {
    await Document.insertMany(
      SEED_DOCUMENTS.map((doc) => ({
        ...doc,
        embedding: embedText(`${doc.title} ${doc.text} ${doc.tags.join(' ')}`),
        dims: EMBEDDING_DIMS,
        provider: EMBEDDING_PROVIDER
      }))
    );
  }
}
