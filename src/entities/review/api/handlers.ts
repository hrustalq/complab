import prisma from '@/lib/prisma';
import {
  getReviewRepository,
  reviews,
  getReviewsByProductId,
  getReviewStats as getReviewStatsSync,
} from '../model/repository';
import {
  createReviewRequestSchema,
  getReviewsParamsSchema,
  type Review,
  type ReviewStats,
  type ReviewListResponse,
} from '../model/schemas';

const reviewRepo = getReviewRepository();

/**
 * Получить отзывы товара (async)
 */
export async function getReviews(params: unknown): Promise<ReviewListResponse> {
  const validatedParams = getReviewsParamsSchema.safeParse(params);

  if (!validatedParams.success) {
    return {
      reviews: [],
      stats: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }

  const { productId, sortBy, page, limit } = validatedParams.data;

  const productReviews = await reviewRepo.findByProductIdSorted(productId, sortBy);
  const stats = await reviewRepo.getStats(productId);

  const total = productReviews.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedReviews = productReviews.slice(startIndex, startIndex + limit);

  return {
    reviews: paginatedReviews,
    stats,
    total,
    page,
    totalPages,
  };
}

/**
 * Получить отзывы по productId (async)
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  return reviewRepo.findByProductId(productId);
}

/**
 * Получить статистику отзывов (async)
 */
export async function getProductReviewStats(productId: string): Promise<ReviewStats> {
  return reviewRepo.getStats(productId);
}

/**
 * Добавить отзыв
 */
export async function addReview(
  userId: string,
  userName: string,
  params: unknown
): Promise<Review | null> {
  const validatedParams = createReviewRequestSchema.safeParse(params);

  if (!validatedParams.success) {
    return null;
  }

  const { productId, rating, title, content, pros, cons } = validatedParams.data;

  // Create using Prisma directly for proper typing
  const newReview = await prisma.review.create({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: userId } },
      userName,
      rating,
      title,
      content,
      pros: pros ?? [],
      cons: cons ?? [],
      isVerified: false,
      helpfulCount: 0,
    },
  });

  // Update product stats
  await reviewRepo.updateProductStats(productId);

  return {
    id: newReview.id,
    productId: newReview.productId,
    userId: newReview.userId,
    userName: newReview.userName,
    userAvatar: newReview.userAvatar ?? undefined,
    rating: newReview.rating,
    title: newReview.title,
    content: newReview.content,
    pros: newReview.pros,
    cons: newReview.cons,
    isVerified: newReview.isVerified,
    helpfulCount: newReview.helpfulCount,
    createdAt: newReview.createdAt.toISOString(),
  };
}

/**
 * Отметить отзыв как полезный
 */
export async function markReviewHelpful(reviewId: string): Promise<boolean> {
  return reviewRepo.incrementHelpful(reviewId);
}

// Синхронные версии (legacy)
export {
  reviews,
  getReviewsByProductId,
  getReviewStatsSync as getReviewStats,
};
