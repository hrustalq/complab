import { z } from 'zod';
import { paginationSchema, createSortSchema } from '@/shared/lib/zod-helpers';

/**
 * Схема отзыва
 */
export const reviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userAvatar: z.string().url().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1, 'Заголовок обязателен'),
  content: z.string().min(10, 'Отзыв должен быть не менее 10 символов'),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  isVerified: z.boolean().default(false),
  helpfulCount: z.number().int().nonnegative().default(0),
  createdAt: z.string(),
});

export type Review = z.infer<typeof reviewSchema>;

/**
 * Схема статистики отзывов
 */
export const reviewStatsSchema = z.object({
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number().int().nonnegative(),
  ratingDistribution: z.object({
    1: z.number().int().nonnegative(),
    2: z.number().int().nonnegative(),
    3: z.number().int().nonnegative(),
    4: z.number().int().nonnegative(),
    5: z.number().int().nonnegative(),
  }),
});

export type ReviewStats = z.infer<typeof reviewStatsSchema>;

/**
 * Схема создания отзыва
 */
export const createReviewRequestSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1, 'Заголовок обязателен'),
  content: z.string().min(10, 'Отзыв должен быть не менее 10 символов'),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
});

export type CreateReviewRequest = z.infer<typeof createReviewRequestSchema>;

/**
 * Схема сортировки отзывов
 */
export const reviewSortSchema = createSortSchema(['date', 'rating', 'helpful'] as const);

/**
 * Схема параметров запроса отзывов
 */
export const getReviewsParamsSchema = z.object({
  productId: z.string(),
  sortBy: z.enum(['date', 'rating', 'helpful']).default('date'),
}).merge(paginationSchema);

export type GetReviewsParams = z.infer<typeof getReviewsParamsSchema>;

/**
 * Схема ответа со списком отзывов
 */
export const reviewListResponseSchema = z.object({
  reviews: z.array(reviewSchema),
  stats: reviewStatsSchema,
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

export type ReviewListResponse = z.infer<typeof reviewListResponseSchema>;
