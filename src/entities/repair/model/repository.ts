import { BaseRepository } from '@/shared/repository/base-repository';
import type { DatabaseConnection } from '@/shared/database/types';
import type { RepairService, RepairRequest, RepairCategory } from './schemas';

/**
 * Начальные данные услуг ремонта
 */
const initialRepairServices: RepairService[] = [
  // Ноутбуки
  {
    id: 'rs-1',
    name: 'Замена матрицы ноутбука',
    description: 'Замена поврежденного или неисправного экрана ноутбука',
    category: 'laptop',
    estimatedTime: '1-2 дня',
    priceFrom: 3500,
    priceTo: 15000,
    isPopular: true,
  },
  {
    id: 'rs-2',
    name: 'Замена клавиатуры ноутбука',
    description: 'Установка новой клавиатуры взамен поврежденной',
    category: 'laptop',
    estimatedTime: '1-3 часа',
    priceFrom: 2000,
    priceTo: 8000,
    isPopular: true,
  },
  {
    id: 'rs-3',
    name: 'Чистка ноутбука от пыли',
    description: 'Профессиональная чистка системы охлаждения и замена термопасты',
    category: 'laptop',
    estimatedTime: '1-2 часа',
    priceFrom: 1500,
    priceTo: 3000,
    isPopular: true,
  },
  {
    id: 'rs-4',
    name: 'Ремонт материнской платы ноутбука',
    description: 'Диагностика и ремонт неисправностей материнской платы',
    category: 'laptop',
    estimatedTime: '2-5 дней',
    priceFrom: 3000,
    priceTo: 12000,
  },
  {
    id: 'rs-5',
    name: 'Замена батареи ноутбука',
    description: 'Установка новой оригинальной или совместимой батареи',
    category: 'laptop',
    estimatedTime: '30 минут',
    priceFrom: 500,
    priceTo: 1500,
  },
  // Настольные ПК
  {
    id: 'rs-6',
    name: 'Сборка компьютера',
    description: 'Профессиональная сборка ПК из комплектующих заказчика',
    category: 'desktop',
    estimatedTime: '2-4 часа',
    priceFrom: 3000,
    priceTo: 7000,
    isPopular: true,
  },
  {
    id: 'rs-7',
    name: 'Диагностика компьютера',
    description: 'Полная диагностика всех компонентов системного блока',
    category: 'desktop',
    estimatedTime: '1 час',
    priceFrom: 500,
    priceTo: 1500,
  },
  {
    id: 'rs-8',
    name: 'Установка/переустановка Windows',
    description: 'Установка операционной системы с настройкой драйверов',
    category: 'desktop',
    estimatedTime: '1-2 часа',
    priceFrom: 1000,
    priceTo: 2500,
  },
  // Мониторы
  {
    id: 'rs-9',
    name: 'Ремонт монитора',
    description: 'Диагностика и устранение неисправностей монитора',
    category: 'monitor',
    estimatedTime: '1-5 дней',
    priceFrom: 2000,
    priceTo: 10000,
  },
  {
    id: 'rs-10',
    name: 'Замена подсветки монитора',
    description: 'Замена LED-подсветки или инвертора',
    category: 'monitor',
    estimatedTime: '1-2 дня',
    priceFrom: 2500,
    priceTo: 6000,
  },
  // Восстановление данных
  {
    id: 'rs-11',
    name: 'Восстановление данных с HDD',
    description: 'Восстановление информации с поврежденного жесткого диска',
    category: 'data_recovery',
    estimatedTime: '1-7 дней',
    priceFrom: 5000,
    priceTo: 30000,
    isPopular: true,
  },
  {
    id: 'rs-12',
    name: 'Восстановление данных с SSD',
    description: 'Восстановление информации с твердотельного накопителя',
    category: 'data_recovery',
    estimatedTime: '1-7 дней',
    priceFrom: 7000,
    priceTo: 40000,
  },
  // Апгрейд
  {
    id: 'rs-13',
    name: 'Установка SSD',
    description: 'Установка SSD с переносом системы и данных',
    category: 'upgrade',
    estimatedTime: '1-2 часа',
    priceFrom: 1000,
    priceTo: 2500,
    isPopular: true,
  },
  {
    id: 'rs-14',
    name: 'Увеличение оперативной памяти',
    description: 'Подбор и установка дополнительной RAM',
    category: 'upgrade',
    estimatedTime: '30 минут',
    priceFrom: 500,
    priceTo: 1000,
  },
];

