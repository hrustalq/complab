import { PrismaBaseRepository } from '@/shared/repository/base-repository';
import prisma from '@/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';
import type { PaginatedResult } from '@/shared/database/types';
import type { Product, ProductFilter } from './schemas';

/**
 * Тип продукта из Prisma с преобразованием Decimal в number
 */
type PrismaProduct = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

/**
 * Преобразовать Prisma Product в схему Product
 */
function mapPrismaProduct(product: PrismaProduct | null): Product | null {
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
    images: product.images,
    categoryId: product.categoryId,
    categorySlug: product.category?.slug ?? '',
    brand: product.brand,
    sku: product.sku,
    inStock: product.inStock,
    stockQuantity: product.stockQuantity,
    specifications: product.specifications as { name: string; value: string; group?: string }[],
    rating: Number(product.rating),
    reviewsCount: product.reviewsCount,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    isOnSale: product.isOnSale,
    createdAt: product.createdAt.toISOString().split('T')[0],
  };
}

function mapPrismaProducts(products: PrismaProduct[]): Product[] {
  return products.map((p) => mapPrismaProduct(p)!);
}

/**
 * Репозиторий товаров с Prisma
 */
export class ProductRepository extends PrismaBaseRepository<
  Product,
  Prisma.ProductCreateInput,
  Prisma.ProductUpdateInput
> {
  protected modelName = 'product' as const;

  /**
   * Поиск по ID с включением категории
   */
  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    return mapPrismaProduct(product);
  }

  /**
   * Поиск по slug
   */
  async findBySlug(slug: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    return mapPrismaProduct(product);
  }

  /**
   * Получить все продукты
   */
  async findAll(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return mapPrismaProducts(products);
  }

  /**
   * Поиск по категории
   */
  async findByCategory(categorySlug: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { category: { slug: categorySlug } },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return mapPrismaProducts(products);
  }

  /**
   * Поиск с фильтрами и пагинацией
   */
  async findWithFilters(
    filter: ProductFilter,
    pagination: { page: number; limit: number },
    sort?: { field: string; direction: 'asc' | 'desc' }
  ): Promise<PaginatedResult<Product>> {
    const where: Prisma.ProductWhereInput = {};

    if (filter.categorySlug) {
      where.category = { slug: filter.categorySlug };
    }
    if (filter.brands && filter.brands.length > 0) {
      where.brand = { in: filter.brands };
    }
    if (filter.priceMin !== undefined) {
      where.price = { ...((where.price as object) || {}), gte: filter.priceMin };
    }
    if (filter.priceMax !== undefined) {
      where.price = { ...((where.price as object) || {}), lte: filter.priceMax };
    }
    if (filter.inStock !== undefined) {
      where.inStock = filter.inStock;
    }
    if (filter.isNew) {
      where.isNew = true;
    }
    if (filter.isOnSale) {
      where.isOnSale = true;
    }
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { shortDescription: { contains: filter.search, mode: 'insensitive' } },
        { brand: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = sort
      ? { [sort.field]: sort.direction }
      : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: mapPrismaProducts(products),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  /**
   * Получить рекомендуемые товары
   */
  async findFeatured(limit = 8): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { isFeatured: true, inStock: true },
      include: { category: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return mapPrismaProducts(products);
  }

  /**
   * Получить новинки
   */
  async findNew(limit = 8): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { isNew: true, inStock: true },
      include: { category: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return mapPrismaProducts(products);
  }

  /**
   * Получить товары со скидкой
   */
  async findOnSale(limit = 8): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { isOnSale: true, inStock: true },
      include: { category: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return mapPrismaProducts(products);
  }

  /**
   * Текстовый поиск
   */
  async search(query: string, limit?: number): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { category: true },
      take: limit,
      orderBy: { rating: 'desc' },
    });
    return mapPrismaProducts(products);
  }

  /**
   * Получить похожие товары
   */
  async findRelated(product: Product, limit = 4): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        inStock: true,
      },
      include: { category: true },
      take: limit,
      orderBy: { rating: 'desc' },
    });
    return mapPrismaProducts(products);
  }

  /**
   * Получить уникальные бренды
   */
  async getBrands(): Promise<string[]> {
    const products = await prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    });
    return products.map((p) => p.brand);
  }

  /**
   * Поиск по массиву ID
   */
  async findByIds(ids: string[]): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { category: true },
    });
    return mapPrismaProducts(products);
  }
}

// Singleton instance
let productRepositoryInstance: ProductRepository | null = null;

export function getProductRepository(): ProductRepository {
  if (!productRepositoryInstance) {
    productRepositoryInstance = new ProductRepository();
  }
  return productRepositoryInstance;
}
