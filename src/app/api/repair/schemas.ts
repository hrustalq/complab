import { z } from 'zod';
import { booleanString } from '@/shared/api/search-params';

/**
 * GET /api/repair/services query params
 */
export const getRepairServicesQuerySchema = z.object({
  popular: booleanString,
  category: z.enum(['laptop', 'desktop', 'monitor', 'peripheral', 'data_recovery', 'upgrade']).optional(),
});

export type GetRepairServicesQuery = z.infer<typeof getRepairServicesQuerySchema>;

/**
 * GET /api/repair/requests query params
 */
export const getRepairRequestsQuerySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
});

export type GetRepairRequestsQuery = z.infer<typeof getRepairRequestsQuerySchema>;
