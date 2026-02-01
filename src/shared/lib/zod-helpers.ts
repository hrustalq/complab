import { z } from 'zod';

/**
 * Хелперы для работы с Zod схемами
 */

/**
 * Создает схему пагинации
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Создает схему сортировки для указанного списка полей
 */
export function createSortSchema<T extends string>(fields: readonly T[]) {
  return z.object({
    field: z.enum(fields as unknown as readonly [T, ...T[]]),
    direction: z.enum(['asc', 'desc']).default('asc'),
  });
}

/**
 * Базовая схема для entity с id
 */
export const baseEntitySchema = z.object({
  id: z.string(),
});

/**
 * Схема для timestamp полей
 */
export const timestampSchema = z.object({
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()).optional(),
});

/**
 * Валидация email
 */
export const emailSchema = z.string().email('Некорректный email');

/**
 * Валидация телефона (российский формат)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[78][\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/, 'Некорректный номер телефона');

/**
 * Валидация цены
 */
export const priceSchema = z.coerce.number().positive('Цена должна быть положительной');

/**
 * Безопасный парсинг с возвратом результата
 */
export function safeParse<T>(schema: z.Schema<T>, data: unknown): 
  { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Получить сообщения об ошибках валидации
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });
  return errors;
}
