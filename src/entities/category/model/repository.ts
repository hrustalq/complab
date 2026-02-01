import { BaseRepository } from '@/shared/repository/base-repository';
import type { DatabaseConnection } from '@/shared/database/types';
import type { Category, CategoryWithChildren, CategoryBreadcrumb } from './schemas';

/**
 * Начальные данные категорий
 */
const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Компьютеры и ноутбуки',
    slug: 'computers',
    description: 'Настольные ПК, ноутбуки и моноблоки',
    icon: 'Monitor',
    order: 1,
    isActive: true,
  },
  {
    id: '1-1',
    name: 'Ноутбуки',
    slug: 'laptops',
    parentId: '1',
    order: 1,
    isActive: true,
  },
  {
    id: '1-2',
    name: 'Настольные ПК',
    slug: 'desktop-pcs',
    parentId: '1',
    order: 2,
    isActive: true,
  },
  {
    id: '1-3',
    name: 'Моноблоки',
    slug: 'all-in-one',
    parentId: '1',
    order: 3,
    isActive: true,
  },
  {
    id: '2',
    name: 'Комплектующие',
    slug: 'components',
    description: 'Процессоры, видеокарты, память и накопители',
    icon: 'Cpu',
    order: 2,
    isActive: true,
  },
  {
    id: '2-1',
    name: 'Процессоры',
    slug: 'processors',
    parentId: '2',
    order: 1,
    isActive: true,
  },
  {
    id: '2-2',
    name: 'Видеокарты',
    slug: 'graphics-cards',
    parentId: '2',
    order: 2,
    isActive: true,
  },
  {
    id: '2-3',
    name: 'Оперативная память',
    slug: 'ram',
    parentId: '2',
    order: 3,
    isActive: true,
  },
  {
    id: '2-4',
    name: 'SSD накопители',
    slug: 'ssd',
    parentId: '2',
    order: 4,
    isActive: true,
  },
  {
    id: '2-5',
    name: 'Материнские платы',
    slug: 'motherboards',
    parentId: '2',
    order: 5,
    isActive: true,
  },
  {
    id: '2-6',
    name: 'Блоки питания',
    slug: 'power-supplies',
    parentId: '2',
    order: 6,
    isActive: true,
  },
  {
    id: '2-7',
    name: 'Корпуса',
    slug: 'cases',
    parentId: '2',
    order: 7,
    isActive: true,
  },
  {
    id: '2-8',
    name: 'Системы охлаждения',
    slug: 'cooling',
    parentId: '2',
    order: 8,
    isActive: true,
  },
  {
    id: '3',
    name: 'Периферия',
    slug: 'peripherals',
    description: 'Мониторы, клавиатуры, мыши и гарнитуры',
    icon: 'Mouse',
    order: 3,
    isActive: true,
  },
  {
    id: '3-1',
    name: 'Мониторы',
    slug: 'monitors',
    parentId: '3',
    order: 1,
    isActive: true,
  },
  {
    id: '3-2',
    name: 'Клавиатуры',
    slug: 'keyboards',
    parentId: '3',
    order: 2,
    isActive: true,
  },
  {
    id: '3-3',
    name: 'Мыши',
    slug: 'mice',
    parentId: '3',
    order: 3,
    isActive: true,
  },
  {
    id: '3-4',
    name: 'Наушники и гарнитуры',
    slug: 'headsets',
    parentId: '3',
    order: 4,
    isActive: true,
  },
  {
    id: '3-5',
    name: 'Веб-камеры',
    slug: 'webcams',
    parentId: '3',
    order: 5,
    isActive: true,
  },
  {
    id: '4',
    name: 'Сетевое оборудование',
    slug: 'networking',
    description: 'Роутеры, коммутаторы и сетевые карты',
    icon: 'Wifi',
    order: 4,
    isActive: true,
  },
  {
    id: '4-1',
    name: 'Wi-Fi роутеры',
    slug: 'routers',
    parentId: '4',
    order: 1,
    isActive: true,
  },
  {
    id: '4-2',
    name: 'Сетевые карты',
    slug: 'network-cards',
    parentId: '4',
    order: 2,
    isActive: true,
  },
  {
    id: '5',
    name: 'Услуги ремонта',
    slug: 'repair-services',
    description: 'Профессиональный ремонт компьютерной техники',
    icon: 'Wrench',
    order: 5,
    isActive: true,
  },
];

/**
 * Репозиторий категорий
 */
export class CategoryRepository extends BaseRepository<Category> {
  constructor(db: DatabaseConnection) {
    super(db, initialCategories);
  }

  /**
   * Поиск по slug
   */
  async findBySlug(slug: string): Promise<Category | null> {
    await this.simulateDelay();
    return this.data.find((c) => c.slug === slug) ?? null;
  }

  /**
   * Получить дерево категорий (родительские с детьми)
   */
  async findTree(): Promise<CategoryWithChildren[]> {
    await this.simulateDelay();
    const rootCategories = this.data.filter((c) => !c.parentId && c.isActive);
    
    return rootCategories
      .sort((a, b) => a.order - b.order)
      .map((parent) => ({
        ...parent,
        children: this.data
          .filter((c) => c.parentId === parent.id && c.isActive)
          .sort((a, b) => a.order - b.order),
      }));
  }

  /**
   * Получить дочерние категории
   */
  async findChildren(parentId: string): Promise<Category[]> {
    await this.simulateDelay();
    return this.data
      .filter((c) => c.parentId === parentId && c.isActive)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Получить хлебные крошки для категории
   */
  async getBreadcrumbs(categoryId: string): Promise<CategoryBreadcrumb[]> {
    await this.simulateDelay();
    const breadcrumbs: CategoryBreadcrumb[] = [];
    let current = this.data.find((c) => c.id === categoryId);

    while (current) {
      breadcrumbs.unshift({
        id: current.id,
        name: current.name,
        slug: current.slug,
      });
      current = current.parentId
        ? this.data.find((c) => c.id === current!.parentId)
        : undefined;
    }

    return breadcrumbs;
  }

  /**
   * Получить корневые категории
   */
  async findRootCategories(): Promise<Category[]> {
    await this.simulateDelay();
    return this.data
      .filter((c) => !c.parentId && c.isActive)
      .sort((a, b) => a.order - b.order);
  }
}

// Singleton instance
let categoryRepositoryInstance: CategoryRepository | null = null;

export function getCategoryRepository(db: DatabaseConnection): CategoryRepository {
  if (!categoryRepositoryInstance) {
    categoryRepositoryInstance = new CategoryRepository(db);
  }
  return categoryRepositoryInstance;
}
