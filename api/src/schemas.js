import { z } from 'zod';

export const searchSchema = z.object({
  vector: z.array(z.coerce.number().finite()).length(16),
  k: z.coerce.number().int().min(1).max(10).optional().default(5),
  metric: z.enum(['cosine', 'euclidean', 'manhattan']).optional().default('cosine'),
  algorithm: z.enum(['hnsw', 'kdtree', 'brute']).optional().default('hnsw')
});

export const benchmarkSchema = z.object({
  metric: z.enum(['cosine', 'euclidean', 'manhattan']).optional().default('cosine'),
  k: z.coerce.number().int().min(1).max(10).optional().default(5)
});

export const documentSchema = z.object({
  title: z.string().min(1).max(200),
  text: z.string().min(20).max(20_000),
  tags: z
    .union([z.array(z.string().min(1).max(64)).max(20), z.string().max(500)])
    .optional()
    .default([]),
  category: z.string().max(80).optional().default('General')
});

export const askSchema = z.object({
  question: z.string().min(3).max(1000),
  k: z.coerce.number().int().min(1).max(10).optional().default(4)
});
