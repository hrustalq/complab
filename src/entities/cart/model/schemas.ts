import { z } from 'zod';
import { priceSchema } from '@/shared/lib/zod-helpers';

/**
 * Схема элемента корзины
 */
export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

/**
 * Расширенная схема элемента корзины с информацией о товаре
 */
export const cartItemWithProductSchema = cartItemSchema.extend({
  name: z.string(),
  price: priceSchema,
  oldPrice: priceSchema.optional(),
  image: z.string(),
  slug: z.string(),
  categorySlug: z.string(),
  inStock: z.boolean(),
  maxQuantity: z.number().int().positive(),
});

export type CartItemWithProduct = z.infer<typeof cartItemWithProductSchema>;

/**
 * Схема корзины
 */
export const cartSchema = z.object({
  items: z.array(cartItemWithProductSchema),
  subtotal: priceSchema,
  discount: z.number().nonnegative().default(0),
  promoCode: z.string().optional(),
  shippingCost: z.number().nonnegative().default(0),
  total: priceSchema,
});

export type Cart = z.infer<typeof cartSchema>;

/**
 * Схема добавления в корзину
 */
export const addToCartRequestSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
});

export type AddToCartRequest = z.infer<typeof addToCartRequestSchema>;

/**
 * Схема обновления количества
 */
export const updateCartItemRequestSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>;

/**
 * Схема удаления из корзины
 */
export const removeFromCartRequestSchema = z.object({
  productId: z.string(),
});

export type RemoveFromCartRequest = z.infer<typeof removeFromCartRequestSchema>;

/**
 * Схема применения промокода
 */
export const applyPromoCodeRequestSchema = z.object({
  code: z.string().min(1, 'Введите промокод'),
});

export type ApplyPromoCodeRequest = z.infer<typeof applyPromoCodeRequestSchema>;
