import { BaseRepository } from '@/shared/repository/base-repository';
import type { DatabaseConnection, PaginatedResult, SortOptions } from '@/shared/database/types';
import type { Product, ProductFilter } from './schemas';

/**
 * Начальные данные товаров
 */
const initialProducts: Product[] = [
  // Ноутбуки
  {
    id: 'prod-1',
    name: 'ASUS ROG Strix G16 Gaming Laptop',
    slug: 'asus-rog-strix-g16',
    description: 'Мощный игровой ноутбук с процессором Intel Core i7-13650HX и видеокартой NVIDIA GeForce RTX 4060. 16" IPS дисплей с частотой 165Hz обеспечивает плавную картинку в играх.',
    shortDescription: 'Intel Core i7-13650HX, RTX 4060, 16GB RAM, 512GB SSD',
    price: 149990,
    oldPrice: 169990,
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600',
    ],
    categoryId: '1-1',
    categorySlug: 'laptops',
    brand: 'ASUS',
    sku: 'ASUS-ROG-G16-001',
    inStock: true,
    stockQuantity: 15,
    specifications: [
      { name: 'Процессор', value: 'Intel Core i7-13650HX', group: 'Производительность' },
      { name: 'Видеокарта', value: 'NVIDIA GeForce RTX 4060 8GB', group: 'Производительность' },
      { name: 'Оперативная память', value: '16GB DDR5', group: 'Производительность' },
      { name: 'Накопитель', value: '512GB NVMe SSD', group: 'Хранение' },
      { name: 'Дисплей', value: '16" IPS, 2560x1600, 165Hz', group: 'Дисплей' },
      { name: 'Вес', value: '2.5 кг', group: 'Габариты' },
    ],
    rating: 4.8,
    reviewsCount: 124,
    isNew: true,
    isFeatured: true,
    isOnSale: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'prod-2',
    name: 'Apple MacBook Pro 14" M3 Pro',
    slug: 'macbook-pro-14-m3-pro',
    description: 'Профессиональный ноутбук Apple с революционным чипом M3 Pro. Liquid Retina XDR дисплей, до 18 часов автономной работы.',
    shortDescription: 'Apple M3 Pro, 18GB RAM, 512GB SSD, Liquid Retina XDR',
    price: 249990,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
    categoryId: '1-1',
    categorySlug: 'laptops',
    brand: 'Apple',
    sku: 'APPLE-MBP14-M3P',
    inStock: true,
    stockQuantity: 8,
    specifications: [
      { name: 'Процессор', value: 'Apple M3 Pro (12-core)', group: 'Производительность' },
      { name: 'GPU', value: '18-core GPU', group: 'Производительность' },
      { name: 'Оперативная память', value: '18GB Unified Memory', group: 'Производительность' },
      { name: 'Накопитель', value: '512GB SSD', group: 'Хранение' },
      { name: 'Дисплей', value: '14.2" Liquid Retina XDR, 3024x1964', group: 'Дисплей' },
    ],
    rating: 4.9,
    reviewsCount: 89,
    isFeatured: true,
    createdAt: '2024-02-01',
  },
  // Видеокарты
  {
    id: 'prod-3',
    name: 'NVIDIA GeForce RTX 4080 Super Founders Edition',
    slug: 'nvidia-rtx-4080-super-fe',
    description: 'Флагманская видеокарта NVIDIA с архитектурой Ada Lovelace. Исключительная производительность в играх и работе с ИИ.',
    shortDescription: '16GB GDDR6X, 2550MHz, 320-bit',
    price: 119990,
    oldPrice: 134990,
    images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600'],
    categoryId: '2-2',
    categorySlug: 'graphics-cards',
    brand: 'NVIDIA',
    sku: 'NV-RTX4080S-FE',
    inStock: true,
    stockQuantity: 5,
    specifications: [
      { name: 'Видеопамять', value: '16GB GDDR6X', group: 'Память' },
      { name: 'Шина памяти', value: '256-bit', group: 'Память' },
      { name: 'Boost Clock', value: '2550 MHz', group: 'Частоты' },
      { name: 'CUDA ядра', value: '10240', group: 'Архитектура' },
      { name: 'TDP', value: '320W', group: 'Питание' },
      { name: 'Разъемы', value: '3x DisplayPort 1.4a, 1x HDMI 2.1', group: 'Интерфейсы' },
    ],
    rating: 4.7,
    reviewsCount: 67,
    isOnSale: true,
    isFeatured: true,
    createdAt: '2024-01-20',
  },
  {
    id: 'prod-4',
    name: 'AMD Radeon RX 7900 XTX',
    slug: 'amd-rx-7900-xtx',
    description: 'Топовая видеокарта AMD на архитектуре RDNA 3. Отличный выбор для 4K гейминга.',
    shortDescription: '24GB GDDR6, 2500MHz, 384-bit',
    price: 104990,
    images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600'],
    categoryId: '2-2',
    categorySlug: 'graphics-cards',
    brand: 'AMD',
    sku: 'AMD-RX7900XTX',
    inStock: true,
    stockQuantity: 12,
    specifications: [
      { name: 'Видеопамять', value: '24GB GDDR6', group: 'Память' },
      { name: 'Шина памяти', value: '384-bit', group: 'Память' },
      { name: 'Game Clock', value: '2300 MHz', group: 'Частоты' },
      { name: 'Stream процессоры', value: '6144', group: 'Архитектура' },
      { name: 'TDP', value: '355W', group: 'Питание' },
    ],
    rating: 4.6,
    reviewsCount: 45,
    createdAt: '2024-01-10',
  },
  // Процессоры
  {
    id: 'prod-5',
    name: 'Intel Core i9-14900K',
    slug: 'intel-core-i9-14900k',
    description: 'Флагманский процессор Intel 14-го поколения. 24 ядра (8P+16E) и частота до 6.0 GHz.',
    shortDescription: '24 ядра, 32 потока, до 6.0 GHz, LGA1700',
    price: 54990,
    images: ['https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600'],
    categoryId: '2-1',
    categorySlug: 'processors',
    brand: 'Intel',
    sku: 'INTEL-I9-14900K',
    inStock: true,
    stockQuantity: 20,
    specifications: [
      { name: 'Ядра/Потоки', value: '24 (8P+16E) / 32', group: 'Архитектура' },
      { name: 'Базовая частота P-ядер', value: '3.2 GHz', group: 'Частоты' },
      { name: 'Turbo частота', value: '6.0 GHz', group: 'Частоты' },
      { name: 'Кэш L3', value: '36MB', group: 'Кэш' },
      { name: 'TDP', value: '125W (253W PL2)', group: 'Питание' },
      { name: 'Сокет', value: 'LGA1700', group: 'Совместимость' },
    ],
    rating: 4.8,
    reviewsCount: 156,
    isFeatured: true,
    createdAt: '2024-01-05',
  },
  {
    id: 'prod-6',
    name: 'AMD Ryzen 9 7950X3D',
    slug: 'amd-ryzen-9-7950x3d',
    description: 'Лучший игровой процессор с технологией 3D V-Cache. Непревзойденная производительность в играх.',
    shortDescription: '16 ядер, 32 потока, до 5.7 GHz, AM5',
    price: 59990,
    images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600'],
    categoryId: '2-1',
    categorySlug: 'processors',
    brand: 'AMD',
    sku: 'AMD-R9-7950X3D',
    inStock: true,
    stockQuantity: 10,
    specifications: [
      { name: 'Ядра/Потоки', value: '16 / 32', group: 'Архитектура' },
      { name: 'Базовая частота', value: '4.2 GHz', group: 'Частоты' },
      { name: 'Boost частота', value: '5.7 GHz', group: 'Частоты' },
      { name: 'Кэш L3', value: '128MB (с 3D V-Cache)', group: 'Кэш' },
      { name: 'TDP', value: '120W', group: 'Питание' },
      { name: 'Сокет', value: 'AM5', group: 'Совместимость' },
    ],
    rating: 4.9,
    reviewsCount: 98,
    isNew: true,
    isFeatured: true,
    createdAt: '2024-02-10',
  },
  // Мониторы
  {
    id: 'prod-7',
    name: 'Samsung Odyssey G9 49" DQHD',
    slug: 'samsung-odyssey-g9-49',
    description: 'Ультраширокий изогнутый игровой монитор 49" с разрешением 5120x1440 и частотой 240Hz.',
    shortDescription: '49" VA, 5120x1440, 240Hz, 1ms, HDR1000',
    price: 129990,
    oldPrice: 149990,
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600'],
    categoryId: '3-1',
    categorySlug: 'monitors',
    brand: 'Samsung',
    sku: 'SAM-G9-49-240',
    inStock: true,
    stockQuantity: 4,
    specifications: [
      { name: 'Диагональ', value: '49"', group: 'Дисплей' },
      { name: 'Разрешение', value: '5120x1440 (DQHD)', group: 'Дисплей' },
      { name: 'Тип матрицы', value: 'VA', group: 'Дисплей' },
      { name: 'Частота обновления', value: '240Hz', group: 'Производительность' },
      { name: 'Время отклика', value: '1ms (GTG)', group: 'Производительность' },
      { name: 'HDR', value: 'HDR1000', group: 'Изображение' },
      { name: 'Изгиб', value: '1000R', group: 'Дизайн' },
    ],
    rating: 4.7,
    reviewsCount: 34,
    isOnSale: true,
    createdAt: '2024-01-25',
  },
  {
    id: 'prod-8',
    name: 'LG UltraGear 27GP850-B',
    slug: 'lg-ultragear-27gp850',
    description: 'Игровой монитор с Nano IPS матрицей и временем отклика 1мс. G-Sync и FreeSync Premium.',
    shortDescription: '27" Nano IPS, 2560x1440, 180Hz, 1ms',
    price: 44990,
    images: ['https://images.unsplash.com/photo-1616763355603-9755a640a287?w=600'],
    categoryId: '3-1',
    categorySlug: 'monitors',
    brand: 'LG',
    sku: 'LG-27GP850-B',
    inStock: true,
    stockQuantity: 18,
    specifications: [
      { name: 'Диагональ', value: '27"', group: 'Дисплей' },
      { name: 'Разрешение', value: '2560x1440 (QHD)', group: 'Дисплей' },
      { name: 'Тип матрицы', value: 'Nano IPS', group: 'Дисплей' },
      { name: 'Частота обновления', value: '180Hz', group: 'Производительность' },
      { name: 'Время отклика', value: '1ms (GTG)', group: 'Производительность' },
    ],
    rating: 4.6,
    reviewsCount: 78,
    createdAt: '2024-01-08',
  },
  // SSD
  {
    id: 'prod-9',
    name: 'Samsung 990 Pro 2TB NVMe',
    slug: 'samsung-990-pro-2tb',
    description: 'Топовый NVMe SSD с интерфейсом PCIe 4.0. Скорость чтения до 7450 MB/s.',
    shortDescription: '2TB, PCIe 4.0 x4, 7450/6900 MB/s',
    price: 18990,
    oldPrice: 22990,
    images: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600'],
    categoryId: '2-4',
    categorySlug: 'ssd',
    brand: 'Samsung',
    sku: 'SAM-990PRO-2TB',
    inStock: true,
    stockQuantity: 35,
    specifications: [
      { name: 'Объем', value: '2TB', group: 'Емкость' },
      { name: 'Интерфейс', value: 'PCIe 4.0 x4 NVMe', group: 'Интерфейс' },
      { name: 'Скорость чтения', value: '7450 MB/s', group: 'Производительность' },
      { name: 'Скорость записи', value: '6900 MB/s', group: 'Производительность' },
      { name: 'TBW', value: '1200 TB', group: 'Надежность' },
      { name: 'Форм-фактор', value: 'M.2 2280', group: 'Физические' },
    ],
    rating: 4.9,
    reviewsCount: 234,
    isOnSale: true,
    isFeatured: true,
    createdAt: '2024-01-12',
  },
  // Клавиатуры
  {
    id: 'prod-10',
    name: 'Keychron Q1 Pro Mechanical Keyboard',
    slug: 'keychron-q1-pro',
    description: 'Премиальная механическая клавиатура с беспроводным подключением. Алюминиевый корпус, gasket mount.',
    shortDescription: '75%, Gateron G Pro, RGB, Bluetooth/USB-C',
    price: 17990,
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=600'],
    categoryId: '3-2',
    categorySlug: 'keyboards',
    brand: 'Keychron',
    sku: 'KEY-Q1-PRO',
    inStock: true,
    stockQuantity: 22,
    specifications: [
      { name: 'Раскладка', value: '75% (84 клавиши)', group: 'Дизайн' },
      { name: 'Переключатели', value: 'Gateron G Pro (Hot-swap)', group: 'Механика' },
      { name: 'Подключение', value: 'Bluetooth 5.1 / USB-C', group: 'Интерфейс' },
      { name: 'Подсветка', value: 'RGB', group: 'Освещение' },
      { name: 'Материал корпуса', value: 'Алюминий CNC', group: 'Конструкция' },
      { name: 'Крепление', value: 'Gasket Mount', group: 'Конструкция' },
    ],
    rating: 4.8,
    reviewsCount: 56,
    isNew: true,
    createdAt: '2024-02-05',
  },
  // Мыши
  {
    id: 'prod-11',
    name: 'Logitech G Pro X Superlight 2',
    slug: 'logitech-gpro-x-superlight-2',
    description: 'Ультралегкая беспроводная игровая мышь весом всего 60г. Сенсор HERO 2 с разрешением до 32000 DPI.',
    shortDescription: '60г, HERO 2, 32000 DPI, LIGHTSPEED',
    price: 14990,
    images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=600'],
    categoryId: '3-3',
    categorySlug: 'mice',
    brand: 'Logitech',
    sku: 'LOG-GPROX-SL2',
    inStock: true,
    stockQuantity: 28,
    specifications: [
      { name: 'Вес', value: '60г', group: 'Физические' },
      { name: 'Сенсор', value: 'HERO 2', group: 'Сенсор' },
      { name: 'DPI', value: 'до 32000', group: 'Сенсор' },
      { name: 'Подключение', value: 'LIGHTSPEED Wireless', group: 'Интерфейс' },
      { name: 'Время работы', value: 'до 95 часов', group: 'Автономность' },
      { name: 'Переключатели', value: 'LIGHTFORCE Hybrid', group: 'Механика' },
    ],
    rating: 4.9,
    reviewsCount: 189,
    isFeatured: true,
    createdAt: '2024-01-18',
  },
  // Оперативная память
  {
    id: 'prod-12',
    name: 'G.Skill Trident Z5 RGB DDR5-6400 32GB',
    slug: 'gskill-trident-z5-ddr5-6400-32gb',
    description: 'Комплект оперативной памяти DDR5 для энтузиастов. 2x16GB с частотой 6400MHz и RGB подсветкой.',
    shortDescription: '2x16GB, DDR5-6400, CL32, RGB',
    price: 21990,
    images: ['https://images.unsplash.com/photo-1562976540-1502c2145186?w=600'],
    categoryId: '2-3',
    categorySlug: 'ram',
    brand: 'G.Skill',
    sku: 'GSK-TZ5-6400-32',
    inStock: true,
    stockQuantity: 14,
    specifications: [
      { name: 'Объем', value: '32GB (2x16GB)', group: 'Емкость' },
      { name: 'Тип', value: 'DDR5', group: 'Технология' },
      { name: 'Частота', value: '6400MHz', group: 'Производительность' },
      { name: 'Тайминги', value: 'CL32-39-39-102', group: 'Производительность' },
      { name: 'Напряжение', value: '1.4V', group: 'Питание' },
      { name: 'Подсветка', value: 'RGB', group: 'Освещение' },
    ],
    rating: 4.7,
    reviewsCount: 67,
    createdAt: '2024-01-22',
  },
];

