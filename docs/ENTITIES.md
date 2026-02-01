# 📦 Entities Guide

## Структура Entity

Каждая бизнес-сущность организована по принципу:

```
entities/[entity-name]/
├── api/
│   └── handlers.ts       # Server-side API handlers
├── model/
│   ├── schemas.ts        # Zod schemas + TypeScript types
│   ├── repository.ts     # Repository class + initial data
│   └── store.ts          # Zustand store (optional)
└── ui/
    └── [component].tsx   # UI components
```

## Создание новой Entity

### Шаг 1: Определить Zod схемы (`model/schemas.ts`)

```typescript
import { z } from 'zod';

// Основная схема сущности
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Название обязательно'),
  price: z.number().positive('Цена должна быть положительной'),
  // ...
});

// Экспорт TypeScript типа из схемы
export type Product = z.infer<typeof productSchema>;

// Схема для создания (без id)
export const createProductSchema = productSchema.omit({ id: true });
export type CreateProductInput = z.infer<typeof createProductSchema>;

// Схема для обновления (все поля optional + id required)
export const updateProductSchema = productSchema.partial().required({ id: true });
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Схемы для запросов/ответов API
export const getProductsRequestSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(12),
  // filters...
});

export const productListResponseSchema = z.object({
  products: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

export type ProductListResponse = z.infer<typeof productListResponseSchema>;
```

### Шаг 2: Создать репозиторий (`model/repository.ts`)

```typescript
import { BaseRepository } from '@/shared/repository/base-repository';
import type { DatabaseConnection } from '@/shared/database/types';
import type { Product } from './schemas';

// Начальные данные (mock)
const initialProducts: Product[] = [
  { id: '1', name: 'Product 1', price: 100 },
  // ...
];

// Класс репозитория
export class ProductRepository extends BaseRepository<Product> {
  constructor(db: DatabaseConnection) {
    super(db, initialProducts);
  }

  // Специфичные методы для сущности
  async findBySlug(slug: string): Promise<Product | null> {
    await this.simulateDelay();
    return this.data.find((p) => p.slug === slug) ?? null;
  }

  async findByCategory(categorySlug: string): Promise<Product[]> {
    await this.simulateDelay();
    return this.data.filter((p) => p.categorySlug === categorySlug);
  }
}

// Singleton pattern
let instance: ProductRepository | null = null;

export function getProductRepository(db: DatabaseConnection): ProductRepository {
  if (!instance) {
    instance = new ProductRepository(db);
  }
  return instance;
}
```

### Шаг 3: Создать API handlers (`api/handlers.ts`)

Handlers — переиспользуемая бизнес-логика, вызываемая из:
- Server Components (напрямую)
- API Routes (`src/app/api/`)

**Важно:** Используйте React `cache` для дедупликации запросов в одном render pass.

```typescript
import { cache } from 'react';
import 'server-only';
import prisma from '@/lib/prisma';
import {
  getProductsRequestSchema,
  type ProductListResponse,
  type Product,
  type CreateProductInput,
} from '../model/schemas';

/**
 * Получить продукт по ID (с дедупликацией)
 */
export const getProductById = cache(async (id: string): Promise<Product | null> => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
});

/**
 * Получить продукт по slug (с дедупликацией)
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
});

/**
 * Получить список продуктов с пагинацией
 */
export const getProducts = cache(async (params: unknown): Promise<ProductListResponse> => {
  const validatedParams = getProductsRequestSchema.safeParse(params);

  const { page, limit, categorySlug } = validatedParams.success
    ? validatedParams.data
    : { page: 1, limit: 12, categorySlug: undefined };

  const where = categorySlug ? { category: { slug: categorySlug } } : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
});

/**
 * Создать новый продукт (мутация — без cache)
 */
export async function createProduct(data: CreateProductInput): Promise<Product> {
  return prisma.product.create({
    data,
    include: { category: true },
  });
}
```

### Server Actions с инвалидацией

```typescript
// entities/product/api/actions.ts
'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import type { CreateProductInput, UpdateProductInput } from '../model/schemas';

export async function createProductAction(data: CreateProductInput) {
  const product = await prisma.product.create({ data });

  // Инвалидируем кэши
  revalidateTag('products');
  revalidateTag(`products-${product.categorySlug}`);
  revalidatePath('/catalog');

  return product;
}

export async function updateProductAction(id: string, data: UpdateProductInput) {
  const product = await prisma.product.update({ where: { id }, data });

  revalidateTag(`product-${id}`);
  revalidateTag(`products-${product.categorySlug}`);
  revalidatePath(`/catalog/${product.categorySlug}/${product.slug}`);

  return product;
}

export async function deleteProductAction(id: string) {
  const product = await prisma.product.delete({ where: { id } });

  revalidateTag('products');
  revalidateTag(`product-${id}`);
  revalidatePath('/catalog');

  return { success: true };
}
```

### Шаг 3.1: Создать API Route (опционально)

Если нужен REST API endpoint:

```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/entities/product/api/handlers';
import { createProductSchema } from '@/entities/product/model/schemas';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getProducts(Object.fromEntries(searchParams));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
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

### Шаг 4: Создать UI компоненты (`ui/`)

```typescript
// ui/product-card.tsx
import type { Product } from '../model/schemas';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3>{product.name}</h3>
      <p>{product.price} ₽</p>
    </div>
  );
}
```

### Шаг 5 (опционально): Создать Zustand store (`model/store.ts`)

Создавайте store только если нужно хранить состояние на клиенте:

```typescript
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  items: CartItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  // ...
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => {
        // ...
      },
      // ...
    }),
    { name: 'cart-storage' }
  )
);
```

## Существующие Entities

| Entity | Описание | Store |
|--------|----------|-------|
| `product` | Товары каталога | ❌ |
| `category` | Категории товаров | ❌ |
| `cart` | Корзина покупателя | ✅ `useCartStore` |
| `order` | Заказы | ❌ |
| `user` | Пользователи | ✅ `useUserStore` |
| `repair` | Услуги ремонта | ❌ |
| `banner` | Промо-баннеры | ❌ |
| `review` | Отзывы о товарах | ❌ |

## Соглашения по именованию

- **Директории**: `kebab-case` (`repair-service/`)
- **Файлы**: `kebab-case` (`product-card.tsx`)
- **Компоненты**: `PascalCase` (`ProductCard`)
- **Функции**: `camelCase` (`getProductById`)
- **Типы/Схемы**: `PascalCase` с суффиксами (`productSchema`, `Product`, `CreateProductInput`)
- **Константы**: `SCREAMING_SNAKE_CASE` (`ORDER_STATUS_LABELS`)
