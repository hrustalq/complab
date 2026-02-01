import { z } from 'zod';

/**
 * GET /api/banners query params
 */
export const getBannersQuerySchema = z.object({
  type: z.enum(['hero', 'promo']).optional(),
});

export type GetBannersQuery = z.infer<typeof getBannersQuerySchema>;
