import { PrismaBaseRepository } from '@/shared/repository/base-repository';
import prisma from '@/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';
import type { PaginatedResult } from '@/shared/database/types';
import type { Review, ReviewStats } from './schemas';

/**
 * Тип отзыва из Prisma
 */
type PrismaReview = Prisma.ReviewGetPayload<object>;

/**
 * Преобразовать Prisma Review в схему Review
 */
function mapPrismaReview(review: PrismaReview | null): Review | null {
  if (!review) return null;

  return {
    id: review.id,
    productId: review.productId,
    userId: review.userId,
    userName: review.userName,
    userAvatar: review.userAvatar ?? undefined,
    rating: review.rating,
    title: review.title,
    content: review.content,
    pros: review.pros,
    cons: review.cons,
    isVerified: review.isVerified,
    helpfulCount: review.helpfulCount,
    createdAt: review.createdAt.toISOString(),
  };
}

function mapPrismaReviews(reviews: PrismaReview[]): Review[] {
  return reviews.map((r) => mapPrismaReview(r)!);
}

/**
 * Репозиторий отзывов с Prisma
 */
export class ReviewRepository extends PrismaBaseRepository<
  Review,
  Prisma.ReviewCreateInput,
  Prisma.ReviewUpdateInput
> {
  protected modelName = 'review' as const;

  /**
   * Поиск по ID
   */
  async findById(id: string): Promise<Review | null> {
    const review = await prisma.review.findUnique({
      where: { id },
    });
    return mapPrismaReview(review);
  }

  /**
   * Получить все отзывы
   */
  async findAll(): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return mapPrismaReviews(reviews);
  }

  /**
   * Поиск отзывов по товару
   */
  async findByProductId(productId: string): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    return mapPrismaReviews(reviews);
  }

  /**
   * Получить статистику отзывов товара
   */
  async getStats(productId: string): Promise<ReviewStats> {
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
      totalRating += review.rating;
    });

    return {
      averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution: distribution,
    };
  }

  /**
   * Получить отзывы с сортировкой
   */
  async findByProductIdSorted(
    productId: string,
    sortBy: 'date' | 'rating' | 'helpful' = 'date'
  ): Promise<Review[]> {
    const orderBy: Prisma.ReviewOrderByWithRelationInput =
      sortBy === 'rating'
        ? { rating: 'desc' }
        : sortBy === 'helpful'
          ? { helpfulCount: 'desc' }
          : { createdAt: 'desc' };

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy,
    });
    return mapPrismaReviews(reviews);
  }

  /**
   * Получить отзывы с пагинацией
   */
  async findByProductIdPaginated(
    productId: string,
    pagination: { page: number; limit: number },
    sortBy: 'date' | 'rating' | 'helpful' = 'date'
  ): Promise<PaginatedResult<Review>> {
    const orderBy: Prisma.ReviewOrderByWithRelationInput =
      sortBy === 'rating'
        ? { rating: 'desc' }
        : sortBy === 'helpful'
          ? { helpfulCount: 'desc' }
          : { createdAt: 'desc' };

    const where = { productId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      items: mapPrismaReviews(reviews),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  /**
   * Увеличить счетчик "Полезно"
   */
  async incrementHelpful(reviewId: string): Promise<boolean> {
    try {
      await prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Обновить статистику товара после добавления/удаления отзыва
   */
  async updateProductStats(productId: string): Promise<void> {
    const stats = await this.getStats(productId);

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: stats.averageRating,
        reviewsCount: stats.totalReviews,
      },
    });
  }
}

// Singleton instance
let reviewRepositoryInstance: ReviewRepository | null = null;

export function getReviewRepository(): ReviewRepository {
  if (!reviewRepositoryInstance) {
    reviewRepositoryInstance = new ReviewRepository();
  }
  return reviewRepositoryInstance;
}

// Экспорт хелперов для синхронного использования (legacy)
export const reviews: Review[] = [];

export function getReviewsByProductId(productId: string): Review[] {
  // Legacy sync function - use repository instead
  return reviews.filter((r) => r.productId === productId);
}

export function getReviewStats(productId: string): ReviewStats {
  const productReviews = getReviewsByProductId(productId);

  if (productReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;

  productReviews.forEach((review) => {
    distribution[review.rating as keyof typeof distribution]++;
    totalRating += review.rating;
  });

  return {
    averageRating: Math.round((totalRating / productReviews.length) * 10) / 10,
    totalReviews: productReviews.length,
    ratingDistribution: distribution,
  };
}
