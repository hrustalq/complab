import { NextRequest, NextResponse } from 'next/server';
import { markReviewHelpful } from '@/entities/review/api/handlers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const success = await markReviewHelpful(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Review not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking review helpful:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
