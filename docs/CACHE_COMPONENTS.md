# ⚡ Cache Components & Data Fetching

## Обзор

Next.js 16+ предоставляет [Cache Components](https://nextjs.org/docs/app/getting-started/cache-components) для оптимального сочетания статического и динамического контента.

**Принцип:** Prerendering создаёт статическую HTML-оболочку, а динамический контент стримится по мере готовности.

**Ключевые ресурсы:**
- [Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)
- [Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating)

## Типы контента

### 1. Автоматически статический

Контент без сетевых запросов и runtime данных — автоматически в static shell:

```typescript
// Автоматически prerendered
export default function Page() {
  return (
    <div>
      <h1>Статический заголовок</h1>
      <p>Этот контент в static shell</p>
    </div>
  );
}
```

### 2. Кэшированный динамический (`use cache`)

Данные из API, которые можно закэшировать:

```typescript
import { cacheLife } from 'next/cache';

async function ProductGrid() {
  'use cache';
  cacheLife('hours'); // Кэш на час

  const products = await fetch('https://api.example.com/products');
  const data = await products.json();

  return (
    <div className="grid grid-cols-4 gap-4">
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 3. Runtime динамический (Suspense)

Персонализированный контент, требующий request данных:

```typescript
import { Suspense } from 'react';
import { cookies } from 'next/headers';

// Персонализированный компонент
async function UserCart() {
  const cartId = (await cookies()).get('cartId')?.value;
  const cart = await getCart(cartId);

  return <CartSummary cart={cart} />;
}

// Использование с fallback
export default function Page() {
  return (
    <>
      <ProductGrid /> {/* Кэшированный */}

      <Suspense fallback={<CartSkeleton />}>
        <UserCart /> {/* Стримится в runtime */}
      </Suspense>
    </>
  );
}
```

## Паттерны для компонентов

### Грид с данными из API

```typescript
// entities/product/ui/product-grid-cached.tsx
import { cacheLife } from 'next/cache';
import { getProducts } from '../api/handlers';
import { ProductCard } from './product-card';

export async function ProductGridCached({
  categorySlug,
}: {
  categorySlug?: string;
}) {
  'use cache';
  cacheLife('hours');

  const { products } = await getProducts({ category: categorySlug });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Страница с миксом контента

```typescript
// app/catalog/page.tsx
import { Suspense } from 'react';
import { ProductGridCached } from '@/entities/product/ui/product-grid-cached';
import { RecommendationsCached } from '@/entities/product/ui/recommendations-cached';
import { UserRecentlyViewed } from '@/entities/product/ui/user-recently-viewed';

export default function CatalogPage() {
  return (
    <>
      {/* Статический header */}
      <h1>Каталог товаров</h1>

      {/* Кэшированный грид — в static shell */}
      <ProductGridCached />

      {/* Кэшированные рекомендации */}
      <Suspense fallback={<GridSkeleton />}>
        <RecommendationsCached />
      </Suspense>

      {/* Персонализированные — стримятся */}
      <Suspense fallback={<GridSkeleton />}>
        <UserRecentlyViewed />
      </Suspense>
    </>
  );
}
```

## cacheLife профили

```typescript
import { cacheLife } from 'next/cache';

// Предустановленные профили
cacheLife('seconds');  // 1 секунда
cacheLife('minutes');  // 1 минута  
cacheLife('hours');    // 1 час
cacheLife('days');     // 1 день
cacheLife('weeks');    // 1 неделя
cacheLife('max');      // Максимальный кэш
```

### Кастомные профили

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    catalog: {
      stale: 3600,      // 1 час — можно использовать stale
      revalidate: 900,  // 15 мин — фоновая ревалидация
      expire: 86400,    // 24 часа — полное истечение
    },
  },
};

export default nextConfig;
```

```typescript
// Использование
async function ProductGrid() {
  'use cache';
  cacheLife('catalog');
  // ...
}
```

## React `cache` для дедупликации

При использовании ORM/Prisma (не fetch) используйте React `cache` для дедупликации запросов в одном render pass:

```typescript
// entities/product/api/handlers.ts
import { cache } from 'react';
import 'server-only';
import prisma from '@/lib/prisma';

// Запрос дедуплицируется в рамках одного request
export const getProduct = cache(async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
});

export const getProducts = cache(async (categorySlug?: string) => {
  return prisma.product.findMany({
    where: categorySlug ? { category: { slug: categorySlug } } : undefined,
    include: { category: true },
  });
});
```

### Preloading данных

Начинайте загрузку данных до того, как они понадобятся:

```typescript
// app/catalog/[category]/[product]/page.tsx
import { getProduct, getRelatedProducts } from '@/entities/product/api/handlers';

// Preload function
const preload = (productId: string) => {
  void getProduct(productId);
  void getRelatedProducts(productId);
};

export default async function ProductPage({ params }) {
  const { product: productSlug } = await params;

  // Начинаем загрузку сразу
  preload(productSlug);

  // Другие операции...
  const product = await getProduct(productSlug);

  return <ProductDetails product={product} />;
}
```

## Инвалидация кэша при мутациях

При изменении данных необходимо инвалидировать кэш. См. [Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating).

### По тегу (`revalidateTag`)

```typescript
import { cacheTag, revalidateTag } from 'next/cache';

