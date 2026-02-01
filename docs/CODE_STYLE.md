# 📝 Code Style Guide

## TypeScript

### Строгая типизация

- Всегда указывать типы параметров функций
- Использовать `unknown` вместо `any` для неизвестных типов
- Выводить типы из Zod схем (`z.infer<typeof schema>`)

```typescript
// ✅ Хорошо
function getProduct(id: string): Promise<Product | null> {
  // ...
}

export async function handleRequest(params: unknown): Promise<Response> {
  const validated = schema.safeParse(params);
  // ...
}

// ❌ Плохо
function getProduct(id) {
  // ...
}

function handleRequest(params: any) {
  // ...
}
```

### Type vs Interface

```typescript
// Используем type для выведенных типов из Zod
export type Product = z.infer<typeof productSchema>;

// Используем interface для props компонентов
interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}
```

## React

### Компоненты

```typescript
// Function component
interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (/* ... */);
}

// Не используем default export для компонентов
// ✅ export function ProductCard
// ❌ export default function ProductCard
```

### Hooks

```typescript
// Порядок hooks в компоненте:
// 1. External hooks (router, store)
// 2. State hooks
// 3. Ref hooks
// 4. Effect hooks
// 5. Callback/memo hooks

export function MyComponent() {
  // 1. External
  const router = useRouter();
  const { user } = useUserStore();

  // 2. State
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Data | null>(null);

  // 3. Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // 4. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 5. Callbacks
  const handleSubmit = useCallback(() => {
    // ...
  }, []);

  return (/* ... */);
}
```

### Client Components

```typescript
'use client';

// Всегда указывать 'use client' в начале файла
// для компонентов с hooks, event handlers, browser APIs
```

## Именование

### Файлы и директории

```
kebab-case для файлов:     product-card.tsx
kebab-case для директорий: repair-service/
```

### Компоненты и типы

```typescript
// PascalCase для компонентов и типов
function ProductCard() {}
type ProductFilter = {};
interface ProductCardProps {}

// camelCase для функций и переменных
function getProductById() {}
const productList = [];
const isLoading = true;

// SCREAMING_SNAKE_CASE для констант
const ORDER_STATUS_LABELS = {};
const MAX_ITEMS_PER_PAGE = 12;
```

### Схемы Zod

```typescript
// Суффикс Schema для Zod схем
const productSchema = z.object({});
const createProductSchema = productSchema.omit({ id: true });

// Тип без суффикса
type Product = z.infer<typeof productSchema>;
type CreateProductInput = z.infer<typeof createProductSchema>;
```

## Импорты

### Порядок импортов

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 2. External libraries
import { z } from 'zod';
import { ChevronRight, ShoppingCart } from 'lucide-react';

// 3. Internal aliases (@/)
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 4. Relative imports
import { ProductCard } from './product-card';
import type { Product } from '../model/schemas';
```

### Type-only imports

```typescript
// Используем type import для типов
import type { Product, ProductFilter } from '../model/schemas';

// Не смешиваем type и value imports
import { productSchema } from '../model/schemas';
import type { Product } from '../model/schemas';
```

## Async/Await

```typescript
// ✅ Хорошо - async/await
export async function getProducts(): Promise<Product[]> {
  const products = await productRepo.findAll();
  return products;
}

// ❌ Избегаем .then() chains
export function getProducts(): Promise<Product[]> {
  return productRepo.findAll().then(products => {
    return products;
  });
}
```

## Error Handling

```typescript
// В API handlers - safeParse для graceful handling
export async function getProducts(params: unknown) {
  const result = schema.safeParse(params);
  
  if (!result.success) {
    // Return defaults или throw custom error
    return { products: [], total: 0 };
  }
  
  return doSomething(result.data);
}

// В критических местах - try/catch
try {
  const data = schema.parse(input);
  await saveToDb(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation error
  }
  throw error;
}
```

## Comments

```typescript
// JSDoc для публичных функций API
/**
 * Получить список продуктов с пагинацией
 * @param params - Параметры запроса (page, limit, filter)
 * @returns Список продуктов и метаданные пагинации
 */
export async function getProducts(params: unknown): Promise<ProductListResponse> {
  // ...
}

// Inline comments для сложной логики
// Применяем фильтры последовательно для оптимизации
if (filter.categorySlug) {
  result = result.filter(/* ... */);
}
```

## Форматирование

### ESLint & Prettier

Проект использует ESLint для линтинга. Основные правила:

- Без trailing commas в однострочных
- Single quotes для строк
- 2 spaces для отступов
- Semicolons required

### Max line length

Стараемся держать строки до 100 символов. Для длинных className:

```typescript
// Переносим на новые строки
<div
  className={cn(
    'rounded-lg border p-4',
    'transition-all hover:shadow-lg',
    isActive && 'border-primary bg-primary/5'
  )}
>
```

## shadcn/ui Components

### Card — правильная структура

```typescript
// ✅ Каждая часть Card на своём месте
<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Подзаголовок</CardDescription>
    <Badge>Тег</Badge>
  </CardHeader>

  <CardContent>
    {/* Основной контент: изображения, текст, списки */}
  </CardContent>

  <CardFooter>
    {/* ТОЛЬКО кнопки и действия */}
    <Button>Действие</Button>
  </CardFooter>
</Card>
```

**Правила:**
- `CardHeader` — заголовок, описание, badges/теги
- `CardContent` — основной контент (изображения, характеристики)
- `CardFooter` — **только** кнопки действий

См. [STYLING.md](./STYLING.md#правильное-использование-card) для подробных примеров.

## Производительность

### Анимации — избегаем избыточных

```typescript
// ❌ НЕ используем scale на карточках
<Card className="hover:scale-105">

// ✅ Только shadow/border/opacity
<Card className="transition-shadow hover:shadow-lg">
```

### Data Fetching — Cache Components

```typescript
// ✅ Кэшируем данные в гридах
async function ProductGrid() {
  'use cache';
  cacheLife('hours');
  const products = await getProducts();
  // ...
}

// ✅ React cache для дедупликации ORM запросов
import { cache } from 'react';

export const getProduct = cache(async (id: string) => {
  return prisma.product.findUnique({ where: { id } });
});

// ✅ Параллельные запросы
const [products, categories] = await Promise.all([
  getProducts(),
  getCategories(),
]);

// ✅ Инвалидация при мутациях
'use server';
import { revalidateTag } from 'next/cache';

export async function updateProduct(id: string, data: Input) {
  await prisma.product.update({ where: { id }, data });
  revalidateTag(`product-${id}`);
}
```

См. [CACHE_COMPONENTS.md](./CACHE_COMPONENTS.md) и [STYLING.md](./STYLING.md#анимации-и-производительность).

## Git Commits

```
feat: добавить фильтрацию по цене в каталог
fix: исправить отображение статуса заказа
refactor: переработать структуру репозиториев
docs: обновить README с архитектурой
style: применить форматирование к компонентам
chore: обновить зависимости
```
