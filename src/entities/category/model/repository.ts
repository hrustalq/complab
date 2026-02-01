import { PrismaBaseRepository } from '@/shared/repository/base-repository';
import prisma from '@/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';
import type { Category, CategoryWithChildren, CategoryBreadcrumb } from './schemas';

/**
 * Тип категории из Prisma
 */
type PrismaCategory = Prisma.CategoryGetPayload<object>;
type PrismaCategoryWithChildren = Prisma.CategoryGetPayload<{
  include: { children: true };
}>;

/**
 * Преобразовать Prisma Category в схему Category
 */
function mapPrismaCategory(category: PrismaCategory | null): Category | null {
  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? undefined,
    icon: category.icon ?? undefined,
    image: category.image ?? undefined,
    parentId: category.parentId ?? undefined,
    order: category.order,
    isActive: category.isActive,
  };
}

function mapPrismaCategories(categories: PrismaCategory[]): Category[] {
  return categories.map((c) => mapPrismaCategory(c)!);
}

/**
 * Репозиторий категорий с Prisma
 */
export class CategoryRepository extends PrismaBaseRepository<
  Category,
  Prisma.CategoryCreateInput,
  Prisma.CategoryUpdateInput
> {
  protected modelName = 'category' as const;

  /**
   * Поиск по ID
   */
  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    return mapPrismaCategory(category);
  }

  /**
   * Получить все категории
   */
  async findAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return mapPrismaCategories(categories);
  }

  /**
   * Поиск по slug
   */
  async findBySlug(slug: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { slug },
    });
    return mapPrismaCategory(category);
  }

  /**
   * Получить дерево категорий (родительские с детьми)
   */
  async findTree(): Promise<CategoryWithChildren[]> {
    const rootCategories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return rootCategories.map((parent: PrismaCategoryWithChildren) => ({
      ...mapPrismaCategory(parent)!,
      children: mapPrismaCategories(parent.children),
    }));
  }

  /**
   * Получить дочерние категории
   */
  async findChildren(parentId: string): Promise<Category[]> {
    const children = await prisma.category.findMany({
      where: { parentId, isActive: true },
      orderBy: { order: 'asc' },
    });
    return mapPrismaCategories(children);
  }

  /**
   * Получить хлебные крошки для категории
   */
  async getBreadcrumbs(categoryId: string): Promise<CategoryBreadcrumb[]> {
    const breadcrumbs: CategoryBreadcrumb[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const found: { id: string; name: string; slug: string; parentId: string | null } | null =
        await prisma.category.findUnique({
          where: { id: currentId },
          select: { id: true, name: true, slug: true, parentId: true },
        });

      if (!found) break;

      breadcrumbs.unshift({
        id: found.id,
        name: found.name,
        slug: found.slug,
      });

      currentId = found.parentId;
    }

    return breadcrumbs;
  }

  /**
   * Получить корневые категории
   */
  async findRootCategories(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { order: 'asc' },
    });
    return mapPrismaCategories(categories);
  }
}

// Singleton instance
let categoryRepositoryInstance: CategoryRepository | null = null;

export function getCategoryRepository(): CategoryRepository {
  if (!categoryRepositoryInstance) {
    categoryRepositoryInstance = new CategoryRepository();
  }
  return categoryRepositoryInstance;
}
