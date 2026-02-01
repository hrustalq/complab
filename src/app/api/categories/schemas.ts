import { z } from 'zod';
import { booleanString } from '@/shared/api/search-params';

/**
 * GET /api/categories query params
 */
export const getCategoriesQuerySchema = z.object({
  tree: booleanString,
  root: booleanString,
  all: booleanString,
  parentId: z.string().optional(),
  isActive: booleanString,
});

export type GetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>;

/**
 * GET /api/categories/:slug query params
 */
export const getCategoryBySlugQuerySchema = z.object({
  breadcrumbs: booleanString,
  children: booleanString,
});

export type GetCategoryBySlugQuery = z.infer<typeof getCategoryBySlugQuerySchema>;
