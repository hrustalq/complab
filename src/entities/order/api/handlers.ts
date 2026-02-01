import { getOrderRepository, validatePromoCode } from '../model/repository';
import {
  createOrderRequestSchema,
  getOrdersRequestSchema,
  type Order,
  type OrderListResponse,
  type OrderStatus,
  type ValidatePromoCodeResponse,
} from '../model/schemas';

const orderRepo = getOrderRepository();

/**
 * Получить заказы пользователя
 */
export async function getOrders(params: unknown): Promise<OrderListResponse> {
  const validatedParams = getOrdersRequestSchema.safeParse(params);

  if (!validatedParams.success) {
    return {
      orders: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }

  const { userId, status, page, limit } = validatedParams.data;

  let orders: Order[];

  if (status) {
    orders = await orderRepo.findByUserIdAndStatus(userId, status);
  } else {
    orders = await orderRepo.findByUserId(userId);
  }

  // Простая пагинация
  const total = orders.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedOrders = orders.slice(startIndex, startIndex + limit);

  return {
    orders: paginatedOrders,
    total,
    page,
    totalPages,
  };
}

/**
 * Получить заказ по ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  return orderRepo.findById(orderId);
}

/**
 * Получить заказ по номеру
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  return orderRepo.findByOrderNumber(orderNumber);
}

/**
 * Получить заказы пользователя (упрощенный)
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  return orderRepo.findByUserId(userId);
}

/**
 * Создать заказ
 */
export async function createOrder(userId: string, params: unknown): Promise<Order | null> {
  const validatedParams = createOrderRequestSchema.safeParse(params);

  if (!validatedParams.success) {
    return null;
  }

  const { items, shippingAddressId, paymentMethod, promoCode, notes } = validatedParams.data;

  // В реальном приложении здесь будет:
  // 1. Получение товаров и проверка наличия
  // 2. Получение адреса доставки
  // 3. Расчет стоимости
  // 4. Создание заказа

  // Пока возвращаем null - заглушка
  console.log('Creating order:', { userId, items, shippingAddressId, paymentMethod, promoCode, notes });
  return null;
}

/**
 * Обновить статус заказа
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  comment?: string
): Promise<Order | null> {
  return orderRepo.updateStatus(orderId, status, comment);
}

/**
 * Проверить промокод
 */
export function checkPromoCode(code: string): ValidatePromoCodeResponse {
  return validatePromoCode(code);
}

// Re-export для удобства
export { validatePromoCode };
