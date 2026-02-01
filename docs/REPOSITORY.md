# 🗃️ Repository Pattern

## Обзор

Проект использует паттерн **Repository** для абстракции доступа к данным. Это позволяет:

- Легко менять источник данных (in-memory → PostgreSQL → MongoDB)
- Тестировать бизнес-логику независимо от БД
- Централизовать логику запросов
- Переиспользовать общие операции

## Базовый класс репозитория

```typescript
// shared/repository/base-repository.ts

export abstract class BaseRepository<T extends BaseEntity> implements Repository<T> {
  protected data: T[];
  protected db: DatabaseConnection;

  constructor(db: DatabaseConnection, initialData: T[] = []) {
    this.db = db;
    this.data = [...initialData];
  }

  // CRUD операции
  async findById(id: string): Promise<T | null>;
  async findAll(): Promise<T[]>;
  async findMany(filter: Partial<T>): Promise<T[]>;
  async create(data: Omit<T, 'id'>): Promise<T>;
  async update(id: string, data: Partial<T>): Promise<T | null>;
  async delete(id: string): Promise<boolean>;

  // Дополнительные методы
  async count(filter?: Partial<T>): Promise<number>;
  async findWithPagination(...): Promise<PaginatedResult<T>>;
  async findByIds(ids: string[]): Promise<T[]>;
  async exists(id: string): Promise<boolean>;
}
```

## Создание репозитория для Entity

### 1. Наследование от BaseRepository

```typescript
import { BaseRepository } from '@/shared/repository/base-repository';
import type { DatabaseConnection } from '@/shared/database/types';
import type { Product } from './schemas';

export class ProductRepository extends BaseRepository<Product> {
  constructor(db: DatabaseConnection) {
    super(db, initialProducts); // Передаём начальные данные
  }
}
```

### 2. Добавление специфичных методов

```typescript
export class ProductRepository extends BaseRepository<Product> {
  // ...

  /**
   * Поиск по slug (уникальное поле)
   */
  async findBySlug(slug: string): Promise<Product | null> {
    await this.simulateDelay();
    return this.data.find((p) => p.slug === slug) ?? null;
  }

  /**
   * Фильтрация по категории
   */
  async findByCategory(categorySlug: string): Promise<Product[]> {
    await this.simulateDelay();
    return this.data.filter((p) => p.categorySlug === categorySlug);
  }

  /**
   * Сложный поиск с фильтрами
   */
  async findWithFilters(
    filter: ProductFilter,
    pagination: { page: number; limit: number },
    sort?: SortOptions<Product>
  ): Promise<PaginatedResult<Product>> {
    await this.simulateDelay();

    let result = [...this.data];

    // Применяем фильтры
    if (filter.categorySlug) {
      result = result.filter((p) => p.categorySlug === filter.categorySlug);
    }
    if (filter.priceMin !== undefined) {
      result = result.filter((p) => p.price >= filter.priceMin!);
    }
    // ... другие фильтры

    // Сортировка
    if (sort) {
      result.sort((a, b) => {
        // ... логика сортировки
      });
    }

    // Пагинация
    const total = result.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const items = result.slice(startIndex, startIndex + pagination.limit);

    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }
}
```

### 3. Singleton Factory

```typescript
let productRepositoryInstance: ProductRepository | null = null;

export function getProductRepository(db: DatabaseConnection): ProductRepository {
  if (!productRepositoryInstance) {
    productRepositoryInstance = new ProductRepository(db);
  }
  return productRepositoryInstance;
}
```

## Использование в API handlers

```typescript
// api/handlers.ts
import { db } from '@/shared/database/in-memory-connection';
import { getProductRepository } from '../model/repository';

const productRepo = getProductRepository(db);

export async function getProducts() {
  return productRepo.findAll();
}

export async function getProductById(id: string) {
  return productRepo.findById(id);
}
```

## Database Connection

Используем Prisma singleton:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@/app/generated/prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

**Почему singleton:**
- Предотвращает создание множества подключений в dev mode (hot reload)
- Единая точка доступа к БД
- Автоматическое переиспользование connection pool

## Prisma Integration

Проект использует Prisma singleton для работы с базой данных:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@/app/generated/prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### Репозиторий с Prisma

```typescript
// entities/product/model/repository.ts
import prisma from '@/lib/prisma';
import type { Product } from './schemas';

export class ProductRepository {
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async findAll(): Promise<Product[]> {
    return prisma.product.findMany();
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { slug } });
  }

  async findByCategory(categorySlug: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { category: { slug: categorySlug } },
      include: { category: true },
    });
  }

  async findWithPagination(
    filter: Prisma.ProductWhereInput,
    pagination: { page: number; limit: number },
    orderBy?: Prisma.ProductOrderByWithRelationInput
  ) {
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where: filter,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy,
      }),
      prisma.product.count({ where: filter }),
    ]);

    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  }

  async delete(id: string): Promise<boolean> {
    await prisma.product.delete({ where: { id } });
    return true;
  }
}

// Singleton
let instance: ProductRepository | null = null;

export function getProductRepository(): ProductRepository {
  if (!instance) {
    instance = new ProductRepository();
  }
  return instance;
}
```

### BaseRepository с Prisma

```typescript
// shared/repository/base-repository.ts
import prisma from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected abstract modelName: string;

  constructor() {
    this.prisma = prisma;
  }

  protected get model() {
    return (this.prisma as any)[this.modelName];
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

  async update(id: string, data: UpdateInput): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<boolean> {
    await this.model.delete({ where: { id } });
    return true;
  }
}
```

## Типы данных

```typescript
// shared/database/types.ts

interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  findMany(filter: Partial<T>): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SortOptions<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

interface BaseEntity {
  id: string;
}
```
