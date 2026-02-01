import prisma from '@/lib/prisma';
import {
  getRepairServiceRepository,
  getRepairRequestRepository,
  repairServices,
  getRepairServicesByCategory,
  getPopularRepairServices,
} from '../model/repository';
import {
  createRepairRequestSchema,
  getRepairServicesParamsSchema,
  type RepairService,
  type RepairRequest,
  type RepairCategory,
} from '../model/schemas';

const serviceRepo = getRepairServiceRepository();
const requestRepo = getRepairRequestRepository();

/**
 * Получить все услуги ремонта (async)
 */
export async function getRepairServices(params?: unknown): Promise<RepairService[]> {
  if (params) {
    const validatedParams = getRepairServicesParamsSchema.safeParse(params);
    if (validatedParams.success && validatedParams.data.category) {
      return serviceRepo.findByCategory(validatedParams.data.category);
    }
  }
  return serviceRepo.findAll();
}

/**
 * Получить услуги по категории (async)
 */
export async function getRepairServicesByCategoryAsync(
  category: RepairCategory
): Promise<RepairService[]> {
  return serviceRepo.findByCategory(category);
}

/**
 * Получить популярные услуги (async)
 */
export async function getPopularServicesAsync(): Promise<RepairService[]> {
  return serviceRepo.findPopular();
}

/**
 * Получить услугу по ID
 */
export async function getRepairServiceById(id: string): Promise<RepairService | null> {
  return serviceRepo.findById(id);
}

/**
 * Получить заявки пользователя на ремонт
 */
export async function getRepairRequests(userId: string): Promise<RepairRequest[]> {
  return requestRepo.findByUserId(userId);
}

/**
 * Получить заявку по ID
 */
export async function getRepairRequestById(id: string): Promise<RepairRequest | null> {
  return requestRepo.findById(id);
}

/**
 * Получить заявку по номеру
 */
export async function getRepairRequestByNumber(
  requestNumber: string
): Promise<RepairRequest | null> {
  return requestRepo.findByRequestNumber(requestNumber);
}

// Map category to Prisma enum
const categoryToPrisma: Record<RepairCategory, 'LAPTOP' | 'DESKTOP' | 'MONITOR' | 'PERIPHERAL' | 'DATA_RECOVERY' | 'UPGRADE'> = {
  laptop: 'LAPTOP',
  desktop: 'DESKTOP',
  monitor: 'MONITOR',
  peripheral: 'PERIPHERAL',
  data_recovery: 'DATA_RECOVERY',
  upgrade: 'UPGRADE',
};

/**
 * Создать заявку на ремонт
 */
export async function createRepairRequest(
  userId: string,
  params: unknown
): Promise<RepairRequest | null> {
  const validatedParams = createRepairRequestSchema.safeParse(params);

  if (!validatedParams.success) {
    return null;
  }

  const { serviceId, deviceType, deviceBrand, deviceModel, serialNumber, problemDescription } =
    validatedParams.data;

  const service = await serviceRepo.findById(serviceId);
  if (!service) return null;

  const requestNumber = requestRepo.generateRequestNumber();

  // Create using Prisma directly for proper typing
  const newRequest = await prisma.repairRequest.create({
    data: {
      requestNumber,
      user: { connect: { id: userId } },
      service: { connect: { id: serviceId } },
      deviceType,
      deviceBrand,
      deviceModel,
      serialNumber,
      problemDescription,
      status: 'PENDING',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      ],
    },
    include: { service: true, user: true },
  });

  // Map back to app schema
  return {
    id: newRequest.id,
    requestNumber: newRequest.requestNumber,
    userId: newRequest.userId,
    service: {
      id: newRequest.service.id,
      name: newRequest.service.name,
      description: newRequest.service.description,
      category: newRequest.service.category.toLowerCase() as RepairCategory,
      estimatedTime: newRequest.service.estimatedTime,
      priceFrom: Number(newRequest.service.priceFrom),
      priceTo: newRequest.service.priceTo ? Number(newRequest.service.priceTo) : undefined,
      isPopular: newRequest.service.isPopular,
    },
    deviceType: newRequest.deviceType,
    deviceBrand: newRequest.deviceBrand,
    deviceModel: newRequest.deviceModel,
    serialNumber: newRequest.serialNumber ?? undefined,
    problemDescription: newRequest.problemDescription,
    status: 'pending' as const,
    statusHistory: [{ status: 'pending' as const, timestamp: new Date().toISOString() }],
    estimatedCost: newRequest.estimatedCost ? Number(newRequest.estimatedCost) : undefined,
    finalCost: newRequest.finalCost ? Number(newRequest.finalCost) : undefined,
    createdAt: newRequest.createdAt.toISOString(),
    updatedAt: newRequest.updatedAt.toISOString(),
    completedAt: newRequest.completedAt?.toISOString(),
  };
}

// Синхронные версии (legacy)
export {
  repairServices,
  getRepairServicesByCategory,
  getPopularRepairServices,
};
