import { NextRequest, NextResponse } from 'next/server';
import {
  getReviews,
  getProductReviews,
  getProductReviewStats,
  addReview,
} from '@/entities/review/api/handlers';
import { parseSearchParamsStrict } from '@/shared/api/search-params';
import { getReviewsQuerySchema, createReviewBodySchema } from './schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = parseSearchParamsStrict(searchParams, getReviewsQuerySchema);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    const query = result.data;

    // Stats only
    if (query.stats) {
      const stats = await getProductReviewStats(query.productId);
      return NextResponse.json({ stats });
    }

    // Simple list without pagination
    if (query.simple) {
      const reviews = await getProductReviews(query.productId);
      return NextResponse.json({ reviews });
    }

    // With pagination and stats
    const reviewsResult = await getReviews({
      productId: query.productId,
      sortBy: query.sortBy,
      page: query.page,
      limit: query.limit,
    });

    return NextResponse.json(reviewsResult);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validated = createReviewBodySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { userId, userName, ...reviewData } = validated.data;

    const review = await addReview(userId, userName, reviewData);

    if (!review) {
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
