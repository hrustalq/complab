import { z } from 'zod';
import { paginationSchema, booleanString } from '@/shared/api/search-params';
import { orderStatusSchema } from '@/entities/order/model/schemas';

/**
 * GET /api/orders query params
 */
export const getOrdersQuerySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  status: orderStatusSchema.optional(),
  simple: booleanString,
  ...paginationSchema.shape,
});

export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;

/**
 * PATCH /api/orders/:id body
 */
export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  comment: z.string().optional(),
});

export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusSchema>;
