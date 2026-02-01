import type { RepairService, RepairRequest, RepairCategory } from './schemas';

/**
 * Mock данные услуг ремонта для демо/UI компонентов
 */
export const repairServices: RepairService[] = [];

/**
 * Mock данные заявок на ремонт для демо/UI компонентов
 */
export const mockRepairRequests: RepairRequest[] = [];

/**
 * Получить услуги по категории (sync)
 */
export function getRepairServicesByCategory(category: RepairCategory): RepairService[] {
  return repairServices.filter((s) => s.category === category);
}

/**
 * Получить популярные услуги (sync)
 */
export function getPopularRepairServices(): RepairService[] {
  return repairServices.filter((s) => s.isPopular);
}
