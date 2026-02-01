import { NextRequest, NextResponse } from 'next/server';
import {
  getRepairServices,
  getPopularServicesAsync,
  getRepairServicesByCategoryAsync,
} from '@/entities/repair/api/handlers';
import { parseSearchParams } from '@/shared/api/search-params';
import { getRepairServicesQuerySchema } from '../schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(searchParams, getRepairServicesQuerySchema);

    // Popular services only
    if (query.popular) {
      const services = await getPopularServicesAsync();
      return NextResponse.json({ services });
    }

    // By category
    if (query.category) {
      const services = await getRepairServicesByCategoryAsync(query.category);
      return NextResponse.json({ services });
    }

    // All services
    const services = await getRepairServices();
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching repair services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repair services' },
      { status: 500 }
    );
  }
}
