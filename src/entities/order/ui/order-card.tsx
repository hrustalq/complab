import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Order } from '../model/schemas';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../model/schemas';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">
              от {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <Badge className={ORDER_STATUS_COLORS[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Order Items Preview */}
        <div className="mb-4 flex flex-wrap gap-2">
          {order.items.slice(0, 3).map((item) => (
            <div
              key={item.productId}
              className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted/30"
            >
              <Image
                src={item.product.images[0] || '/placeholder-product.jpg'}
                alt={item.product.name}
                fill
                className="object-cover"
              />
              {item.quantity > 1 && (
                <span className="absolute bottom-0 right-0 rounded-tl-lg bg-primary px-1.5 text-xs text-primary-foreground">
                  ×{item.quantity}
                </span>
              )}
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted/50">
              <span className="text-sm text-muted-foreground">
                +{order.items.length - 3}
              </span>
            </div>
          )}
        </div>

        {/* Order Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {order.items.length}{' '}
              {order.items.length === 1
                ? 'товар'
                : order.items.length < 5
                ? 'товара'
                : 'товаров'}
            </p>
            <p className="font-semibold">{formatPrice(order.total)} ₽</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/account/orders/${order.id}`}>
              Подробнее
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <div className="mt-3 rounded-md bg-muted/50 p-3">
            <p className="text-sm">
              <span className="text-muted-foreground">Трек-номер:</span>{' '}
              <span className="font-mono font-medium">{order.trackingNumber}</span>
            </p>
            {order.estimatedDelivery && (
              <p className="text-sm text-muted-foreground">
                Ожидаемая доставка: {formatDate(order.estimatedDelivery)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
