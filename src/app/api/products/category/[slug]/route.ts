import { NextRequest, NextResponse } from 'next/server';
import { getProductsByCategorySlug } from '@/entities/product/api/handlers';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const products = await getProductsByCategorySlug(slug);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
