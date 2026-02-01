import { z } from 'zod';
import { paginationSchema, booleanString, commaSeparatedArray } from '@/shared/api/search-params';

/**
 * GET /api/products query params
 */
export const getProductsQuerySchema = z.object({
  // Search
  query: z.string().optional(),
  
  // Filters
  featured: booleanString,
  new: booleanString,
  onSale: booleanString,
  all: booleanString,
  inStock: booleanString,
  
  // Category filter
  categorySlug: z.string().optional(),
  
  // Price filter
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  
  // Brand filter (comma-separated)
  brands: commaSeparatedArray,
  
  // Pagination
  ...paginationSchema.shape,
  
  // Sort
  sortBy: z.enum(['price', 'rating', 'createdAt', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;

/**
 * GET /api/products/:id query params
 */
export const getProductByIdQuerySchema = z.object({
  related: booleanString,
  relatedLimit: z.coerce.number().int().min(1).max(20).default(4),
});

export type GetProductByIdQuery = z.infer<typeof getProductByIdQuerySchema>;
