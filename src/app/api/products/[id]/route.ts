import { NextRequest, NextResponse } from 'next/server';
import { getProductById, getRelatedProducts } from '@/entities/product/api/handlers';
import { parseSearchParams } from '@/shared/api/search-params';
import { getProductByIdQuerySchema } from '../schemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(searchParams, getProductByIdQuerySchema);

    // Get related products
    if (query.related) {
      const products = await getRelatedProducts(id, query.relatedLimit);
      return NextResponse.json({ products });
    }

    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
