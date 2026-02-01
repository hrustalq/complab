import { db } from '@/shared/database/in-memory-connection';
import { getProductRepository } from '../model/repository';
import {
  getProductsRequestSchema,
  searchProductsRequestSchema,
  type ProductListResponse,
  type Product,
  type ProductFilter,
  type ProductCardDto,
  mapProductToCard,
} from '../model/schemas';
import type { SortOptions } from '@/shared/database/types';

const productRepo = getProductRepository(db);

/**
 * Получить товары с фильтрацией, пагинацией и сортировкой
 */
export async function getProducts(params: unknown): Promise<ProductListResponse> {
  const validatedParams = getProductsRequestSchema.safeParse(params);

  const { filter, sort, page, limit } = validatedParams.success
    ? validatedParams.data
    : { filter: undefined, sort: undefined, page: 1, limit: 12 };

  const productSort: SortOptions<Product> | undefined = sort
    ? { field: sort.field as keyof Product, direction: sort.direction }
    : undefined;

  const result = await productRepo.findWithFilters(
    filter || {},
    { page, limit },
    productSort
  );

  return {
    products: result.items,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
}

/**
 * Получить товары по категории
 */
export async function getProductsByCategory(
  categorySlug: string,
  page = 1,
  limit = 12
): Promise<ProductListResponse> {
  const filter: ProductFilter = { categorySlug };
  const result = await productRepo.findWithFilters(filter, { page, limit });

  return {
    products: result.items,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
}

/**
 * Получить товар по ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  return productRepo.findById(id);
}

/**
 * Получить товар по slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return productRepo.findBySlug(slug);
}

/**
 * Получить рекомендуемые товары
 */
export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
  return productRepo.findFeatured(limit);
}

/**
 * Получить новинки
 */
export async function getNewProducts(limit?: number): Promise<Product[]> {
  return productRepo.findNew(limit);
}

/**
 * Получить товары со скидкой
 */
export async function getOnSaleProducts(limit?: number): Promise<Product[]> {
  return productRepo.findOnSale(limit);
}

/**
 * Поиск товаров
 */
export async function searchProducts(params: unknown): Promise<Product[]> {
  const validatedParams = searchProductsRequestSchema.safeParse(params);

  if (!validatedParams.success) {
    return [];
  }

  const { query, limit } = validatedParams.data;
  return productRepo.search(query, limit);
}

/**
 * Получить похожие товары
 */
export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const product = await productRepo.findById(productId);
  if (!product) return [];
  return productRepo.findRelated(product, limit);
}

/**
 * Получить все бренды
 */
export async function getBrands(): Promise<string[]> {
  return productRepo.getBrands();
}

/**
 * Получить карточки товаров (DTO)
 */
export async function getProductCards(limit = 12): Promise<ProductCardDto[]> {
  const products = await productRepo.findFeatured(limit);
  return products.map(mapProductToCard);
}

/**
 * Получить все товары (без фильтрации)
 */
export async function getAllProducts(): Promise<Product[]> {
  return productRepo.findAll();
}
