import { PrismaBaseRepository } from '@/shared/repository/base-repository';
import prisma from '@/lib/prisma';
import type {
  Prisma,
  RepairCategory as PrismaRepairCategory,
  RepairRequestStatus as PrismaRepairRequestStatus,
} from '@/app/generated/prisma/client';
import type {
  RepairService,
  RepairRequest,
  RepairCategory,
  RepairRequestStatus,
  RepairStatusHistory,
} from './schemas';

/**
 * Типы из Prisma
 */
type PrismaRepairService = Prisma.RepairServiceGetPayload<object>;
type PrismaRepairRequest = Prisma.RepairRequestGetPayload<{
  include: { service: true; user: true };
}>;

/**
 * Маппинг категорий ремонта Prisma -> App
 */
const categoryPrismaToApp: Record<PrismaRepairCategory, RepairCategory> = {
  LAPTOP: 'laptop',
  DESKTOP: 'desktop',
  MONITOR: 'monitor',
  PERIPHERAL: 'peripheral',
  DATA_RECOVERY: 'data_recovery',
  UPGRADE: 'upgrade',
};

const categoryAppToPrisma: Record<RepairCategory, PrismaRepairCategory> = {
  laptop: 'LAPTOP',
  desktop: 'DESKTOP',
  monitor: 'MONITOR',
  peripheral: 'PERIPHERAL',
  data_recovery: 'DATA_RECOVERY',
  upgrade: 'UPGRADE',
};

/**
 * Маппинг статусов заявки Prisma -> App
 */