// При кэшировании — добавляем тег
async function ProductGrid({ categorySlug }: { categorySlug: string }) {
  'use cache';
  cacheTag(`products-${categorySlug}`);
  cacheTag('products'); // Общий тег для всех продуктов
  // ...
}

// Server Action — инвалидируем при мутации
'use server';

import { revalidateTag } from 'next/cache';

export async function updateProduct(id: string, data: ProductInput) {
  await prisma.product.update({ where: { id }, data });

  // Инвалидируем связанные кэши
  revalidateTag(`products-${data.categorySlug}`);
  revalidateTag(`product-${id}`);
}

export async function createProduct(data: ProductInput) {
  await prisma.product.create({ data });

  // Инвалидируем список продуктов
  revalidateTag('products');
  revalidateTag(`products-${data.categorySlug}`);
}

export async function deleteProduct(id: string, categorySlug: string) {
  await prisma.product.delete({ where: { id } });

  revalidateTag('products');
  revalidateTag(`products-${categorySlug}`);
}
```

### По пути (`revalidatePath`)

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function updateProduct(id: string, data: ProductInput) {
  await prisma.product.update({ where: { id }, data });

  // Инвалидируем конкретные страницы
  revalidatePath(`/catalog/${data.categorySlug}/${data.slug}`);
  revalidatePath(`/catalog/${data.categorySlug}`);
  revalidatePath('/catalog');
}
```

### Комбинированный подход

```typescript
'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

export async function updateProduct(id: string, data: ProductInput) {
  const product = await prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });

  // Инвалидируем по тегам (для use cache)
  revalidateTag(`product-${id}`);
  revalidateTag(`products-${product.category.slug}`);

  // Инвалидируем по путям (для страниц)
  revalidatePath(`/catalog/${product.category.slug}/${product.slug}`);

  return product;
}
```

## Skeleton компоненты

Создавайте скелетоны для Suspense fallback:

```typescript
// entities/product/ui/product-grid-skeleton.tsx
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-lg bg-muted" />
          <div className="mt-4 h-4 w-3/4 rounded bg-muted" />
          <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
```

## Когда использовать что

| Сценарий | Подход |
|----------|--------|
| Статические страницы (About, Legal) | Автоматический prerender |
| Каталог товаров | `use cache` + `cacheLife('hours')` |
| Детали товара | `use cache` + `cacheTag` |
| Корзина пользователя | `Suspense` + runtime |
| Рекомендации общие | `use cache` |
| Рекомендации персональные | `Suspense` + runtime |

## Включение Cache Components

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

## Prefetching для лучшего UX

Next.js автоматически prefetch'ит ссылки для мгновенной навигации. См. [Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating).

### Link с prefetch

```typescript
import Link from 'next/link';

// ✅ Prefetch включён по умолчанию
<Link href="/catalog/laptops">
  Ноутбуки
</Link>

// Отключить prefetch (редко нужно)
<Link href="/catalog/laptops" prefetch={false}>
  Ноутбуки
</Link>
```

### Программный prefetch

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProductCard({ product }) {
  const router = useRouter();

  // Prefetch при hover
  const handleMouseEnter = () => {
    router.prefetch(`/catalog/${product.categorySlug}/${product.slug}`);
  };

  return (
    <Link
      href={`/catalog/${product.categorySlug}/${product.slug}`}
      onMouseEnter={handleMouseEnter}
    >
      {product.name}
    </Link>
  );
}
```

### Prefetch в гридах

```typescript
// entities/product/ui/product-grid.tsx
import Link from 'next/link';
import type { Product } from '../model/schemas';

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/catalog/${product.categorySlug}/${product.slug}`}
          // prefetch={true} — по умолчанию
        >
          <ProductCard product={product} />
        </Link>
      ))}
    </div>
  );
}
```

## Parallel Data Fetching

Для оптимальной производительности запускайте запросы параллельно:

```typescript
// ❌ Последовательные запросы
export default async function Page({ params }) {
  const { categorySlug } = await params;

  const category = await getCategory(categorySlug);    // Ждём
  const products = await getProducts(categorySlug);    // Потом ждём
  const banners = await getBanners();                  // Потом ждём

  return <div>...</div>;
}

// ✅ Параллельные запросы
export default async function Page({ params }) {
  const { categorySlug } = await params;

  // Запускаем все запросы одновременно
  const [category, products, banners] = await Promise.all([
    getCategory(categorySlug),
    getProducts(categorySlug),
    getBanners(),
  ]);

  return <div>...</div>;
}
```

### С обработкой ошибок

```typescript
// Promise.allSettled — не падает при ошибке одного запроса
const results = await Promise.allSettled([
  getCategory(categorySlug),
  getProducts(categorySlug),
  getBanners(),
]);

const [categoryResult, productsResult, bannersResult] = results;

const category = categoryResult.status === 'fulfilled' ? categoryResult.value : null;
const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
const banners = bannersResult.status === 'fulfilled' ? bannersResult.value : [];
```

## Дополнительные ресурсы

- [Next.js Cache Components](https://nextjs.org/docs/app/getting-started/cache-components)
- [Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)
- [Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating)
- [use cache directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [cacheLife function](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [cacheTag function](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
