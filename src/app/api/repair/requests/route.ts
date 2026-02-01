import { NextRequest, NextResponse } from 'next/server';
import {
  getRepairRequests,
  createRepairRequest,
} from '@/entities/repair/api/handlers';
import { createRepairRequestSchema } from '@/entities/repair/model/schemas';
import { parseSearchParamsStrict } from '@/shared/api/search-params';
import { getRepairRequestsQuerySchema } from '../schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = parseSearchParamsStrict(searchParams, getRepairRequestsQuerySchema);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    const query = result.data;
    const requests = await getRepairRequests(query.userId);
    
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching repair requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repair requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...requestData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const validated = createRepairRequestSchema.safeParse(requestData);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.issues },
        { status: 400 }
      );
    }

    const repairRequest = await createRepairRequest(userId, validated.data);

    if (!repairRequest) {
      return NextResponse.json(
        { error: 'Failed to create repair request' },
        { status: 500 }
      );
    }

    return NextResponse.json(repairRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating repair request:', error);
    return NextResponse.json(
      { error: 'Failed to create repair request' },
      { status: 500 }
    );
  }
}
