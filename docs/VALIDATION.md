# ✅ Validation with Zod

## Обзор

Проект использует [Zod](https://zod.dev/) для:

- Определения TypeScript типов
- Валидации входных данных
- Трансформации данных (DTO)
- Генерации типов из схем

## Структура схем в Entity

Все схемы определяются в `model/schemas.ts`:

```typescript
// entities/product/model/schemas.ts

import { z } from 'zod';

// ============================================
// 1. ОСНОВНЫЕ СХЕМЫ
// ============================================

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().min(1, 'Slug обязателен'),
  price: z.number().positive('Цена должна быть положительной'),
  oldPrice: z.number().positive().optional(),
  inStock: z.boolean().default(true),
  // ...
});

export type Product = z.infer<typeof productSchema>;

// ============================================
// 2. СХЕМЫ ДЛЯ CRUD
// ============================================

// Создание (без id)
export const createProductSchema = productSchema.omit({ id: true });
export type CreateProductInput = z.infer<typeof createProductSchema>;

// Обновление (всё optional + id required)
export const updateProductSchema = productSchema.partial().required({ id: true });
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ============================================
// 3. СХЕМЫ ДЛЯ API ЗАПРОСОВ
// ============================================

export const productFilterSchema = z.object({
  categorySlug: z.string().optional(),
  brands: z.array(z.string()).optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  inStock: z.boolean().optional(),
});

export type ProductFilter = z.infer<typeof productFilterSchema>;

// ============================================
// 4. СХЕМЫ ДЛЯ API ОТВЕТОВ
// ============================================

export const productListResponseSchema = z.object({
  products: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

export type ProductListResponse = z.infer<typeof productListResponseSchema>;
```

## Общие схемы (Shared)

Переиспользуемые схемы в `shared/lib/zod-helpers.ts`:

```typescript
import { z } from 'zod';

// Пагинация
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

// Email
export const emailSchema = z.string().email('Некорректный email');

// Телефон (российский формат)
export const phoneSchema = z
  .string()
  .regex(/^\+?[78][\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/, 'Некорректный номер телефона');

// Цена
export const priceSchema = z.coerce.number().positive('Цена должна быть положительной');

// Базовая entity
export const baseEntitySchema = z.object({
  id: z.string(),
});

// Timestamps
export const timestampSchema = z.object({
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()).optional(),
});
```

## Валидация в API handlers

### Использование safeParse

```typescript
export async function getProducts(params: unknown): Promise<ProductListResponse> {
  // safeParse не выбрасывает ошибку
  const validatedParams = getProductsRequestSchema.safeParse(params);

  if (!validatedParams.success) {
    // Используем дефолтные значения при ошибке валидации
    return getDefaultProducts();
  }

  const { page, limit, filter } = validatedParams.data;
  // ... продолжаем с валидными данными
}
```

### Использование parse (с ошибкой)

```typescript
export async function createProduct(params: unknown): Promise<Product> {
  try {
    // parse выбрасывает ZodError при ошибке
    const validatedData = createProductSchema.parse(params);
    return productRepo.create(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Обработка ошибок валидации
      const errors = getValidationErrors(error);
      throw new ValidationError(errors);
    }
    throw error;
  }
}
```

## Получение ошибок валидации

```typescript
import { z } from 'zod';

export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });
  return errors;
}

// Использование
const result = schema.safeParse(data);
if (!result.success) {
  const errors = getValidationErrors(result.error);
  // { "name": "Название обязательно", "price": "Цена должна быть положительной" }
}
```

## Паттерны схем

### Enum

```typescript
export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

// Labels для UI
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтвержден',
  // ...
};
```

### Nested Objects

```typescript
export const orderItemSchema = z.object({
  productId: z.string(),
  product: productSchema,
  quantity: z.number().int().positive(),
  price: priceSchema,
});

export const orderSchema = z.object({
  id: z.string(),
  items: z.array(orderItemSchema),
  status: orderStatusSchema,
  // ...
});
```

### Extend/Merge

```typescript
// Базовая схема
export const bannerSchema = z.object({
  id: z.string(),
  title: z.string(),
  image: z.string().url(),
  link: z.string(),
});

// Расширенная схема
export const promoBannerSchema = bannerSchema.extend({
  discountPercent: z.number().int().min(0).max(100).optional(),
  promoCode: z.string().optional(),
});
```

### Динамическая сортировка

```typescript
export function createSortSchema<T extends string>(fields: readonly T[]) {
  return z.object({
    field: z.enum(fields as unknown as readonly [T, ...T[]]),
    direction: z.enum(['asc', 'desc']).default('asc'),
  });
}

// Использование
export const productSortSchema = createSortSchema(['price', 'rating', 'name'] as const);
```

## Трансформация данных (DTO)

```typescript
// Маппер полной модели в DTO для карточки
export const productCardDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.number(),
  oldPrice: z.number().optional(),
  image: z.string(),
  inStock: z.boolean(),
});

export type ProductCardDto = z.infer<typeof productCardDtoSchema>;

// Функция маппинга
export function mapProductToCard(product: Product): ProductCardDto {
  return productCardDtoSchema.parse({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    oldPrice: product.oldPrice,
    image: product.images[0] || '/placeholder.jpg',
    inStock: product.inStock,
  });
}
```
