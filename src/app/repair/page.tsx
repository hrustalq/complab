import Link from 'next/link';
import { ChevronRight, Phone, Clock, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RepairServiceCard } from '@/entities/repair/ui/repair-service-card';
import { repairServices } from '@/entities/repair/model/mocks';
import { REPAIR_CATEGORY_LABELS, type RepairCategory } from '@/entities/repair/model/schemas';

export const metadata = {
  title: 'Ремонт техники',
  description: 'Профессиональный ремонт компьютеров, ноутбуков и периферии. Гарантия на все работы до 6 месяцев.',
};

export default function RepairPage() {
  const categories = Object.entries(REPAIR_CATEGORY_LABELS) as [RepairCategory, string][];

  return (
    <div className="pb-12">
      {/* Hero */}
      <section className="bg-linear-to-br from-primary/10 via-background to-background py-16">
        <div className="container">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Главная
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Ремонт техники</span>
          </nav>

          <div className="max-w-2xl">
            <h1 className="mb-4 text-4xl font-bold">Профессиональный ремонт техники</h1>
            <p className="mb-6 text-lg text-muted-foreground">
              Ремонтируем компьютеры, ноутбуки, мониторы и периферийные устройства.
              Гарантия на все работы до 6 месяцев.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <a href="#services">Выбрать услугу</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="tel:+78001234567">
                  <Phone className="mr-2 h-4 w-4" />8 (800) 123-45-67
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b py-12">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Быстрая диагностика</h3>
                  <p className="text-sm text-muted-foreground">За 30 минут</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Гарантия</h3>
                  <p className="text-sm text-muted-foreground">До 6 месяцев</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Выезд на дом</h3>
                  <p className="text-sm text-muted-foreground">Бесплатно по Москве</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Поддержка 24/7</h3>
                  <p className="text-sm text-muted-foreground">Всегда на связи</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="container py-12">
        <h2 className="mb-8 text-2xl font-bold">Наши услуги</h2>

        <Tabs defaultValue="laptop">
          <TabsList className="mb-6 flex-wrap justify-start">
            {categories.map(([key, label]) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(([key]) => (
            <TabsContent key={key} value={key}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {repairServices
                  .filter((s) => s.category === key)
                  .map((service) => (
                    <RepairServiceCard key={service.id} service={service} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* CTA */}
      <section className="bg-muted/30 py-12">
        <div className="container text-center">
          <h2 className="mb-4 text-2xl font-bold">Не нашли нужную услугу?</h2>
          <p className="mb-6 text-muted-foreground">
            Свяжитесь с нами, и мы поможем решить вашу проблему
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <a href="tel:+78001234567">
                <Phone className="mr-2 h-4 w-4" />
                Позвонить
              </a>
            </Button>
            <Button size="lg" variant="outline">
              Написать в чат
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
