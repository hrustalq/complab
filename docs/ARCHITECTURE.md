# 🏗️ Архитектура проекта

## Обзор

Проект построен на основе **Entity-Based Architecture** (вдохновлено Feature-Sliced Design), с четким разделением бизнес-логики по сущностям и переиспользуемыми базовыми слоями.

## Принципы архитектуры

### 1. Разделение по сущностям (Entities)

Каждая бизнес-сущность инкапсулирует свою логику в отдельной директории:

```
entities/
├── product/          # Товары
├── category/         # Категории
├── cart/             # Корзина
├── order/            # Заказы
├── user/             # Пользователи
├── repair/           # Услуги ремонта
├── banner/           # Баннеры
└── review/           # Отзывы
```

### 2. Структура Entity

Каждая entity содержит три директории:

```
entity/
├── api/              # API handlers (серверная логика)
│   └── handlers.ts
├── model/            # Данные и бизнес-логика
│   ├── schemas.ts    # Zod схемы + TypeScript типы
│   ├── repository.ts # Класс репозитория + данные
│   └── store.ts      # Zustand store (если нужен)
└── ui/               # React компоненты
    └── *.tsx
```

### 3. Shared слой

Базовые переиспользуемые модули:

```
shared/
├── database/
│   ├── types.ts              # Интерфейсы Repository, Connection
│   └── in-memory-connection.ts # Реализация подключения
├── repository/
│   └── base-repository.ts    # Абстрактный базовый класс
└── lib/
    └── zod-helpers.ts        # Утилиты валидации
```

## Поток данных

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  (Pages, Components)                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Handlers                            │
│  - Валидация входных данных (Zod)                           │
│  - Вызов методов репозитория                                │
│  - Форматирование ответов                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Repository Layer                        │
│  - CRUD операции                                             │
│  - Бизнес-логика запросов                                   │
│  - Абстракция над хранилищем                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  - In-memory (текущая реализация)                           │
│  - PostgreSQL/MongoDB (будущее)                              │
└─────────────────────────────────────────────────────────────┘
```

## Правила импортов

### ✅ Разрешено

```typescript
// Из shared - везде
import { BaseRepository } from '@/shared/repository/base-repository';
import { db } from '@/shared/database/in-memory-connection';

// Из entity/model - в api и ui той же entity
import { Product } from '../model/schemas';
import { getProductRepository } from '../model/repository';

// Из entity/ui - в pages
import { ProductCard } from '@/entities/product/ui/product-card';

// Из entity/api - в pages (Server Components)
import { getProducts } from '@/entities/product/api/handlers';
```

### ❌ Запрещено

```typescript
// НЕ создавать barrel exports (index.ts)
// Это предотвращает смешивание client/server кода
import { ProductCard, getProducts } from '@/entities/product'; // ❌

// НЕ импортировать из api в ui компоненты
// API handlers - только для Server Components
import { getProducts } from '../api/handlers'; // ❌ в client component
```

## Server vs Client Components

### Server Components (по умолчанию)

- Pages (`page.tsx`)
- Layouts (`layout.tsx`)
- Компоненты без интерактивности

```typescript
// page.tsx - Server Component
import { getProducts } from '@/entities/product/api/handlers';

export default async function Page() {
  const products = await getProducts();
  return <ProductGrid products={products} />;
}
```

### Client Components

- Интерактивные компоненты
- Компоненты с hooks (useState, useEffect)
- Компоненты с Zustand stores

```typescript
'use client';

import { useCartStore } from '@/entities/cart/model/store';

export function CartButton() {
  const totalItems = useCartStore((state) => state.getTotalQuantity());
  // ...
}
```

## Cache Components & Data Fetching

Для компонентов, загружающих данные (гриды, списки), используем [Cache Components](https://nextjs.org/docs/app/getting-started/cache-components):

### Кэшированные компоненты (`use cache`)

```typescript
import { cacheLife } from 'next/cache';

async function ProductGrid() {
  'use cache';
  cacheLife('hours');

  const products = await getProducts();
  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

### Динамические компоненты (Suspense)

```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      {/* Кэшированный — в static shell */}
      <ProductGrid />

      {/* Персонализированный — стримится */}
      <Suspense fallback={<CartSkeleton />}>
        <UserCart />
      </Suspense>
    </>
  );
}
```

### Prefetching (UX)

Next.js автоматически prefetch'ит ссылки:

```typescript
import Link from 'next/link';

// Prefetch включён по умолчанию
<Link href="/catalog/laptops">Ноутбуки</Link>
```

### Инвалидация при мутациях

```typescript
'use server';
import { revalidateTag } from 'next/cache';

export async function updateProduct(id: string, data: Input) {
  await prisma.product.update({ where: { id }, data });
  revalidateTag(`product-${id}`);
}
```

См. [CACHE_COMPONENTS.md](./CACHE_COMPONENTS.md) для подробного руководства.

## API Routes (Next.js Route Handlers)

API роуты располагаются в `src/app/api/` и **переиспользуют handlers из entities**:

```
src/app/api/
├── products/
│   ├── route.ts              # GET /api/products
│   └── [id]/
│       └── route.ts          # GET/PUT/DELETE /api/products/:id
├── categories/
│   └── route.ts
├── orders/
│   └── route.ts
└── auth/
    └── route.ts
```

### Пример API Route

```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/entities/product/api/handlers';
import { createProductSchema } from '@/entities/product/model/schemas';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const params = {
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    category: searchParams.get('category'),
  };

  const result = await getProducts(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Валидация через схему из entity
  const validated = createProductSchema.safeParse(body);
  
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validated.error.issues },
      { status: 400 }
    );
  }

  const product = await createProduct(validated.data);
  return NextResponse.json(product, { status: 201 });
}
```

### Принципы API Routes

1. **Переиспользование** — handlers и schemas из entities
2. **Валидация** — всегда через Zod schemas
3. **Стандартные ответы** — NextResponse.json() с правильными статус-кодами
4. **Error handling** — единообразная обработка ошибок

## Добавление новой Entity

1. Создать структуру директорий
2. Определить Zod схемы в `model/schemas.ts`
3. Создать репозиторий в `model/repository.ts`
4. Добавить API handlers в `api/handlers.ts`
5. Создать UI компоненты в `ui/`
6. (Опционально) Создать API route в `src/app/api/`

См. [ENTITIES.md](./ENTITIES.md) для подробного руководства.
