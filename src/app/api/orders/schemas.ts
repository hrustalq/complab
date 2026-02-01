import { z } from 'zod';
import { paginationSchema, booleanString } from '@/shared/api/search-params';

/**
 * GET /api/orders query params
 */
export const getOrdersQuerySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  simple: booleanString,
  ...paginationSchema.shape,
});

export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;

/**
 * PATCH /api/orders/:id body
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  comment: z.string().optional(),
});

export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusSchema>;