/**
 * Начальные данные заявок на ремонт
 */
const initialRepairRequests: RepairRequest[] = [
  {
    id: 'repair-1',
    requestNumber: 'REP-2024-000123',
    userId: 'user-1',
    service: initialRepairServices[0],
    deviceType: 'Ноутбук',
    deviceBrand: 'ASUS',
    deviceModel: 'ROG Strix G15',
    problemDescription: 'Разбит экран, не отображает изображение',
    status: 'in_progress',
    statusHistory: [
      { status: 'pending', timestamp: '2024-01-25T10:00:00Z' },
      { status: 'diagnosed', timestamp: '2024-01-25T14:00:00Z', comment: 'Требуется замена матрицы' },
      { status: 'awaiting_approval', timestamp: '2024-01-25T14:30:00Z', comment: 'Стоимость ремонта: 8500₽' },
      { status: 'in_progress', timestamp: '2024-01-25T16:00:00Z', comment: 'Матрица заказана' },
    ],
    estimatedCost: 8500,
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T16:00:00Z',
  },
  {
    id: 'repair-2',
    requestNumber: 'REP-2024-000122',
    userId: 'user-1',
    service: initialRepairServices[2],
    deviceType: 'Ноутбук',
    deviceBrand: 'Lenovo',
    deviceModel: 'ThinkPad X1 Carbon',
    problemDescription: 'Сильно греется, шумит вентилятор',
    status: 'completed',
    statusHistory: [
      { status: 'pending', timestamp: '2024-01-20T11:00:00Z' },
      { status: 'diagnosed', timestamp: '2024-01-20T12:00:00Z' },
      { status: 'in_progress', timestamp: '2024-01-20T12:30:00Z' },
      { status: 'completed', timestamp: '2024-01-20T14:00:00Z', comment: 'Чистка выполнена, термопаста заменена' },
    ],
    estimatedCost: 2000,
    finalCost: 2000,
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
    completedAt: '2024-01-20T14:00:00Z',
  },
];

/**
 * Репозиторий услуг ремонта
 */
export class RepairServiceRepository extends BaseRepository<RepairService> {
  constructor(db: DatabaseConnection) {
    super(db, initialRepairServices);
  }

  /**
   * Поиск по категории
   */
  async findByCategory(category: RepairCategory): Promise<RepairService[]> {
    await this.simulateDelay();
    return this.data.filter((s) => s.category === category);
  }

  /**
   * Получить популярные услуги
   */
  async findPopular(): Promise<RepairService[]> {
    await this.simulateDelay();
    return this.data.filter((s) => s.isPopular);
  }
}

/**
 * Репозиторий заявок на ремонт
 */
export class RepairRequestRepository extends BaseRepository<RepairRequest> {
  constructor(db: DatabaseConnection) {
    super(db, initialRepairRequests);
  }

  /**
   * Поиск заявок пользователя
   */
  async findByUserId(userId: string): Promise<RepairRequest[]> {
    await this.simulateDelay();
    return this.data.filter((r) => r.userId === userId);
  }

  /**
   * Поиск по номеру заявки
   */
  async findByRequestNumber(requestNumber: string): Promise<RepairRequest | null> {
    await this.simulateDelay();
    return this.data.find((r) => r.requestNumber === requestNumber) ?? null;
  }

  /**
   * Генерация номера заявки
   */
  generateRequestNumber(): string {
    return 'REP-2024-' + String(Date.now()).slice(-6);
  }
}

// Singleton instances
let repairServiceRepoInstance: RepairServiceRepository | null = null;
let repairRequestRepoInstance: RepairRequestRepository | null = null;

export function getRepairServiceRepository(db: DatabaseConnection): RepairServiceRepository {
  if (!repairServiceRepoInstance) {
    repairServiceRepoInstance = new RepairServiceRepository(db);
  }
  return repairServiceRepoInstance;
}

export function getRepairRequestRepository(db: DatabaseConnection): RepairRequestRepository {
  if (!repairRequestRepoInstance) {
    repairRequestRepoInstance = new RepairRequestRepository(db);
  }
  return repairRequestRepoInstance;
}

// Экспорт данных для синхронного использования
export const repairServices = initialRepairServices;
export const mockRepairRequests = initialRepairRequests;

export function getRepairServicesByCategory(category: RepairCategory): RepairService[] {
  return initialRepairServices.filter((s) => s.category === category);
}

export function getPopularRepairServices(): RepairService[] {
  return initialRepairServices.filter((s) => s.isPopular);
}
