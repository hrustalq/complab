import { z } from 'zod';
import { paginationSchema, booleanString } from '@/shared/api/search-params';

/**
 * GET /api/reviews query params
 */
export const getReviewsQuerySchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  stats: booleanString,
  simple: booleanString,
  sortBy: z.enum(['createdAt', 'rating', 'helpful']).default('createdAt'),
  ...paginationSchema.shape,
});

export type GetReviewsQuery = z.infer<typeof getReviewsQuerySchema>;

/**
 * POST /api/reviews body
 */
export const createReviewBodySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  userName: z.string().min(1, 'userName is required'),
  productId: z.string().min(1, 'productId is required'),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(2000),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
});

export type CreateReviewBody = z.infer<typeof createReviewBodySchema>;
