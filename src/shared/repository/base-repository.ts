import prisma from '@/lib/prisma';
import type { PrismaClient } from '@/app/generated/prisma/client';
import type { PaginationOptions, PaginatedResult } from '../database/types';

/**
 * Generic Prisma delegate type for model operations
 */
type PrismaModelDelegate = {
  findUnique: (args: { where: { id: string } }) => Promise<unknown>;
  findMany: (args?: object) => Promise<unknown[]>;
  count: (args?: object) => Promise<number>;
  create: (args: { data: object }) => Promise<unknown>;
  update: (args: { where: { id: string }; data: object }) => Promise<unknown>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

/**
 * Abstract base repository using Prisma ORM.
 * Provides common CRUD operations for all entities.
 *
 * @example
 * class ProductRepository extends PrismaBaseRepository<Product, Prisma.ProductCreateInput, Prisma.ProductUpdateInput> {
 *   protected modelName = 'product' as const;
 *
 *   async findBySlug(slug: string): Promise<Product | null> {
 *     return this.prisma.product.findUnique({ where: { slug } });
 *   }
 * }
 */
export abstract class PrismaBaseRepository<
  T extends { id: string },
  CreateInput = Omit<T, 'id'>,
  UpdateInput = Partial<Omit<T, 'id'>>,
> {
  protected prisma: PrismaClient;

  /**
   * Prisma model name (e.g., 'product', 'category', 'user')
   * Must be lowercase and match the Prisma model name
   */
  protected abstract modelName: keyof Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get the Prisma model delegate
   */
  protected get model(): PrismaModelDelegate {
    return this.prisma[this.modelName] as unknown as PrismaModelDelegate;
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } }) as Promise<T | null>;
  }

  /**
   * Find all entities
   */
  async findAll(): Promise<T[]> {
    return this.model.findMany() as Promise<T[]>;
  }

  /**
   * Count entities
   */
  async count(where?: object): Promise<number> {
    return this.model.count(where ? { where } : undefined);
  }

  /**
   * Create new entity
   */
  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data: data as object }) as Promise<T>;
  }

  /**
   * Update entity by ID
   */
  async update(id: string, data: UpdateInput): Promise<T | null> {
    try {
      return (await this.model.update({
        where: { id },
        data: data as object,
      })) as T;
    } catch {
      return null;
    }
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.model.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({ where: { id } });
    return count > 0;
  }

  /**
   * Find with pagination
   * Override in specific repositories for proper typing
   */
  async findWithPagination(
    where: object | undefined,
    pagination: PaginationOptions,
    orderBy?: object
  ): Promise<PaginatedResult<T>> {
    const model = this.prisma[this.modelName] as unknown as {
      findMany: (args: object) => Promise<T[]>;
      count: (args?: object) => Promise<number>;
    };

    const [items, total] = await Promise.all([
      model.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy,
      }),
      model.count(where ? { where } : undefined),
    ]);

    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }
}

/**
 * Legacy in-memory base repository for backward compatibility.
 * Use PrismaBaseRepository for new implementations.
 *
 * @deprecated Use PrismaBaseRepository instead
 */
export abstract class BaseRepository<T extends { id: string }> {
  protected data: T[];

  constructor(initialData: T[] = []) {
    this.data = [...initialData];
  }

  protected async simulateDelay(ms = 50): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async findById(id: string): Promise<T | null> {
    await this.simulateDelay();
    return this.data.find((item) => item.id === id) ?? null;
  }

  async findAll(): Promise<T[]> {
    await this.simulateDelay();
    return [...this.data];
  }

  async findMany(filter: Partial<T>): Promise<T[]> {
    await this.simulateDelay();
    return this.data.filter((item) => {
      return Object.entries(filter).every(([key, value]) => {
        return item[key as keyof T] === value;
      });
    });
  }

  async count(filter?: Partial<T>): Promise<number> {
    if (!filter) {
      return this.data.length;
    }
    const filtered = await this.findMany(filter);
    return filtered.length;
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    await this.simulateDelay(100);
    const newItem = {
      ...data,
      id: this.generateId(),
    } as T;
    this.data.push(newItem);
    return newItem;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.simulateDelay(100);
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) return null;

    this.data[index] = { ...this.data[index], ...data };
    return this.data[index];
  }

  async delete(id: string): Promise<boolean> {
    await this.simulateDelay(100);
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.data.splice(index, 1);
    return true;
  }

  async exists(id: string): Promise<boolean> {
    return this.data.some((item) => item.id === id);
  }

  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
