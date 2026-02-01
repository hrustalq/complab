import { NextRequest, NextResponse } from 'next/server';
import { getRepairServiceById } from '@/entities/repair/api/handlers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const service = await getRepairServiceById(id);

    if (!service) {
      return NextResponse.json(
        { error: 'Repair service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching repair service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repair service' },
      { status: 500 }
    );
  }
}
