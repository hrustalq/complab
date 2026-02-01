import { z } from 'zod';

/**
 * Parse search params with Zod schema
 * Returns parsed data or default values on failure
 */
export function parseSearchParams<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    const existing = params[key];
    if (existing) {
      params[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      params[key] = value;
    }
  });

  const result = schema.safeParse(params);
  
  if (result.success) {
    return result.data;
  }
  
  // Return default values from schema on failure
  return schema.parse({});
}

/**
 * Parse search params strictly - throws on validation failure
 */
export function parseSearchParamsStrict<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    const existing = params[key];
    if (existing) {
      params[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      params[key] = value;
    }
  });

  const result = schema.safeParse(params);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, error: result.error };
}

// ============================================
// Common search params schemas
// ============================================

/**
 * Pagination params schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Sort params schema
 */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type SortParams = z.infer<typeof sortSchema>;

/**
 * Boolean coercion helper
 */
export const booleanString = z
  .enum(['true', 'false', '1', '0'])
  .transform((val) => val === 'true' || val === '1')
  .optional();

/**
 * Comma-separated array helper
 */
export const commaSeparatedArray = z
  .string()
  .transform((val) => val.split(',').map((s) => s.trim()).filter(Boolean))
  .optional();
