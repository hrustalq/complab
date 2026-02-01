import { BaseRepository } from '@/shared/repository/base-repository';
import type { DatabaseConnection } from '@/shared/database/types';
import type { User, Address } from './schemas';

/**
 * Начальные данные пользователей
 */
const initialUsers: User[] = [
  {
    id: 'user-1',
    email: 'ivan@example.com',
    firstName: 'Иван',
    lastName: 'Петров',
    phone: '+7 (999) 123-45-67',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    createdAt: '2023-06-15',
  },
];

/**
 * Начальные данные адресов
 */
const initialAddresses: Address[] = [
  {
    id: 'addr-1',
    userId: 'user-1',
    title: 'Дом',
    fullName: 'Иван Петров',
    phone: '+7 (999) 123-45-67',
    city: 'Москва',
    street: 'ул. Тверская',
    building: '12',
    apartment: '45',
    postalCode: '125009',
    isDefault: true,
  },
  {
    id: 'addr-2',
    userId: 'user-1',
    title: 'Офис',
    fullName: 'Иван Петров',
    phone: '+7 (999) 123-45-67',
    city: 'Москва',
    street: 'ул. Арбат',
    building: '24',
    apartment: '301',
    postalCode: '119002',
    isDefault: false,
  },
];

/**
 * Репозиторий пользователей
 */
export class UserRepository extends BaseRepository<User> {
  constructor(db: DatabaseConnection) {
    super(db, initialUsers);
  }

  /**
   * Поиск по email
   */
  async findByEmail(email: string): Promise<User | null> {
    await this.simulateDelay();
    return this.data.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }
}

/**
 * Репозиторий адресов
 */
export class AddressRepository extends BaseRepository<Address> {
  constructor(db: DatabaseConnection) {
    super(db, initialAddresses);
  }

  /**
   * Получить адреса пользователя
   */
  async findByUserId(userId: string): Promise<Address[]> {
    await this.simulateDelay();
    return this.data.filter((a) => a.userId === userId);
  }

  /**
   * Получить адрес по умолчанию
   */
  async findDefaultByUserId(userId: string): Promise<Address | null> {
    await this.simulateDelay();
    return this.data.find((a) => a.userId === userId && a.isDefault) ?? null;
  }

  /**
   * Установить адрес по умолчанию
   */
  async setDefault(userId: string, addressId: string): Promise<void> {
    await this.simulateDelay();
    this.data.forEach((a) => {
      if (a.userId === userId) {
        a.isDefault = a.id === addressId;
      }
    });
  }
}

// Singleton instances
let userRepositoryInstance: UserRepository | null = null;
let addressRepositoryInstance: AddressRepository | null = null;

export function getUserRepository(db: DatabaseConnection): UserRepository {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserRepository(db);
  }
  return userRepositoryInstance;
}

export function getAddressRepository(db: DatabaseConnection): AddressRepository {
  if (!addressRepositoryInstance) {
    addressRepositoryInstance = new AddressRepository(db);
  }
  return addressRepositoryInstance;
}

// Экспорт mock данных для использования в UI компонентах
export { initialUsers as mockUsers, initialAddresses as mockAddresses };
export const mockUser = initialUsers[0];
