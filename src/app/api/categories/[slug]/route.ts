import { NextRequest, NextResponse } from 'next/server';
import {
  getCategoryBySlug,
  getCategoryBreadcrumbs,
  getCategoryChildren,
} from '@/entities/category/api/handlers';
import { parseSearchParams } from '@/shared/api/search-params';
import { getCategoryBySlugQuerySchema } from '../schemas';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(searchParams, getCategoryBySlugQuerySchema);

    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Include breadcrumbs
    if (query.breadcrumbs) {
      const breadcrumbs = await getCategoryBreadcrumbs(category.id);
      return NextResponse.json({ category, breadcrumbs });
    }

    // Include children
    if (query.children) {
      const children = await getCategoryChildren(category.id);
      return NextResponse.json({ category, children });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
