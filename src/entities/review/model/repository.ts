import { BaseRepository } from '@/shared/repository/base-repository';
import type { DatabaseConnection } from '@/shared/database/types';
import type { Review, ReviewStats } from './schemas';

/**
 * Начальные данные отзывов
 */
const initialReviews: Review[] = [
  {
    id: 'review-1',
    productId: 'prod-1',
    userId: 'user-2',
    userName: 'Алексей К.',
    rating: 5,
    title: 'Отличный игровой ноутбук!',
    content: 'Купил для игр и работы с 3D графикой. Очень доволен производительностью. RTX 4060 тянет все современные игры на высоких настройках.',
    pros: ['Мощная видеокарта', 'Качественный экран', 'Хорошее охлаждение'],
    cons: ['Тяжеловат для переноски'],
    isVerified: true,
    helpfulCount: 24,
    createdAt: '2024-01-18T10:00:00Z',
  },
  {
    id: 'review-2',
    productId: 'prod-1',
    userId: 'user-3',
    userName: 'Мария П.',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50',
    rating: 4,
    title: 'Хороший выбор за свои деньги',
    content: 'Ноутбук справляется со всеми задачами. Единственное - батарея держит не очень долго при высокой нагрузке.',
    pros: ['Производительность', 'Дизайн', 'Клавиатура с RGB'],
    cons: ['Время работы от батареи'],
    isVerified: true,
    helpfulCount: 15,
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'review-3',
    productId: 'prod-3',
    userId: 'user-4',
    userName: 'Дмитрий С.',
    rating: 5,
    title: 'Топ за свои деньги',
    content: 'Отличная видеокарта для 4K гейминга. Все игры летают на ультра настройках.',
    pros: ['Производительность в играх', 'DLSS 3', 'Ray Tracing'],
    cons: [],
    isVerified: true,
    helpfulCount: 45,
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'review-4',
    productId: 'prod-9',
    userId: 'user-5',
    userName: 'Игорь В.',
    rating: 5,
    title: 'Невероятная скорость!',
    content: 'После HDD это просто космос. Система грузится за секунды, игры загружаются мгновенно.',
    pros: ['Скорость чтения/записи', 'Надежность', 'Температурный режим'],
    cons: [],
    isVerified: true,
    helpfulCount: 67,
    createdAt: '2024-01-22T16:00:00Z',
  },
];

/**
 * Репозиторий отзывов
 */
export class ReviewRepository extends BaseRepository<Review> {
  constructor(db: DatabaseConnection) {
    super(db, initialReviews);
  }

  /**
   * Поиск отзывов по товару
   */
  async findByProductId(productId: string): Promise<Review[]> {
    await this.simulateDelay();
    return this.data.filter((r) => r.productId === productId);
  }

  /**
   * Получить статистику отзывов товара
   */
  async getStats(productId: string): Promise<ReviewStats> {
    await this.simulateDelay();
    const productReviews = this.data.filter((r) => r.productId === productId);

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

  /**
   * Получить отзывы с сортировкой
   */
  async findByProductIdSorted(
    productId: string,
    sortBy: 'date' | 'rating' | 'helpful' = 'date'
  ): Promise<Review[]> {
    await this.simulateDelay();
    let reviews = this.data.filter((r) => r.productId === productId);

    switch (sortBy) {
      case 'rating':
        reviews = [...reviews].sort((a, b) => b.rating - a.rating);
        break;
      case 'helpful':
        reviews = [...reviews].sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case 'date':
      default:
        reviews = [...reviews].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return reviews;
  }

  /**
   * Увеличить счетчик "Полезно"
   */
  async incrementHelpful(reviewId: string): Promise<boolean> {
    await this.simulateDelay();
    const review = this.data.find((r) => r.id === reviewId);
    if (!review) return false;
    review.helpfulCount++;
    return true;
  }
}

// Singleton instance
let reviewRepositoryInstance: ReviewRepository | null = null;

export function getReviewRepository(db: DatabaseConnection): ReviewRepository {
  if (!reviewRepositoryInstance) {
    reviewRepositoryInstance = new ReviewRepository(db);
  }
  return reviewRepositoryInstance;
}

// Экспорт данных для синхронного использования
export const reviews = initialReviews;

export function getReviewsByProductId(productId: string): Review[] {
  return initialReviews.filter((r) => r.productId === productId);
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
