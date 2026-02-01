'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  User,
  Package,
  Wrench,
  MapPin,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserStore } from '@/entities/user/model/store';
import { mockUser, mockAddresses } from '@/entities/user/model/mocks';
import { mockOrders } from '@/entities/order/model/mocks';
import { mockRepairRequests } from '@/entities/repair/model/mocks';
import { OrderCard } from '@/entities/order/ui/order-card';

export default function AccountPage() {
  const { isAuthenticated, user, login, logout } = useUserStore();
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
  const recentOrders = orders.slice(0, 2);
  const activeRepairs = mockRepairRequests.filter(
    (r) => r.status !== 'completed' && r.status !== 'cancelled'
  );

  const menuItems = [
    { href: '/account/orders', icon: Package, label: 'Мои заказы', count: orders.length },
    { href: '/account/repairs', icon: Wrench, label: 'Мои ремонты', count: mockRepairRequests.length },
    { href: '/account/addresses', icon: MapPin, label: 'Адреса доставки', count: mockAddresses.length },
    { href: '/account/settings', icon: Settings, label: 'Настройки' },
  ];

  return (
    <div className="container py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Главная
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Личный кабинет</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/account/settings">
                  <User className="mr-2 h-4 w-4" />
                  Редактировать профиль
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </span>
                    {item.count !== undefined && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Выйти
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-3">
          {/* Active Repairs Alert */}
          {activeRepairs.length > 0 && (
            <Card className="border-chart-4/30 bg-chart-4/10">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-chart-4" />
                  <div>
                    <p className="font-medium">
                      У вас {activeRepairs.length} активных заявок на ремонт
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Следите за статусом в разделе &quot;Мои ремонты&quot;
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/repairs">Подробнее</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Последние заказы</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/account/orders">
                  Все заказы
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  У вас пока нет заказов
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{orders.length}</div>
                <p className="text-sm text-muted-foreground">Всего заказов</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{mockRepairRequests.length}</div>
                <p className="text-sm text-muted-foreground">Заявок на ремонт</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{mockAddresses.length}</div>
                <p className="text-sm text-muted-foreground">Адресов доставки</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
