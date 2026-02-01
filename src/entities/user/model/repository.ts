import { PrismaBaseRepository } from '@/shared/repository/base-repository';
import prisma from '@/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';
import type { User, Address } from './schemas';

/**
 * Тип пользователя из Prisma
 */
type PrismaUser = Prisma.UserGetPayload<object>;
type PrismaAddress = Prisma.AddressGetPayload<object>;

/**
 * Преобразовать Prisma User в схему User
 */
function mapPrismaUser(user: PrismaUser | null): User | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? undefined,
    avatar: user.avatar ?? undefined,
    createdAt: user.createdAt.toISOString().split('T')[0],
  };
}

function mapPrismaUsers(users: PrismaUser[]): User[] {
  return users.map((u) => mapPrismaUser(u)!);
}

/**
 * Преобразовать Prisma Address в схему Address
 */
function mapPrismaAddress(address: PrismaAddress | null): Address | null {
  if (!address) return null;

  return {
    id: address.id,
    userId: address.userId,
    title: address.title,
    fullName: address.fullName,
    phone: address.phone,
    city: address.city,
    street: address.street,
    building: address.building,
    apartment: address.apartment ?? undefined,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  };
}

function mapPrismaAddresses(addresses: PrismaAddress[]): Address[] {
  return addresses.map((a) => mapPrismaAddress(a)!);
}

/**
 * Репозиторий пользователей с Prisma
 */
export class UserRepository extends PrismaBaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  protected modelName = 'user' as const;

  /**
   * Поиск по ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return mapPrismaUser(user);
  }

  /**
   * Получить всех пользователей
   */
  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return mapPrismaUsers(users);
  }

  /**
   * Поиск по email
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return mapPrismaUser(user);
  }
}

/**
 * Репозиторий адресов с Prisma
 */
export class AddressRepository extends PrismaBaseRepository<
  Address,
  Prisma.AddressCreateInput,
  Prisma.AddressUpdateInput
> {
  protected modelName = 'address' as const;

  /**
   * Поиск по ID
   */
  async findById(id: string): Promise<Address | null> {
    const address = await prisma.address.findUnique({
      where: { id },
    });
    return mapPrismaAddress(address);
  }

  /**
   * Получить адреса пользователя
   */
  async findByUserId(userId: string): Promise<Address[]> {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
    return mapPrismaAddresses(addresses);
  }

  /**
   * Получить адрес по умолчанию
   */
  async findDefaultByUserId(userId: string): Promise<Address | null> {
    const address = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
    return mapPrismaAddress(address);
  }

  /**
   * Установить адрес по умолчанию
   */
  async setDefault(userId: string, addressId: string): Promise<void> {
    // Сбросить все адреса пользователя
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    // Установить новый адрес по умолчанию
    await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}

// Singleton instances
let userRepositoryInstance: UserRepository | null = null;
let addressRepositoryInstance: AddressRepository | null = null;

export function getUserRepository(): UserRepository {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserRepository();
  }
  return userRepositoryInstance;
}

export function getAddressRepository(): AddressRepository {
  if (!addressRepositoryInstance) {
    addressRepositoryInstance = new AddressRepository();
  }
  return addressRepositoryInstance;
}

// Mock данные реэкспортируются из отдельного файла для клиентских компонентов
// ВАЖНО: Не импортируйте напрямую, используйте './mocks' в клиентских компонентах
export { mockUser, mockUsers, mockAddresses } from './mocks';
