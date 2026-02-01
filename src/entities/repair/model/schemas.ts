import { z } from 'zod';
import { priceSchema } from '@/shared/lib/zod-helpers';

/**
 * Категории ремонта
 */
export const repairCategorySchema = z.enum([
  'laptop',
  'desktop',
  'monitor',
  'peripheral',
  'data_recovery',
  'upgrade',
]);

export type RepairCategory = z.infer<typeof repairCategorySchema>;

export const REPAIR_CATEGORY_LABELS: Record<RepairCategory, string> = {
  laptop: 'Ноутбуки',
  desktop: 'Настольные ПК',
  monitor: 'Мониторы',
  peripheral: 'Периферия',
  data_recovery: 'Восстановление данных',
  upgrade: 'Апгрейд',
};

/**
 * Схема услуги ремонта
 */
export const repairServiceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Название обязательно'),
  description: z.string(),
  category: repairCategorySchema,
  estimatedTime: z.string(),
  priceFrom: priceSchema,
  priceTo: priceSchema.optional(),
  isPopular: z.boolean().optional(),
});

export type RepairService = z.infer<typeof repairServiceSchema>;

/**
 * Статусы заявки на ремонт
 */
export const repairRequestStatusSchema = z.enum([
  'pending',
  'diagnosed',
  'awaiting_approval',
  'in_progress',
  'completed',
  'cancelled',
]);

export type RepairRequestStatus = z.infer<typeof repairRequestStatusSchema>;

export const REPAIR_STATUS_LABELS: Record<RepairRequestStatus, string> = {
  pending: 'Ожидает диагностики',
  diagnosed: 'Диагностика завершена',
  awaiting_approval: 'Ожидает подтверждения',
  in_progress: 'В работе',
  completed: 'Выполнен',
  cancelled: 'Отменен',
};

/**
 * Схема истории статуса
 */
export const repairStatusHistorySchema = z.object({
  status: repairRequestStatusSchema,
  timestamp: z.string(),
  comment: z.string().optional(),
});

export type RepairStatusHistory = z.infer<typeof repairStatusHistorySchema>;

/**
 * Схема заявки на ремонт
 */
export const repairRequestSchema = z.object({
  id: z.string(),
  requestNumber: z.string(),
  userId: z.string(),
  service: repairServiceSchema,
  deviceType: z.string().min(1, 'Тип устройства обязателен'),
  deviceBrand: z.string().min(1, 'Бренд обязателен'),
  deviceModel: z.string().min(1, 'Модель обязательна'),
  serialNumber: z.string().optional(),
  problemDescription: z.string().min(10, 'Опишите проблему подробнее'),
  status: repairRequestStatusSchema,
  statusHistory: z.array(repairStatusHistorySchema),
  estimatedCost: priceSchema.optional(),
  finalCost: priceSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
});

export type RepairRequest = z.infer<typeof repairRequestSchema>;

/**
 * Схема создания заявки на ремонт
 */
export const createRepairRequestSchema = z.object({
  serviceId: z.string(),
  deviceType: z.string().min(1, 'Тип устройства обязателен'),
  deviceBrand: z.string().min(1, 'Бренд обязателен'),
  deviceModel: z.string().min(1, 'Модель обязательна'),
  serialNumber: z.string().optional(),
  problemDescription: z.string().min(10, 'Опишите проблему подробнее'),
});

export type CreateRepairRequestInput = z.infer<typeof createRepairRequestSchema>;

/**
 * Схема параметров запроса услуг
 */
export const getRepairServicesParamsSchema = z.object({
  category: repairCategorySchema.optional(),
});

export type GetRepairServicesParams = z.infer<typeof getRepairServicesParamsSchema>;
