import { NextRequest, NextResponse } from 'next/server';
import {
  getHeroBanners,
  getPromoBanners,
  getAllBanners,
} from '@/entities/banner/api/handlers';
import { parseSearchParams } from '@/shared/api/search-params';
import { getBannersQuerySchema } from './schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(searchParams, getBannersQuerySchema);

    // Hero banners only
    if (query.type === 'hero') {
      const banners = await getHeroBanners();
      return NextResponse.json({ banners });
    }

    // Promo banners only
    if (query.type === 'promo') {
      const banners = await getPromoBanners();
      return NextResponse.json({ banners });
    }

    // All banners
    const result = await getAllBanners();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}
