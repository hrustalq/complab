import { z } from 'zod';

/**
 * Схема баннера
 */
export const bannerSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Заголовок обязателен'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url(),
  mobileImage: z.string().url().optional(),
  link: z.string(),
  buttonText: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type Banner = z.infer<typeof bannerSchema>;

/**
 * Схема промо-баннера
 */
export const promoBannerSchema = bannerSchema.extend({
  discountPercent: z.number().int().min(0).max(100).optional(),
  promoCode: z.string().optional(),
});

export type PromoBanner = z.infer<typeof promoBannerSchema>;

/**
 * Схема создания баннера
 */
export const createBannerSchema = bannerSchema.omit({ id: true });

export type CreateBannerInput = z.infer<typeof createBannerSchema>;

/**
 * Схема обновления баннера
 */
export const updateBannerSchema = bannerSchema.partial().required({ id: true });

export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