/**
 * Репозиторий товаров
 */
export class ProductRepository extends BaseRepository<Product> {
  constructor(db: DatabaseConnection) {
    super(db, initialProducts);
  }

  /**
   * Поиск по slug
   */
  async findBySlug(slug: string): Promise<Product | null> {
    await this.simulateDelay();
    return this.data.find((p) => p.slug === slug) ?? null;
  }

  /**
   * Поиск по категории
   */
  async findByCategory(categorySlug: string): Promise<Product[]> {
    await this.simulateDelay();
    return this.data.filter((p) => p.categorySlug === categorySlug);
  }

  /**
   * Поиск с фильтрами
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
    if (filter.brands && filter.brands.length > 0) {
      result = result.filter((p) => filter.brands!.includes(p.brand));
    }
    if (filter.priceMin !== undefined) {
      result = result.filter((p) => p.price >= filter.priceMin!);
    }
    if (filter.priceMax !== undefined) {
      result = result.filter((p) => p.price <= filter.priceMax!);
    }
    if (filter.inStock !== undefined) {
      result = result.filter((p) => p.inStock === filter.inStock);
    }
    if (filter.isNew) {
      result = result.filter((p) => p.isNew);
    }
    if (filter.isOnSale) {
      result = result.filter((p) => p.isOnSale);
    }
    if (filter.search) {
      const lowerSearch = filter.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.shortDescription.toLowerCase().includes(lowerSearch) ||
          p.brand.toLowerCase().includes(lowerSearch)
      );
    }

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
   * Получить рекомендуемые товары
   */
  async findFeatured(limit = 8): Promise<Product[]> {
    await this.simulateDelay();
    return this.data.filter((p) => p.isFeatured).slice(0, limit);
  }

