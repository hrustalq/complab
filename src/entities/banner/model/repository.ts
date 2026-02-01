import { BaseRepository } from '@/shared/repository/base-repository';
import type { DatabaseConnection } from '@/shared/database/types';
import type { PromoBanner } from './schemas';

/**
 * Начальные данные hero баннеров
 */
const initialHeroBanners: PromoBanner[] = [
  {
    id: 'banner-1',
    title: 'Зимняя распродажа',
    subtitle: 'Скидки до 30% на видеокарты',
    description: 'Успейте приобрести топовые видеокарты RTX 4000 по лучшим ценам',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&h=500&fit=crop',
    link: '/catalog/graphics-cards',
    buttonText: 'Смотреть каталог',
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    isActive: true,
    order: 1,
    discountPercent: 30,
  },
  {
    id: 'banner-2',
    title: 'Новые ноутбуки 2024',
    subtitle: 'Игровые и профессиональные модели',
    description: 'Последние модели ASUS ROG, MSI и Apple MacBook уже в продаже',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&h=500&fit=crop',
    link: '/catalog/laptops',
    buttonText: 'Выбрать ноутбук',
    backgroundColor: '#16213e',
    textColor: '#ffffff',
    isActive: true,
    order: 2,
  },
  {
    id: 'banner-3',
    title: 'Профессиональный ремонт',
    subtitle: 'Гарантия на все работы 6 месяцев',
    description: 'Диагностика бесплатно при заказе ремонта',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1200&h=500&fit=crop',
    link: '/repair',
    buttonText: 'Оставить заявку',
    backgroundColor: '#0f3460',
    textColor: '#ffffff',
    isActive: true,
    order: 3,
  },
];

/**
 * Начальные данные промо баннеров
 */
const initialPromoBanners: PromoBanner[] = [
  {
    id: 'promo-1',
    title: 'Сборка ПК под ключ',
    subtitle: 'От 5000₽',
    image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop',
    link: '/services/pc-build',
    buttonText: 'Подробнее',
    isActive: true,
    order: 1,
  },
  {
    id: 'promo-2',
    title: 'Бесплатная доставка',
    subtitle: 'При заказе от 10 000₽',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
    link: '/delivery',
    buttonText: 'Условия',
    isActive: true,
    order: 2,
  },
  {
    id: 'promo-3',
    title: 'Рассрочка 0%',
    subtitle: 'На 12 месяцев',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    link: '/credit',
    buttonText: 'Узнать больше',
    isActive: true,
    order: 3,
  },
];

/**
 * Репозиторий hero баннеров
 */
export class HeroBannerRepository extends BaseRepository<PromoBanner> {
  constructor(db: DatabaseConnection) {
    super(db, initialHeroBanners);
  }

  /**
   * Получить активные баннеры
   */
  async findActive(): Promise<PromoBanner[]> {
    await this.simulateDelay(30);
    return this.data
      .filter((b) => b.isActive)
      .sort((a, b) => a.order - b.order);
  }
}

/**
 * Репозиторий промо баннеров
 */
export class PromoBannerRepository extends BaseRepository<PromoBanner> {
  constructor(db: DatabaseConnection) {
    super(db, initialPromoBanners);
  }

  /**
   * Получить активные баннеры
   */
  async findActive(): Promise<PromoBanner[]> {
    await this.simulateDelay(30);
    return this.data
      .filter((b) => b.isActive)
      .sort((a, b) => a.order - b.order);
  }
}

// Singleton instances
let heroBannerRepoInstance: HeroBannerRepository | null = null;
let promoBannerRepoInstance: PromoBannerRepository | null = null;

export function getHeroBannerRepository(db: DatabaseConnection): HeroBannerRepository {
  if (!heroBannerRepoInstance) {
    heroBannerRepoInstance = new HeroBannerRepository(db);
  }
  return heroBannerRepoInstance;
}

export function getPromoBannerRepository(db: DatabaseConnection): PromoBannerRepository {
  if (!promoBannerRepoInstance) {
    promoBannerRepoInstance = new PromoBannerRepository(db);
  }
  return promoBannerRepoInstance;
}

// Экспорт данных для синхронного использования (legacy)
export const heroBanners = initialHeroBanners;
export const promoBanners = initialPromoBanners;

export function getActiveHeroBanners(): PromoBanner[] {
  return initialHeroBanners.filter((b) => b.isActive).sort((a, b) => a.order - b.order);
}

export function getActivePromoBanners(): PromoBanner[] {
  return initialPromoBanners.filter((b) => b.isActive).sort((a, b) => a.order - b.order);
}
