# 🗃️ Repository Pattern с Prisma

## Архитектура

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Pages / Components                          │
├─────────────────────────────────────────────────────────────────────┤
│  Server Components              │  Client Components                │
│  ↓                              │  ↓                                │
│  handlers                       │  fetch('/api/...')                │
└─────────────────────────────────┴───────────────────────────────────┘
                    ↓                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                          API Routes                                  │
│                   /app/api/[entity]/route.ts                        │
│                              ↓                                       │
│                          handlers                                    │
│               entities/[entity]/api/handlers.ts                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         Repositories                                 │
│             entities/[entity]/model/repository.ts                   │
│                              ↓                                       │
│                        Prisma Client                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Ключевые правила

1. **Server Components** → вызывают `handlers` напрямую
2. **Client Components** → вызывают API routes через `fetch()`
3. **API Routes** → вызывают `handlers`
4. **Handlers** → вызывают `repositories`
5. **Repositories** → работают с Prisma

## API Routes

### Структура

```
src/app/api/
├── products/
│   ├── route.ts                    # GET /api/products
│   ├── [id]/
│   │   └── route.ts                # GET /api/products/:id
│   ├── slug/
│   │   └── [slug]/
│   │       └── route.ts            # GET /api/products/slug/:slug
│   └── category/
│       └── [slug]/
│           └── route.ts            # GET /api/products/category/:slug
├── categories/
│   ├── route.ts                    # GET /api/categories
│   └── [slug]/
│       └── route.ts                # GET /api/categories/:slug
├── orders/
│   ├── route.ts                    # GET/POST /api/orders
│   └── [id]/
│       └── route.ts                # GET/PATCH /api/orders/:id
├── reviews/
│   ├── route.ts                    # GET/POST /api/reviews
│   └── [id]/
│       └── helpful/
│           └── route.ts            # POST /api/reviews/:id/helpful
├── repair/
│   ├── services/
│   │   ├── route.ts                # GET /api/repair/services
│   │   └── [id]/
│   │       └── route.ts            # GET /api/repair/services/:id
│   └── requests/
│       ├── route.ts                # GET/POST /api/repair/requests
│       └── [id]/
│           └── route.ts            # GET /api/repair/requests/:id
├── banners/
│   └── route.ts                    # GET /api/banners
└── promo/
    └── validate/
        └── route.ts                # POST /api/promo/validate
```

### Пример API Route

```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getProducts,
  getAllProducts,
  getFeaturedProducts,
} from '@/entities/product/api/handlers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Featured products
    if (searchParams.get('featured') === 'true') {
      const limit = searchParams.get('limit');
      const products = await getFeaturedProducts(limit ? parseInt(limit) : undefined);
      return NextResponse.json({ products });
    }

    // All products
    if (searchParams.get('all') === 'true') {
      const products = await getAllProducts();
      return NextResponse.json({ products });
    }

    // Products with filters/pagination
    const result = await getProducts(Object.fromEntries(searchParams));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
```

### HTTP Response Codes

- `200` - Success (GET, PUT, PATCH)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Validation Error
- `404` - Not Found
- `500` - Server Error

## Использование в компонентах

### Server Components (прямой вызов handlers)

```tsx
// src/app/page.tsx
import { getFeaturedProducts, getNewProducts } from '@/entities/product/api/handlers';
import { getCategories } from '@/entities/category/api/handlers';

export default async function HomePage() {
  const [featuredProducts, newProducts, categories] = await Promise.all([
    getFeaturedProducts(8),
    getNewProducts(4),
    getCategories(),
  ]);

  return (
    <div>
      <ProductGrid products={featuredProducts} />
    </div>
  );
}
```

### Client Components (fetch API routes)

```tsx
// src/app/cart/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function CartPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      for (const item of cartItems) {
        const res = await fetch(`/api/products/${item.productId}`);
        if (res.ok) {
          const product = await res.json();
          // ...
        }
      }
    };
    loadProducts();
  }, [cartItems]);
}
```

### Пример загрузки категорий в Header

```tsx
// src/components/layout/header.tsx
'use client';

import { useEffect, useState } from 'react';

export function Header() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories?tree=true')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  return <nav>{/* ... */}</nav>;
}
```

## Prisma Singleton

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

## Базовый класс репозитория

```typescript
// shared/repository/base-repository.ts
import prisma from '@/lib/prisma';
import type { PrismaClient } from '@/app/generated/prisma/client';

export abstract class PrismaBaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected abstract modelName: string;

  constructor() {
    this.prisma = prisma;
  }

  protected get model() {
    return (this.prisma as Record<string, unknown>)[this.modelName];
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findAll(): Promise<T[]> {
    return this.model.findMany();
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: UpdateInput): Promise<T | null> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<boolean> {
    await this.model.delete({ where: { id } });
    return true;
  }
}
```

## Handlers с React cache

```typescript
// entities/product/api/handlers.ts
import { cache } from 'react';
import 'server-only';
import { getProductRepository } from '../model/repository';

const productRepo = getProductRepository();

export const getProducts = cache(async () => {
  return productRepo.findAll();
});

export const getProductById = cache(async (id: string) => {
  return productRepo.findById(id);
});

export const getFeaturedProducts = cache(async (limit?: number) => {
  return productRepo.findFeatured(limit);
});
```

## Мутации с инвалидацией кэша

```typescript
// entities/product/api/handlers.ts
'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

export async function updateProduct(id: string, data: ProductUpdateInput) {
  const product = await productRepo.update(id, data);

  revalidateTag(`product-${id}`);
  revalidatePath('/catalog');

  return product;
}
```

## Команды Prisma

```bash
# Генерация клиента
npx prisma generate

# Применение миграций
npx prisma migrate dev

# Просмотр БД
npx prisma studio

# Сброс БД
npx prisma migrate reset

# Заполнение данными
npm run db:seed
```

## Best Practices

### ✅ DO

```typescript
// Server Component → handlers напрямую
const products = await getFeaturedProducts();

// Client Component → API routes
const res = await fetch('/api/products?featured=true');

// Параллельные запросы
const [products, categories] = await Promise.all([
  getProducts(),
  getCategories(),
]);

// Используйте include для связей
const product = await prisma.product.findUnique({
  where: { id },
  include: { category: true },
});
```

### ❌ DON'T

```typescript
// НЕ вызывайте repositories из компонентов
const productRepo = getProductRepository();
const products = await productRepo.findAll(); // ❌

// НЕ создавайте новый PrismaClient
const prisma = new PrismaClient(); // ❌

// НЕ делайте N+1 запросы
for (const product of products) {
  const category = await prisma.category.findUnique({
    where: { id: product.categoryId },
  }); // ❌
}
```
