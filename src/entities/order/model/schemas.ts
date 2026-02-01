import { z } from 'zod';
import { paginationSchema, priceSchema } from '@/shared/lib/zod-helpers';
import { productSchema } from '@/entities/product/model/schemas';
import { addressSchema } from '@/entities/user/model/schemas';

/**
 * Статусы заказа
 */
export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтвержден',
  processing: 'Комплектуется',
  shipped: 'Отправлен',
  out_for_delivery: 'В пути к получателю',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
  returned: 'Возврат',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-chart-4/15 text-chart-4',
  confirmed: 'bg-primary/15 text-primary',
  processing: 'bg-chart-2/15 text-chart-2',
  shipped: 'bg-chart-5/15 text-chart-5',
  out_for_delivery: 'bg-chart-1/15 text-chart-1',
  delivered: 'bg-chart-3/15 text-chart-3',
  cancelled: 'bg-destructive/15 text-destructive',
  returned: 'bg-muted text-muted-foreground',
};

/**
 * Способы оплаты
 */
export const paymentMethodSchema = z.enum(['card', 'cash', 'online']);

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

/**
 * Статус оплаты
 */
export const paymentStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded']);

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

/**
 * Схема истории статуса
 */
export const orderStatusHistorySchema = z.object({
  status: orderStatusSchema,
  timestamp: z.string(),
  comment: z.string().optional(),
});

export type OrderStatusHistory = z.infer<typeof orderStatusHistorySchema>;

/**
 * Схема товара в заказе
 */
export const orderItemSchema = z.object({
  productId: z.string(),
  product: productSchema,
  quantity: z.number().int().positive(),
  price: priceSchema,
});

export type OrderItem = z.infer<typeof orderItemSchema>;

/**
 * Схема заказа
 */
export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string(),
  items: z.array(orderItemSchema),
  status: orderStatusSchema,
  statusHistory: z.array(orderStatusHistorySchema),
  shippingAddress: addressSchema,
  paymentMethod: paymentMethodSchema,
  paymentStatus: paymentStatusSchema,
  subtotal: priceSchema,
  shippingCost: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  total: priceSchema,
  promoCode: z.string().optional(),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  estimatedDelivery: z.string().optional(),
});

export type Order = z.infer<typeof orderSchema>;

/**
 * Схема создания заказа
 */
export const createOrderRequestSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  shippingAddressId: z.string(),
  paymentMethod: paymentMethodSchema,
  promoCode: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

/**
 * Схема запроса списка заказов
 */
export const getOrdersRequestSchema = z.object({
  userId: z.string(),
  status: orderStatusSchema.optional(),
}).merge(paginationSchema);

export type GetOrdersRequest = z.infer<typeof getOrdersRequestSchema>;

/**
 * Схема ответа со списком заказов
 */
export const orderListResponseSchema = z.object({
  orders: z.array(orderSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

export type OrderListResponse = z.infer<typeof orderListResponseSchema>;

/**
 * Схема проверки промокода
 */
export const validatePromoCodeResponseSchema = z.object({
  valid: z.boolean(),
  discount: z.number(),
  discountType: z.enum(['percentage', 'fixed']),
  message: z.string().optional(),
});

export type ValidatePromoCodeResponse = z.infer<typeof validatePromoCodeResponseSchema>;
