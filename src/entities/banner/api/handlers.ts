import {
  getHeroBannerRepository,
  getPromoBannerRepository,
  getActiveHeroBanners,
  getActivePromoBanners,
} from '../model/repository';
import type { PromoBanner } from '../model/schemas';

const heroBannerRepo = getHeroBannerRepository();
const promoBannerRepo = getPromoBannerRepository();

/**
 * Получить hero баннеры (async)
 */
export async function getHeroBanners(): Promise<PromoBanner[]> {
  return heroBannerRepo.findActive();
}

/**
 * Получить промо баннеры (async)
 */
export async function getPromoBanners(): Promise<PromoBanner[]> {
  return promoBannerRepo.findActive();
}

/**
 * Получить баннер по ID
 */
export async function getBannerById(id: string): Promise<PromoBanner | null> {
  const heroBanner = await heroBannerRepo.findById(id);
  if (heroBanner) return heroBanner;

  return promoBannerRepo.findById(id);
}

/**
 * Получить все баннеры
 */
export async function getAllBanners(): Promise<{ hero: PromoBanner[]; promo: PromoBanner[] }> {
  const [hero, promo] = await Promise.all([
    heroBannerRepo.findActive(),
    promoBannerRepo.findActive(),
  ]);

  return { hero, promo };
}

// Синхронные версии для SSR (legacy)
export { getActiveHeroBanners, getActivePromoBanners };
