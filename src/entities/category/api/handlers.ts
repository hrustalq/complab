import { db } from '@/shared/database/in-memory-connection';
import { getCategoryRepository } from '../model/repository';
import { getCategoriesParamsSchema } from '../model/schemas';
import type { Category, CategoryWithChildren, CategoryBreadcrumb } from '../model/schemas';

const categoryRepo = getCategoryRepository(db);

/**
 * Получить все категории (дерево)
 */
export async function getCategories(): Promise<CategoryWithChildren[]> {
  return categoryRepo.findTree();
}

/**
 * Получить корневые категории
 */
export async function getRootCategories(): Promise<Category[]> {
  return categoryRepo.findRootCategories();
}

/**
 * Получить категорию по slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return categoryRepo.findBySlug(slug);
}

/**
 * Получить категорию по ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  return categoryRepo.findById(id);
}

/**
 * Получить дочерние категории
 */
export async function getCategoryChildren(parentId: string): Promise<Category[]> {
  return categoryRepo.findChildren(parentId);
}

/**
 * Получить хлебные крошки для категории
 */
export async function getCategoryBreadcrumbs(categoryId: string): Promise<CategoryBreadcrumb[]> {
  return categoryRepo.getBreadcrumbs(categoryId);
}

/**
 * Получить категории с фильтром
 */
export async function getCategoriesFiltered(params: unknown): Promise<Category[]> {
  const validatedParams = getCategoriesParamsSchema.safeParse(params);

  if (!validatedParams.success) {
    return categoryRepo.findAll();
  }

  const { parentId, isActive } = validatedParams.data;

  if (parentId) {
    return categoryRepo.findChildren(parentId);
  }

  if (isActive !== undefined) {
    return categoryRepo.findMany({ isActive });
  }

  return categoryRepo.findAll();
}
