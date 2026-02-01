import { db } from '@/shared/database/in-memory-connection';
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

const serviceRepo = getRepairServiceRepository(db);
const requestRepo = getRepairRequestRepository(db);

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

  return requestRepo.create({
    requestNumber,
    userId,
    service,
    deviceType,
    deviceBrand,
    deviceModel,
    serialNumber,
    problemDescription,
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

// Синхронные версии (legacy)
export {
  repairServices,
  getRepairServicesByCategory,
  getPopularRepairServices,
};
