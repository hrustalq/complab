import { z } from 'zod';

/**
 * Схема категории
 */
export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().min(1, 'Slug обязателен'),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
  order: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export type Category = z.infer<typeof categorySchema>;

/**
 * Схема для создания категории
 */
export const createCategorySchema = categorySchema.omit({ id: true });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

/**
 * Схема для обновления категории
 */
export const updateCategorySchema = categorySchema.partial().required({ id: true });

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

/**
 * Схема категории с детьми
 */
export const categoryWithChildrenSchema = categorySchema.extend({
  children: z.array(categorySchema).default([]),
});

export type CategoryWithChildren = z.infer<typeof categoryWithChildrenSchema>;

/**
 * Схема хлебных крошек
 */
export const categoryBreadcrumbSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export type CategoryBreadcrumb = z.infer<typeof categoryBreadcrumbSchema>;

/**
 * Схема параметров запроса категорий
 */
export const getCategoriesParamsSchema = z.object({
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type GetCategoriesParams = z.infer<typeof getCategoriesParamsSchema>;

/**
 * Схема ответа со списком категорий
 */
export const categoryListResponseSchema = z.object({
  categories: z.array(categoryWithChildrenSchema),
  total: z.number(),
});

export type CategoryListResponse = z.infer<typeof categoryListResponseSchema>;

/**
 * Схема ответа с одной категорией
 */
export const categoryResponseSchema = z.object({
  category: categorySchema,
  breadcrumbs: z.array(categoryBreadcrumbSchema),
});

export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
