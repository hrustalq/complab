import type { Order } from './schemas';
import { mockAddresses } from '@/entities/user/model/mocks';

/**
 * Mock данные заказов для демо/UI компонентов
 */
export const mockOrders = (): Order[] => [
  {
    id: 'order-1',
    orderNumber: 'CL-2024-001234',
    userId: 'user-1',
    items: [],
    status: 'shipped',
    statusHistory: [
      { status: 'pending', timestamp: '2024-01-20T10:00:00Z' },
      { status: 'confirmed', timestamp: '2024-01-20T10:15:00Z', comment: 'Заказ подтвержден' },
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
];
