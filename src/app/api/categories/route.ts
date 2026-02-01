import { NextRequest, NextResponse } from 'next/server';
import {
  getCategories,
  getAllCategories,
  getRootCategories,
  getCategoriesFiltered,
} from '@/entities/category/api/handlers';
import { parseSearchParams } from '@/shared/api/search-params';
import { getCategoriesQuerySchema } from './schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(searchParams, getCategoriesQuerySchema);

    // Tree structure (with children)
    if (query.tree) {
      const categories = await getCategories();
      return NextResponse.json({ categories });
    }

    // Root categories only
    if (query.root) {
      const categories = await getRootCategories();
      return NextResponse.json({ categories });
    }

    // Flat list (all categories)
    if (query.all) {
      const categories = await getAllCategories();
      return NextResponse.json({ categories });
    }

    // Filtered categories
    const categories = await getCategoriesFiltered({
      parentId: query.parentId,
      isActive: query.isActive,
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
