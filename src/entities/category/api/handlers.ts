import prisma from '@/lib/prisma';
import { getCategoryRepository } from '../model/repository';
import { getCategoriesParamsSchema } from '../model/schemas';
import type { Category, CategoryWithChildren, CategoryBreadcrumb } from '../model/schemas';

const categoryRepo = getCategoryRepository();

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
 * Получить все категории (плоский список)
 */
export async function getAllCategories(): Promise<Category[]> {
  return categoryRepo.findAll();
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
    // Use prisma directly for filtered queries
    const categories = await prisma.category.findMany({
      where: { isActive },
      orderBy: { order: 'asc' },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? undefined,
      icon: c.icon ?? undefined,
      image: c.image ?? undefined,
      parentId: c.parentId ?? undefined,
      order: c.order,
      isActive: c.isActive,
    }));
  }

  return categoryRepo.findAll();
}
