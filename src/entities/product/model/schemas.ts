import { z } from 'zod';
import { paginationSchema, createSortSchema, priceSchema } from '@/shared/lib/zod-helpers';

/**
 * Схема спецификации товара
 */
export const productSpecificationSchema = z.object({
  name: z.string(),
  value: z.string(),
  group: z.string().optional(),
});

export type ProductSpecification = z.infer<typeof productSpecificationSchema>;

/**
 * Схема товара
 */
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().min(1, 'Slug обязателен'),
  description: z.string(),
  shortDescription: z.string(),
  price: priceSchema,
  oldPrice: priceSchema.optional(),
  images: z.array(z.string().url()),
  categoryId: z.string(),
  categorySlug: z.string(),
  brand: z.string(),
  sku: z.string(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().nonnegative().default(0),
  specifications: z.array(productSpecificationSchema).default([]),
  rating: z.number().min(0).max(5).default(0),
  reviewsCount: z.number().int().nonnegative().default(0),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isOnSale: z.boolean().optional(),
  createdAt: z.string(),
});

export type Product = z.infer<typeof productSchema>;

/**
 * Схема для создания товара
 */
export const createProductSchema = productSchema.omit({ id: true });

export type CreateProductInput = z.infer<typeof createProductSchema>;

/**
 * Схема для обновления товара
 */
export const updateProductSchema = productSchema.partial().required({ id: true });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/**
 * Схема фильтра товаров
 */
export const productFilterSchema = z.object({
  categorySlug: z.string().optional(),
  brands: z.array(z.string()).optional(),
  priceMin: priceSchema.optional(),
  priceMax: priceSchema.optional(),
  inStock: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isOnSale: z.boolean().optional(),
  search: z.string().optional(),
});

export type ProductFilter = z.infer<typeof productFilterSchema>;

/**
 * Схема сортировки товаров
 */
export const productSortSchema = createSortSchema(['price', 'rating', 'createdAt', 'name'] as const);

export type ProductSort = z.infer<typeof productSortSchema>;

/**
 * Схема параметров запроса списка товаров
 */
export const getProductsRequestSchema = z.object({
  filter: productFilterSchema.optional(),
  sort: productSortSchema.optional(),
}).merge(paginationSchema);

export type GetProductsRequest = z.infer<typeof getProductsRequestSchema>;

/**
 * Схема ответа со списком товаров
 */
export const productListResponseSchema = z.object({
  products: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ProductListResponse = z.infer<typeof productListResponseSchema>;

/**
 * Схема ответа с одним товаром
 */
export const productResponseSchema = z.object({
  product: productSchema,
  relatedProducts: z.array(productSchema),
});

export type ProductResponse = z.infer<typeof productResponseSchema>;

/**
 * Схема поиска товаров
 */
export const searchProductsRequestSchema = z.object({
  query: z.string().min(1, 'Поисковый запрос обязателен'),
  limit: z.number().int().positive().max(50).optional(),
});

export type SearchProductsRequest = z.infer<typeof searchProductsRequestSchema>;

/**
 * DTO карточки товара для списков
 */
export const productCardDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string(),
  price: z.number(),
  oldPrice: z.number().optional(),
  image: z.string(),
  brand: z.string(),
  inStock: z.boolean(),
  rating: z.number(),
  reviewsCount: z.number(),
  isNew: z.boolean().optional(),
  isOnSale: z.boolean().optional(),
});

export type ProductCardDto = z.infer<typeof productCardDtoSchema>;

/**
 * Маппер товара в DTO карточки
 */
export function mapProductToCard(product: Product): ProductCardDto {
  return productCardDtoSchema.parse({
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    price: product.price,
    oldPrice: product.oldPrice,
    image: product.images[0] || '/placeholder-product.jpg',
    brand: product.brand,
    inStock: product.inStock,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    isNew: product.isNew,
    isOnSale: product.isOnSale,
  });
}
