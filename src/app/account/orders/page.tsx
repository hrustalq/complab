'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/entities/order/ui/order-card';
import { useUserStore } from '@/entities/user/model/store';
import { mockUser } from '@/entities/user/model/mocks';
import { mockOrders } from '@/entities/order/model/mocks';

export default function OrdersPage() {
  const { isAuthenticated, login } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      login(mockUser);
    }
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [isAuthenticated, login]);

  if (!mounted) {
    return (
      <div className="container py-8">
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const orders = mockOrders();
  const activeOrders = orders.filter(
    (o) => !['delivered', 'cancelled', 'returned'].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === 'delivered');
  const cancelledOrders = orders.filter(
    (o) => o.status === 'cancelled' || o.status === 'returned'
  );

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
        <span className="text-foreground">Мои заказы</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold">Мои заказы</h1>

      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Активные ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Выполненные ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Отмененные ({cancelledOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length > 0 ? (
            activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              Нет активных заказов
            </p>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length > 0 ? (
            completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              Нет выполненных заказов
            </p>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledOrders.length > 0 ? (
            cancelledOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              Нет отмененных заказов
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
