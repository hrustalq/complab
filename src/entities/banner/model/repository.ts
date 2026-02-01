import { PrismaBaseRepository } from '@/shared/repository/base-repository';
import prisma from '@/lib/prisma';
import type { Prisma, BannerType } from '@/app/generated/prisma/client';
import type { PromoBanner } from './schemas';

/**
 * Тип баннера из Prisma
 */
type PrismaBanner = Prisma.BannerGetPayload<object>;

/**
 * Преобразовать Prisma Banner в схему PromoBanner
 */
function mapPrismaBanner(banner: PrismaBanner | null): PromoBanner | null {
  if (!banner) return null;

  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle ?? undefined,
    description: banner.description ?? undefined,
    image: banner.image,
    mobileImage: banner.mobileImage ?? undefined,
    link: banner.link,
    buttonText: banner.buttonText ?? undefined,
    backgroundColor: banner.backgroundColor ?? undefined,
    textColor: banner.textColor ?? undefined,
    isActive: banner.isActive,
    order: banner.order,
    startDate: banner.startDate?.toISOString(),
    endDate: banner.endDate?.toISOString(),
    discountPercent: banner.discountPercent ?? undefined,
    promoCode: banner.promoCode ?? undefined,
  };
}

function mapPrismaBanners(banners: PrismaBanner[]): PromoBanner[] {
  return banners.map((b) => mapPrismaBanner(b)!);
}

/**
 * Базовый репозиторий баннеров
 */
abstract class BaseBannerRepository extends PrismaBaseRepository<
  PromoBanner,
  Prisma.BannerCreateInput,
  Prisma.BannerUpdateInput
> {
  protected modelName = 'banner' as const;
  protected abstract bannerType: BannerType;

  /**
   * Получить активные баннеры
   */
  async findActive(): Promise<PromoBanner[]> {
    const now = new Date();
    const banners = await prisma.banner.findMany({
      where: {
        type: this.bannerType,
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { order: 'asc' },
    });
    return mapPrismaBanners(banners);
  }

  /**
   * Получить все баннеры данного типа
   */
  async findAll(): Promise<PromoBanner[]> {
    const banners = await prisma.banner.findMany({
      where: { type: this.bannerType },
      orderBy: { order: 'asc' },
    });
    return mapPrismaBanners(banners);
  }

  /**
   * Поиск по ID
   */
  async findById(id: string): Promise<PromoBanner | null> {
    const banner = await prisma.banner.findUnique({
      where: { id },
    });
    if (banner?.type !== this.bannerType) return null;
    return mapPrismaBanner(banner);
  }
}

/**
 * Репозиторий hero баннеров
 */
export class HeroBannerRepository extends BaseBannerRepository {
  protected bannerType: BannerType = 'HERO';
}

/**
 * Репозиторий промо баннеров
 */
export class PromoBannerRepository extends BaseBannerRepository {
  protected bannerType: BannerType = 'PROMO';
}

// Singleton instances
let heroBannerRepoInstance: HeroBannerRepository | null = null;
let promoBannerRepoInstance: PromoBannerRepository | null = null;

export function getHeroBannerRepository(): HeroBannerRepository {
  if (!heroBannerRepoInstance) {
    heroBannerRepoInstance = new HeroBannerRepository();
  }
  return heroBannerRepoInstance;
}

export function getPromoBannerRepository(): PromoBannerRepository {
  if (!promoBannerRepoInstance) {
    promoBannerRepoInstance = new PromoBannerRepository();
  }
  return promoBannerRepoInstance;
}

// Экспорт данных для синхронного использования (legacy)
export const heroBanners: PromoBanner[] = [
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

export const promoBanners: PromoBanner[] = [
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

export function getActiveHeroBanners(): PromoBanner[] {
  return heroBanners.filter((b) => b.isActive).sort((a, b) => a.order - b.order);
}

export function getActivePromoBanners(): PromoBanner[] {
  return promoBanners.filter((b) => b.isActive).sort((a, b) => a.order - b.order);
}
