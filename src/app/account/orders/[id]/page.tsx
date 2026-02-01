'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, MapPin, CreditCard, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OrderStatusTimeline } from '@/entities/order/ui/order-status-timeline';
import { useUserStore } from '@/entities/user/model/store';
import { mockUser } from '@/entities/user/model/repository';
import { getOrderRepository } from '@/entities/order/model/repository';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/entities/order/model/schemas';
import { db } from '@/shared/database/in-memory-connection';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const { isAuthenticated, login } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<Awaited<ReturnType<typeof getOrderRepository>>['data'][number] | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      login(mockUser);
    }
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [isAuthenticated, login]);

  useEffect(() => {
    if (mounted) {
      const orderRepo = getOrderRepository(db);
      orderRepo.findById(id).then(setOrder);
    }
  }, [id, mounted]);

  if (!mounted) {
    return (
      <div className="container py-8">
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!order) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Главная
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/account" className="hover:text-foreground">
          Личный кабинет
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/account/orders" className="hover:text-foreground">
          Мои заказы
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{order.orderNumber}</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{order.orderNumber}</h1>
          <p className="text-muted-foreground">от {formatDate(order.createdAt)}</p>
        </div>
        <Badge className={`text-sm ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Статус заказа</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusTimeline
                statusHistory={order.statusHistory}
                currentStatus={order.status}
              />
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle>Отслеживание доставки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Трек-номер</p>
                    <p className="font-mono font-semibold">{order.trackingNumber}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Отследить посылку
                  </Button>
                </div>
                {order.estimatedDelivery && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Ожидаемая дата доставки:{' '}
                    <span className="font-medium text-foreground">
                      {new Date(order.estimatedDelivery).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Товары в заказе</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {order.items.map((item) => (
                <div key={item.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <Link
                    href={`/catalog/${item.product.categorySlug}/${item.product.slug}`}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted/30"
                  >
                    <Image
                      src={item.product.images[0] || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/catalog/${item.product.categorySlug}/${item.product.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {item.quantity} × {formatPrice(item.price)} ₽
                      </span>
                      <span className="font-semibold">
                        {formatPrice(item.price * item.quantity)} ₽
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Сумма заказа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Товары</span>
                <span>{formatPrice(order.subtotal)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доставка</span>
                <span>
                  {order.shippingCost === 0 ? (
                    <span className="text-emerald-600">Бесплатно</span>
                  ) : (
                    `${formatPrice(order.shippingCost)} ₽`
                  )}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Скидка</span>
                  <span className="text-emerald-600">
                    -{formatPrice(order.discount)} ₽
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Итого</span>
                <span>{formatPrice(order.total)} ₽</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Адрес доставки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.street}, д.{' '}
                {order.shippingAddress.building}
                {order.shippingAddress.apartment &&
                  `, кв. ${order.shippingAddress.apartment}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.postalCode}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {order.shippingAddress.phone}
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Оплата
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {order.paymentMethod === 'card' && 'Банковская карта'}
                {order.paymentMethod === 'online' && 'Онлайн-оплата'}
                {order.paymentMethod === 'cash' && 'При получении'}
              </p>
              <p className="text-sm text-muted-foreground">
                Статус:{' '}
                <span
                  className={
                    order.paymentStatus === 'paid'
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }
                >
                  {order.paymentStatus === 'paid' ? 'Оплачено' : 'Ожидает оплаты'}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              Повторить заказ
            </Button>
            <Button variant="ghost" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Связаться с поддержкой
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
