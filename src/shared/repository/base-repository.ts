import type {
  Repository,
  DatabaseConnection,
  PaginationOptions,
  PaginatedResult,
  SortOptions,
  BaseEntity,
} from '../database/types';

/**
 * Абстрактный базовый репозиторий с in-memory хранилищем.
 * Наследуйте этот класс для создания репозиториев конкретных сущностей.
 * 
 * @example
 * class ProductRepository extends BaseRepository<Product> {
 *   constructor(db: DatabaseConnection) {
 *     super(db, mockProducts);
 *   }
 *   
 *   // Дополнительные методы специфичные для продуктов
 *   findByCategory(categorySlug: string): Promise<Product[]> {
 *     return this.findMany({ categorySlug } as Partial<Product>);
 *   }
 * }
 */
export abstract class BaseRepository<T extends BaseEntity> implements Repository<T> {
  protected data: T[];
  protected db: DatabaseConnection;

  constructor(db: DatabaseConnection, initialData: T[] = []) {
    this.db = db;
    this.data = [...initialData];
  }

  /**
   * Симуляция задержки сети/БД
   */
  protected async simulateDelay(ms = 50): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Поиск по ID
   */
  async findById(id: string): Promise<T | null> {
    await this.simulateDelay();
    return this.data.find((item) => item.id === id) ?? null;
  }

  /**
   * Получить все записи
   */
  async findAll(): Promise<T[]> {
    await this.simulateDelay();
    return [...this.data];
  }

  /**
   * Поиск по фильтру
   */
  async findMany(filter: Partial<T>): Promise<T[]> {
    await this.simulateDelay();
    return this.data.filter((item) => {
      return Object.entries(filter).every(([key, value]) => {
        return item[key as keyof T] === value;
      });
    });
  }

  /**
   * Подсчет записей
   */
  async count(filter?: Partial<T>): Promise<number> {
    if (!filter) {
      return this.data.length;
    }
    const filtered = await this.findMany(filter);
    return filtered.length;
  }

  /**
   * Создание записи
   */
  async create(data: Omit<T, 'id'>): Promise<T> {
    await this.simulateDelay(100);
    const newItem = {
      ...data,
      id: this.generateId(),
    } as T;
    this.data.push(newItem);
    return newItem;
  }

  /**
   * Обновление записи
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.simulateDelay(100);
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) return null;

    this.data[index] = { ...this.data[index], ...data };
    return this.data[index];
  }

  /**
   * Удаление записи
   */
  async delete(id: string): Promise<boolean> {
    await this.simulateDelay(100);
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.data.splice(index, 1);
    return true;
  }

  /**
   * Пагинация результатов
   */
  async findWithPagination(
    filter: Partial<T> | undefined,
    pagination: PaginationOptions,
    sort?: SortOptions<T>
  ): Promise<PaginatedResult<T>> {
    await this.simulateDelay();

    const result = filter ? await this.findMany(filter) : [...this.data];

    // Сортировка
    if (sort) {
      result.sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sort.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    const total = result.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const items = result.slice(startIndex, startIndex + pagination.limit);

    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  /**
   * Поиск по массиву ID
   */
  async findByIds(ids: string[]): Promise<T[]> {
    await this.simulateDelay();
    return this.data.filter((item) => ids.includes(item.id));
  }

  /**
   * Проверка существования записи
   */
  async exists(id: string): Promise<boolean> {
    return this.data.some((item) => item.id === id);
  }

  /**
   * Генерация уникального ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