  /**
   * Получить новинки
   */
  async findNew(limit = 8): Promise<Product[]> {
    await this.simulateDelay();
    return this.data.filter((p) => p.isNew).slice(0, limit);
  }

  /**
   * Получить товары со скидкой
   */
  async findOnSale(limit = 8): Promise<Product[]> {
    await this.simulateDelay();
    return this.data.filter((p) => p.isOnSale).slice(0, limit);
  }

  /**
   * Текстовый поиск
   */
  async search(query: string, limit?: number): Promise<Product[]> {
    await this.simulateDelay();
    const lowerQuery = query.toLowerCase();
    const result = this.data.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.shortDescription.toLowerCase().includes(lowerQuery) ||
        p.brand.toLowerCase().includes(lowerQuery)
    );
    return limit ? result.slice(0, limit) : result;
  }

  /**
   * Получить похожие товары
   */
  async findRelated(product: Product, limit = 4): Promise<Product[]> {
    await this.simulateDelay();
    return this.data
      .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
      .slice(0, limit);
  }

  /**
   * Получить уникальные бренды
   */
  async getBrands(): Promise<string[]> {
    const brands = new Set(this.data.map((p) => p.brand));
    return Array.from(brands).sort();
  }
}

// Singleton instance
let productRepositoryInstance: ProductRepository | null = null;

export function getProductRepository(db: DatabaseConnection): ProductRepository {
  if (!productRepositoryInstance) {
    productRepositoryInstance = new ProductRepository(db);
  }
  return productRepositoryInstance;
}
