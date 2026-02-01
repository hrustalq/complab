/**
 * Абстрактный интерфейс для подключения к базе данных.
 * Может быть реализован для различных БД (PostgreSQL, MongoDB, in-memory и т.д.)
 */
export interface DatabaseConnection {
  isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

/**
 * Интерфейс для операций чтения
 */
export interface ReadOperations<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  findMany(filter: Partial<T>): Promise<T[]>;
  count(filter?: Partial<T>): Promise<number>;
}

/**
 * Интерфейс для операций записи
 */
export interface WriteOperations<T, ID = string> {
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

/**
 * Полный интерфейс репозитория
 */
export interface Repository<T, ID = string> 
  extends ReadOperations<T, ID>, WriteOperations<T, ID> {}

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
