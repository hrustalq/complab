import { NextRequest, NextResponse } from 'next/server';
import {
  getProducts,
  getAllProducts,
  getFeaturedProducts,
  getNewProducts,
  getOnSaleProducts,
  searchProducts,
} from '@/entities/product/api/handlers';
import { parseSearchParams } from '@/shared/api/search-params';
import { getProductsQuerySchema } from './schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(searchParams, getProductsQuerySchema);

    // Search query
    if (query.query) {
      const products = await searchProducts({
        query: query.query,
        limit: query.limit,
      });
      return NextResponse.json({ products });
    }

    // Featured products
    if (query.featured) {
      const products = await getFeaturedProducts(query.limit);
      return NextResponse.json({ products });
    }

    // New products
    if (query.new) {
      const products = await getNewProducts(query.limit);
      return NextResponse.json({ products });
    }

    // On sale products
    if (query.onSale) {
      const products = await getOnSaleProducts(query.limit);
      return NextResponse.json({ products });
    }

    // All products without filters
    if (query.all) {
      const products = await getAllProducts();
      return NextResponse.json({ products });
    }

    // Products with filters/pagination
    const result = await getProducts({
      filter: {
        categorySlug: query.categorySlug,
        priceMin: query.priceMin,
        priceMax: query.priceMax,
        brands: query.brands,
        inStock: query.inStock,
      },
      sort: query.sortBy
        ? { field: query.sortBy, direction: query.sortOrder }
        : undefined,
      page: query.page,
      limit: query.limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