const statusPrismaToApp: Record<PrismaRepairRequestStatus, RepairRequestStatus> = {
  PENDING: 'pending',
  DIAGNOSED: 'diagnosed',
  AWAITING_APPROVAL: 'awaiting_approval',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const statusAppToPrisma: Record<RepairRequestStatus, PrismaRepairRequestStatus> = {
  pending: 'PENDING',
  diagnosed: 'DIAGNOSED',
  awaiting_approval: 'AWAITING_APPROVAL',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

/**
 * Преобразовать Prisma RepairService в схему RepairService
 */
function mapPrismaRepairService(service: PrismaRepairService | null): RepairService | null {
  if (!service) return null;

  return {
    id: service.id,
    name: service.name,
    description: service.description,
    category: categoryPrismaToApp[service.category],
    estimatedTime: service.estimatedTime,
    priceFrom: Number(service.priceFrom),
    priceTo: service.priceTo ? Number(service.priceTo) : undefined,
    isPopular: service.isPopular,
  };
}

function mapPrismaRepairServices(services: PrismaRepairService[]): RepairService[] {
  return services.map((s) => mapPrismaRepairService(s)!);
}

/**
 * Преобразовать Prisma RepairRequest в схему RepairRequest
 */
function mapPrismaRepairRequest(request: PrismaRepairRequest | null): RepairRequest | null {
  if (!request) return null;

  return {
    id: request.id,
    requestNumber: request.requestNumber,
    userId: request.userId,
    service: mapPrismaRepairService(request.service)!,
    deviceType: request.deviceType,
    deviceBrand: request.deviceBrand,
    deviceModel: request.deviceModel,
    serialNumber: request.serialNumber ?? undefined,
    problemDescription: request.problemDescription,
    status: statusPrismaToApp[request.status],
    statusHistory: request.statusHistory as RepairStatusHistory[],
    estimatedCost: request.estimatedCost ? Number(request.estimatedCost) : undefined,
    finalCost: request.finalCost ? Number(request.finalCost) : undefined,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    completedAt: request.completedAt?.toISOString(),
  };
}

function mapPrismaRepairRequests(requests: PrismaRepairRequest[]): RepairRequest[] {
  return requests.map((r) => mapPrismaRepairRequest(r)!);
}

/**
 * Репозиторий услуг ремонта с Prisma
 */
export class RepairServiceRepository extends PrismaBaseRepository<
  RepairService,
  Prisma.RepairServiceCreateInput,
  Prisma.RepairServiceUpdateInput
> {
  protected modelName = 'repairService' as const;

  /**
   * Поиск по ID
   */
  async findById(id: string): Promise<RepairService | null> {
    const service = await prisma.repairService.findUnique({
      where: { id },
    });
    return mapPrismaRepairService(service);
  }

  /**
   * Получить все услуги
   */
  async findAll(): Promise<RepairService[]> {
    const services = await prisma.repairService.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return mapPrismaRepairServices(services);
  }

  /**
   * Поиск по категории
   */
  async findByCategory(category: RepairCategory): Promise<RepairService[]> {
    const services = await prisma.repairService.findMany({
      where: {
        category: categoryAppToPrisma[category],
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
    return mapPrismaRepairServices(services);
  }

  /**
   * Получить популярные услуги
   */
  async findPopular(): Promise<RepairService[]> {
    const services = await prisma.repairService.findMany({
      where: { isPopular: true, isActive: true },
      orderBy: { name: 'asc' },
    });
    return mapPrismaRepairServices(services);
  }
}

/**
 * Репозиторий заявок на ремонт с Prisma
 */
export class RepairRequestRepository extends PrismaBaseRepository<
  RepairRequest,
  Prisma.RepairRequestCreateInput,
  Prisma.RepairRequestUpdateInput
> {
  protected modelName = 'repairRequest' as const;

  private includeRelations = {
    service: true,
    user: true,
  } as const;

  /**
   * Поиск по ID
   */
  async findById(id: string): Promise<RepairRequest | null> {
    const request = await prisma.repairRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });
    return mapPrismaRepairRequest(request as PrismaRepairRequest | null);
  }

  /**
   * Поиск заявок пользователя
   */
  async findByUserId(userId: string): Promise<RepairRequest[]> {
    const requests = await prisma.repairRequest.findMany({
      where: { userId },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return mapPrismaRepairRequests(requests as PrismaRepairRequest[]);
  }

  /**
   * Поиск по номеру заявки
   */
  async findByRequestNumber(requestNumber: string): Promise<RepairRequest | null> {
    const request = await prisma.repairRequest.findUnique({
      where: { requestNumber },
      include: this.includeRelations,
    });
    return mapPrismaRepairRequest(request as PrismaRepairRequest | null);
  }

  /**
   * Обновить статус заявки
   */
  async updateStatus(
    requestId: string,
    status: RepairRequestStatus,
    comment?: string
  ): Promise<RepairRequest | null> {
    const request = await prisma.repairRequest.findUnique({
      where: { id: requestId },
      select: { statusHistory: true },
    });

    if (!request) return null;

    const statusHistory = request.statusHistory as RepairStatusHistory[];
    statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      ...(comment && { comment }),
    });

    const updated = await prisma.repairRequest.update({
      where: { id: requestId },
      data: {
        status: statusAppToPrisma[status],
        statusHistory,
        ...(status === 'completed' && { completedAt: new Date() }),
      },
      include: this.includeRelations,
    });

    return mapPrismaRepairRequest(updated as PrismaRepairRequest);
  }

  /**
   * Генерация номера заявки
   */
  generateRequestNumber(): string {
    return 'REP-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);
  }
}

// Singleton instances
let repairServiceRepoInstance: RepairServiceRepository | null = null;
let repairRequestRepoInstance: RepairRequestRepository | null = null;

export function getRepairServiceRepository(): RepairServiceRepository {
  if (!repairServiceRepoInstance) {
    repairServiceRepoInstance = new RepairServiceRepository();
  }
  return repairServiceRepoInstance;
}

export function getRepairRequestRepository(): RepairRequestRepository {
  if (!repairRequestRepoInstance) {
    repairRequestRepoInstance = new RepairRequestRepository();
  }
  return repairRequestRepoInstance;
}

// Mock данные реэкспортируются из отдельного файла для клиентских компонентов
export {
  repairServices,
  mockRepairRequests,
  getRepairServicesByCategory,
  getPopularRepairServices,
} from './mocks';
