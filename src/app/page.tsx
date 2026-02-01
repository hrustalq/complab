import Link from 'next/link';
import { ArrowRight, Truck, Shield, Headphones, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroCarousel } from '@/entities/banner/ui/hero-carousel';
import { PromoBannersGrid } from '@/entities/banner/ui/promo-banner';
import { ProductGrid } from '@/entities/product/ui/product-grid';
import { CategoryCard } from '@/entities/category/ui/category-card';
import { RepairServiceCard } from '@/entities/repair/ui/repair-service-card';
import { getHeroBanners, getPromoBanners } from '@/entities/banner/api/handlers';
import { getFeaturedProducts, getNewProducts, getOnSaleProducts } from '@/entities/product/api/handlers';
import { getCategories } from '@/entities/category/api/handlers';
import { getPopularServicesAsync } from '@/entities/repair/api/handlers';

export default async function HomePage() {
  const [
    heroBanners,
    promoBanners,
    featuredProducts,
    newProducts,
    saleProducts,
    categories,
    popularRepairs,
  ] = await Promise.all([
    getHeroBanners(),
    getPromoBanners(),
    getFeaturedProducts(8),
    getNewProducts(4),
    getOnSaleProducts(4),
    getCategories(),
    getPopularServicesAsync(),
  ]);

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Carousel */}
      <section className="container pt-6">
        <HeroCarousel banners={heroBanners} />
      </section>

      {/* Features */}
      <section className="border-y bg-muted/30 py-8">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Бесплатная доставка</h3>
                <p className="text-sm text-muted-foreground">При заказе от 10 000₽</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Гарантия качества</h3>
                <p className="text-sm text-muted-foreground">Официальная гарантия</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Поддержка 24/7</h3>
                <p className="text-sm text-muted-foreground">Всегда на связи</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Рассрочка 0%</h3>
                <p className="text-sm text-muted-foreground">Удобная оплата</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Категории</h2>
          <Button variant="ghost" asChild>
            <Link href="/catalog">
              Все категории
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="stagger-animation grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Рекомендуем</h2>
          <Button variant="ghost" asChild>
            <Link href="/catalog?featured=true">
              Смотреть все
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="stagger-animation">
          <ProductGrid products={featuredProducts} columns={4} />
        </div>
      </section>

      {/* Promo Banners */}
      <section className="container">
        <PromoBannersGrid banners={promoBanners} />
      </section>

      {/* New Products */}
      <section className="container">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            <span className="text-chart-3">Новинки</span>
          </h2>
          <Button variant="ghost" asChild>
            <Link href="/new">
              Все новинки
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ProductGrid products={newProducts} columns={4} />
      </section>

      {/* Sale Products */}
      <section className="container">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            <span className="text-destructive">Распродажа</span>
          </h2>
          <Button variant="ghost" asChild>
            <Link href="/sale">
              Все товары со скидкой
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ProductGrid products={saleProducts} columns={4} />
      </section>

      {/* Repair Services */}
      <section className="bg-muted/30 py-12">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Услуги ремонта</h2>
              <p className="text-muted-foreground">
                Профессиональный ремонт с гарантией до 6 месяцев
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/repair">
                Все услуги
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularRepairs.slice(0, 6).map((service) => (
              <RepairServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary to-chart-2 p-8 text-white sm:p-12">
          <div className="relative z-10 max-w-xl">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Нужна консультация?
            </h2>
            <p className="mb-6 text-lg opacity-90">
              Наши специалисты помогут подобрать технику под ваши задачи и бюджет
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-white/90"
                asChild
              >
                <Link href="/contacts">Связаться с нами</Link>
              </Button>
              <Button
                size="lg"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                asChild
              >
                <a href="tel:+78001234567">8 (800) 123-45-67</a>
              </Button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-white/5" />
        </div>
      </section>
    </div>
  );
}
