'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Wrench, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/entities/user/model/store';
import { mockUser } from '@/entities/user/model/repository';
import { mockRepairRequests } from '@/entities/repair/model/repository';
import { REPAIR_STATUS_LABELS } from '@/entities/repair/model/schemas';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  diagnosed: 'bg-blue-100 text-blue-800',
  awaiting_approval: 'bg-orange-100 text-orange-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function RepairsPage() {
  const { isAuthenticated, login } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      login(mockUser);
    }
  }, [isAuthenticated, login]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return (
      <div className="container py-8">
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const activeRepairs = mockRepairRequests.filter(
    (r) => !['completed', 'cancelled'].includes(r.status)
  );
  const completedRepairs = mockRepairRequests.filter(
    (r) => r.status === 'completed' || r.status === 'cancelled'
  );

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
        <span className="text-foreground">Мои ремонты</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Мои ремонты</h1>
        <Button asChild>
          <Link href="/repair">
            Новая заявка
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Активные ({activeRepairs.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Завершенные ({completedRepairs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeRepairs.length > 0 ? (
            activeRepairs.map((repair) => (
              <Card key={repair.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {repair.requestNumber}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        от {formatDate(repair.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[repair.status]}>
                    {REPAIR_STATUS_LABELS[repair.status]}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Устройство</p>
                      <p className="font-medium">
                        {repair.deviceBrand} {repair.deviceModel}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Услуга</p>
                      <p className="font-medium">{repair.service.name}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Описание проблемы</p>
                    <p className="text-sm">{repair.problemDescription}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {repair.service.estimatedTime}
                      </div>
                      {repair.estimatedCost && (
                        <p className="font-semibold">
                          ~{formatPrice(repair.estimatedCost)} ₽
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Подробнее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              Нет активных заявок на ремонт
            </p>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedRepairs.length > 0 ? (
            completedRepairs.map((repair) => (
              <Card key={repair.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {repair.requestNumber}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        от {formatDate(repair.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[repair.status]}>
                    {REPAIR_STATUS_LABELS[repair.status]}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Устройство</p>
                      <p className="font-medium">
                        {repair.deviceBrand} {repair.deviceModel}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Услуга</p>
                      <p className="font-medium">{repair.service.name}</p>
                    </div>
                  </div>
                  {repair.finalCost && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Итоговая стоимость:
                      </span>
                      <span className="font-semibold">
                        {formatPrice(repair.finalCost)} ₽
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              Нет завершенных заявок
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
