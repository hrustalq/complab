import { PrismaBaseRepository } from '@/shared/repository/base-repository';
import prisma from '@/lib/prisma';
import type {
  Prisma,
  OrderStatus as PrismaOrderStatus,
  PaymentMethod as PrismaPaymentMethod,
  PaymentStatus as PrismaPaymentStatus,
} from '@/app/generated/prisma/client';
import type { PaginatedResult } from '@/shared/database/types';
import type { Order, OrderStatus, OrderStatusHistory } from './schemas';
import { mockAddresses } from '@/entities/user/model/mocks';

/**
 * Типы из Prisma
 */
type PrismaOrder = Prisma.OrderGetPayload<{
  include: {
    user: true;
    shippingAddress: true;
    items: { include: { product: { include: { category: true } } } };
  };
}>;

/**
 * Маппинг статусов заказа Prisma -> App
 */
const statusPrismaToApp: Record<PrismaOrderStatus, OrderStatus> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
};

const statusAppToPrisma: Record<OrderStatus, PrismaOrderStatus> = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  processing: 'PROCESSING',
  shipped: 'SHIPPED',
  out_for_delivery: 'OUT_FOR_DELIVERY',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
  returned: 'RETURNED',
};

const paymentMethodPrismaToApp: Record<PrismaPaymentMethod, 'card' | 'cash' | 'online'> = {
  CARD: 'card',
  CASH: 'cash',
  ONLINE: 'online',
};

const paymentStatusPrismaToApp: Record<PrismaPaymentStatus, 'pending' | 'paid' | 'failed' | 'refunded'> = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

/**
 * Преобразовать Prisma Order в схему Order
 */
function mapPrismaOrder(order: PrismaOrder | null): Order | null {
  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    items: order.items.map((item) => ({
      productId: item.productId,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        description: item.product.description,
        shortDescription: item.product.shortDescription,
        price: Number(item.product.price),
        oldPrice: item.product.oldPrice ? Number(item.product.oldPrice) : undefined,
        images: item.product.images,
        categoryId: item.product.categoryId,
        categorySlug: item.product.category?.slug ?? '',
        brand: item.product.brand,
        sku: item.product.sku,
        inStock: item.product.inStock,
        stockQuantity: item.product.stockQuantity,
        specifications: item.product.specifications as { name: string; value: string; group?: string }[],
        rating: Number(item.product.rating),
        reviewsCount: item.product.reviewsCount,
        isNew: item.product.isNew,
        isFeatured: item.product.isFeatured,
        isOnSale: item.product.isOnSale,
        createdAt: item.product.createdAt.toISOString().split('T')[0],
      },
      quantity: item.quantity,
      price: Number(item.price),
    })),
    status: statusPrismaToApp[order.status],
    statusHistory: order.statusHistory as OrderStatusHistory[],
    shippingAddress: {
      id: order.shippingAddress.id,
      userId: order.shippingAddress.userId,
      title: order.shippingAddress.title,
      fullName: order.shippingAddress.fullName,
      phone: order.shippingAddress.phone,
      city: order.shippingAddress.city,
      street: order.shippingAddress.street,
      building: order.shippingAddress.building,
      apartment: order.shippingAddress.apartment ?? undefined,
      postalCode: order.shippingAddress.postalCode,
      isDefault: order.shippingAddress.isDefault,
    },
    paymentMethod: paymentMethodPrismaToApp[order.paymentMethod],
    paymentStatus: paymentStatusPrismaToApp[order.paymentStatus],
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discount),
    total: Number(order.total),
    promoCode: order.promoCode ?? undefined,
    notes: order.notes ?? undefined,
    trackingNumber: order.trackingNumber ?? undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    estimatedDelivery: order.estimatedDelivery?.toISOString().split('T')[0],
  };
}

function mapPrismaOrders(orders: PrismaOrder[]): Order[] {
  return orders.map((o) => mapPrismaOrder(o)!);
}

/**
 * Репозиторий заказов с Prisma
 */
export class OrderRepository extends PrismaBaseRepository<
  Order,
  Prisma.OrderCreateInput,
  Prisma.OrderUpdateInput
> {
  protected modelName = 'order' as const;

  private includeRelations = {
    user: true,
    shippingAddress: true,
    items: {
      include: {
        product: { include: { category: true } },
      },
    },
  } as const;

  /**
   * Поиск по ID
   */
  async findById(id: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: this.includeRelations,
    });
    return mapPrismaOrder(order as PrismaOrder | null);
  }

  /**
   * Поиск заказов пользователя
   */
  async findByUserId(userId: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return mapPrismaOrders(orders as PrismaOrder[]);
  }

  /**
   * Поиск по номеру заказа
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: this.includeRelations,
    });
    return mapPrismaOrder(order as PrismaOrder | null);
  }

  /**
   * Поиск заказов пользователя по статусу
   */
  async findByUserIdAndStatus(userId: string, status: OrderStatus): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { userId, status: statusAppToPrisma[status] },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return mapPrismaOrders(orders as PrismaOrder[]);
  }

  /**
   * Поиск с пагинацией
   */
  async findWithPaginationByUser(
    userId: string,
    pagination: { page: number; limit: number },
    status?: OrderStatus
  ): Promise<PaginatedResult<Order>> {
    const where: Prisma.OrderWhereInput = {
      userId,
      ...(status && { status: statusAppToPrisma[status] }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: this.includeRelations,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items: mapPrismaOrders(orders as PrismaOrder[]),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  /**
   * Обновить статус заказа
   */
  async updateStatus(orderId: string, status: OrderStatus, comment?: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { statusHistory: true },
    });

    if (!order) return null;

    const statusHistory = order.statusHistory as OrderStatusHistory[];
    statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      ...(comment && { comment }),
    });

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: statusAppToPrisma[status],
        statusHistory,
      },
      include: this.includeRelations,
    });

    return mapPrismaOrder(updated as PrismaOrder);
  }

  /**
   * Генерация номера заказа
   */
  generateOrderNumber(): string {
    return 'CL-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);
  }
}

// Промокоды
const promoCodes: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
  WINTER10: { discount: 10, type: 'percentage' },
  WELCOME500: { discount: 500, type: 'fixed' },
  SALE15: { discount: 15, type: 'percentage' },
};

/**
 * Валидация промокода (временно in-memory, потом из БД)
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

export function getOrderRepository(): OrderRepository {
  if (!orderRepositoryInstance) {
    orderRepositoryInstance = new OrderRepository();
  }
  return orderRepositoryInstance;
}

// Mock данные реэкспортируются из отдельного файла для клиентских компонентов
export { mockOrders } from './mocks';
