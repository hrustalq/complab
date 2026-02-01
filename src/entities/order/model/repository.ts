import { BaseRepository } from '@/shared/repository/base-repository';
import type { DatabaseConnection } from '@/shared/database/types';
import type { Order, OrderStatus } from './schemas';
import { getProductRepository } from '@/entities/product/model/repository';
import { mockAddresses } from '@/entities/user/model/repository';

/**
 * Получить начальные данные заказов
 */
function getInitialOrders(db: DatabaseConnection): Order[] {
  const productRepo = getProductRepository(db);
  
  // Используем синхронный доступ к данным для инициализации
  const products = (productRepo as unknown as { data: { id: string; name: string; slug: string; description: string; shortDescription: string; price: number; oldPrice?: number; images: string[]; categoryId: string; categorySlug: string; brand: string; sku: string; inStock: boolean; stockQuantity: number; specifications: { name: string; value: string; group?: string }[]; rating: number; reviewsCount: number; isNew?: boolean; isFeatured?: boolean; isOnSale?: boolean; createdAt: string }[] }).data;

  return [
    {
      id: 'order-1',
      orderNumber: 'CL-2024-001234',
      userId: 'user-1',
      items: [
        {
          productId: 'prod-1',
          product: products.find((p) => p.id === 'prod-1')!,
          quantity: 1,
          price: 149990,
        },
        {
          productId: 'prod-10',
          product: products.find((p) => p.id === 'prod-10')!,
          quantity: 1,
          price: 17990,
        },
      ],
      status: 'shipped',
      statusHistory: [
        { status: 'pending', timestamp: '2024-01-20T10:00:00Z' },
        { status: 'confirmed', timestamp: '2024-01-20T10:15:00Z', comment: 'Заказ подтвержден' },
        { status: 'processing', timestamp: '2024-01-20T14:00:00Z', comment: 'Заказ комплектуется на складе' },
        { status: 'shipped', timestamp: '2024-01-21T09:00:00Z', comment: 'Заказ передан в службу доставки' },
      ],
      shippingAddress: mockAddresses[0],
      paymentMethod: 'card',
      paymentStatus: 'paid',
      subtotal: 167980,
      shippingCost: 0,
      discount: 0,
      total: 167980,
      trackingNumber: 'SDEK-1234567890',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-21T09:00:00Z',
      estimatedDelivery: '2024-01-25',
    },
    {
      id: 'order-2',
      orderNumber: 'CL-2024-001235',
      userId: 'user-1',
      items: [
        {
          productId: 'prod-9',
          product: products.find((p) => p.id === 'prod-9')!,
          quantity: 2,
          price: 18990,
        },
      ],
      status: 'delivered',
      statusHistory: [
        { status: 'pending', timestamp: '2024-01-10T12:00:00Z' },
        { status: 'confirmed', timestamp: '2024-01-10T12:30:00Z' },
        { status: 'processing', timestamp: '2024-01-10T16:00:00Z' },
        { status: 'shipped', timestamp: '2024-01-11T08:00:00Z' },
        { status: 'out_for_delivery', timestamp: '2024-01-13T09:00:00Z' },
        { status: 'delivered', timestamp: '2024-01-13T14:30:00Z', comment: 'Получено' },
      ],
      shippingAddress: mockAddresses[0],
      paymentMethod: 'online',
      paymentStatus: 'paid',
      subtotal: 37980,
      shippingCost: 500,
      discount: 3798,
      total: 34682,
      promoCode: 'WINTER10',
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2024-01-13T14:30:00Z',
    },
    {
      id: 'order-3',
      orderNumber: 'CL-2024-001236',
      userId: 'user-1',
      items: [
        {
          productId: 'prod-5',
          product: products.find((p) => p.id === 'prod-5')!,
          quantity: 1,
          price: 54990,
        },
        {
          productId: 'prod-12',
          product: products.find((p) => p.id === 'prod-12')!,
          quantity: 1,
          price: 21990,
        },
      ],
      status: 'processing',
      statusHistory: [
        { status: 'pending', timestamp: '2024-01-28T15:00:00Z' },
        { status: 'confirmed', timestamp: '2024-01-28T15:20:00Z' },
        { status: 'processing', timestamp: '2024-01-28T17:00:00Z' },
      ],
      shippingAddress: mockAddresses[1],
      paymentMethod: 'card',
      paymentStatus: 'paid',
      subtotal: 76980,
      shippingCost: 0,
      discount: 0,
      total: 76980,
      createdAt: '2024-01-28T15:00:00Z',
      updatedAt: '2024-01-28T17:00:00Z',
      estimatedDelivery: '2024-02-02',
    },
  ];
}

/**
 * Репозиторий заказов
 */
export class OrderRepository extends BaseRepository<Order> {
  constructor(db: DatabaseConnection) {
    super(db, getInitialOrders(db));
  }

  /**
   * Поиск заказов пользователя
   */
  async findByUserId(userId: string): Promise<Order[]> {
    await this.simulateDelay();
    return this.data.filter((o) => o.userId === userId);
  }

  /**
   * Поиск по номеру заказа
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    await this.simulateDelay();
    return this.data.find((o) => o.orderNumber === orderNumber) ?? null;
  }

  /**
   * Поиск заказов пользователя по статусу
   */
  async findByUserIdAndStatus(userId: string, status: OrderStatus): Promise<Order[]> {
    await this.simulateDelay();
    return this.data.filter((o) => o.userId === userId && o.status === status);
  }

  /**
   * Обновить статус заказа
   */
  async updateStatus(orderId: string, status: OrderStatus, comment?: string): Promise<Order | null> {
    await this.simulateDelay();
    const order = this.data.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      comment,
    });
    order.updatedAt = new Date().toISOString();

    return order;
  }

  /**
   * Генерация номера заказа
   */
  generateOrderNumber(): string {
    return 'CL-2024-' + String(Date.now()).slice(-6);
  }
}

// Промокоды
const promoCodes: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
  WINTER10: { discount: 10, type: 'percentage' },
  WELCOME500: { discount: 500, type: 'fixed' },
  SALE15: { discount: 15, type: 'percentage' },
};

/**
 * Валидация промокода
 */
export function validatePromoCode(code: string): {
  valid: boolean;
  discount: number;
  discountType: 'percentage' | 'fixed';
  message?: string;
} {
  const promo = promoCodes[code.toUpperCase()];

  if (promo) {
    return {
      valid: true,
      discount: promo.discount,
      discountType: promo.type,
      message:
        promo.type === 'percentage'
          ? `Скидка ${promo.discount}% применена!`
          : `Скидка ${promo.discount}₽ применена!`,
    };
  }

  return {
    valid: false,
    discount: 0,
    discountType: 'fixed',
    message: 'Промокод недействителен',
  };
}

// Singleton instance
let orderRepositoryInstance: OrderRepository | null = null;

export function getOrderRepository(db: DatabaseConnection): OrderRepository {
  if (!orderRepositoryInstance) {
    orderRepositoryInstance = new OrderRepository(db);
  }
  return orderRepositoryInstance;
}

// Экспорт mock данных для использования в UI
export const mockOrders = (db: DatabaseConnection) => getInitialOrders(db);
