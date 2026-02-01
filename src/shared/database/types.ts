/**
 * Интерфейс для операций чтения
 */
export interface ReadOperations<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  count(filter?: object): Promise<number>;
}

/**
 * Интерфейс для операций записи
 */
export interface WriteOperations<T, ID = string, CreateInput = Omit<T, 'id'>, UpdateInput = Partial<T>> {
  create(data: CreateInput): Promise<T>;
  update(id: ID, data: UpdateInput): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

/**
 * Полный интерфейс репозитория
 */
export interface Repository<T, ID = string, CreateInput = Omit<T, 'id'>, UpdateInput = Partial<T>>
  extends ReadOperations<T, ID>,
    WriteOperations<T, ID, CreateInput, UpdateInput> {}

/**
 * Опции пагинации
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Результат пагинации
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Опции сортировки
 */
export interface SortOptions<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Базовая сущность с id
 */
export interface BaseEntity {
  id: string;
}

/**
 * @deprecated Use Prisma client directly via `import prisma from '@/lib/prisma'`
 */
export interface DatabaseConnection {
  isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
