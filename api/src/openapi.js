export const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'Vector Field API',
    version: '1.0.0',
    description:
      'HNSW, KD-tree, and brute-force search over a 16D demo field, plus a MongoDB-backed document library with hash embeddings and extractive RAG.'
  },
  servers: [{ url: '/' }],
  paths: {
    '/api/health': {
      get: { summary: 'Health and MongoDB readiness', responses: { 200: { description: 'Ready' }, 503: { description: 'Database unavailable' } } }
    },
    '/api/openapi.json': {
      get: { summary: 'This OpenAPI contract', responses: { 200: { description: 'OpenAPI JSON' } } }
    },
    '/api/stats': {
      get: { summary: 'Index and embedding stats', responses: { 200: { description: 'Stats' } } }
    },
    '/api/demo': {
      get: { summary: '20 demo vectors with 2D PCA projection', responses: { 200: { description: 'Demo field' } } }
    },
    '/api/search': {
      post: {
        summary: 'Search the demo field',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SearchInput' } } } },
        responses: { 200: { description: 'Ranked neighbors' }, 400: { description: 'Validation error' }, 429: { description: 'Rate limited' } }
      }
    },
    '/api/benchmark': {
      post: {
        summary: 'Latency and recall comparison',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BenchmarkInput' } } } },
        responses: { 200: { description: 'Algorithm measurements' }, 429: { description: 'Rate limited' } }
      }
    },
    '/api/documents': {
      get: { summary: 'Document library', responses: { 200: { description: 'Documents without embeddings' } } },
      post: {
        summary: 'Embed and index a passage (operator token)',
        security: [{ DemoOperator: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/DocumentInput' } } } },
        responses: { 201: { description: 'Created document' }, 400: { description: 'Validation error' }, 401: { description: 'Operator token required' } }
      }
    },
    '/api/documents/{id}': {
      delete: {
        summary: 'Remove a document and rebuild the index (operator token)',
        security: [{ DemoOperator: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 401: { description: 'Operator token required' }, 404: { description: 'Not found' } }
      }
    },
    '/api/ask': {
      post: {
        summary: 'Retrieve passages and build an extractive answer',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AskInput' } } } },
        responses: { 200: { description: 'Answer with sources and timings' }, 429: { description: 'Rate limited' } }
      }
    }
  },
  components: {
    securitySchemes: {
      DemoOperator: { type: 'apiKey', in: 'header', name: 'x-demo-admin-token' }
    },
    schemas: {
      SearchInput: {
        type: 'object',
        required: ['vector'],
        properties: {
          vector: { type: 'array', minItems: 16, maxItems: 16, items: { type: 'number' } },
          k: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
          metric: { type: 'string', enum: ['cosine', 'euclidean', 'manhattan'], default: 'cosine' },
          algorithm: { type: 'string', enum: ['hnsw', 'kdtree', 'brute'], default: 'hnsw' }
        }
      },
      BenchmarkInput: {
        type: 'object',
        properties: {
          metric: { type: 'string', enum: ['cosine', 'euclidean', 'manhattan'], default: 'cosine' },
          k: { type: 'integer', minimum: 1, maximum: 10, default: 5 }
        }
      },
      DocumentInput: {
        type: 'object',
        required: ['title', 'text'],
        properties: {
          title: { type: 'string', example: 'A note on recall' },
          text: { type: 'string', minLength: 20 },
          tags: { type: 'array', items: { type: 'string' } },
          category: { type: 'string', default: 'General' }
        }
      },
      AskInput: {
        type: 'object',
        required: ['question'],
        properties: {
          question: { type: 'string', example: 'What is HNSW?' },
          k: { type: 'integer', minimum: 1, maximum: 10, default: 4 }
        }
      }
    }
  }
};
