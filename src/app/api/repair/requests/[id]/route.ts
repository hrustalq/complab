import { NextRequest, NextResponse } from 'next/server';
import { getRepairRequestById, getRepairRequestByNumber } from '@/entities/repair/api/handlers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Try by ID first, then by request number
    let request = await getRepairRequestById(id);

    if (!request) {
      request = await getRepairRequestByNumber(id);
    }

    if (!request) {
      return NextResponse.json(
        { error: 'Repair request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error fetching repair request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repair request' },
      { status: 500 }
    );
  }
}
