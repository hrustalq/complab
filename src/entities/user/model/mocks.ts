import type { User, Address } from './schemas';

/**
 * Mock данные пользователя для демо/UI компонентов
 */
export const mockUser: User = {
  id: 'user-1',
  email: 'ivan@example.com',
  firstName: 'Иван',
  lastName: 'Петров',
  phone: '+7 (999) 123-45-67',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  createdAt: '2023-06-15',
};

export const mockUsers: User[] = [mockUser];

/**
 * Mock данные адресов для демо/UI компонентов
 */
export const mockAddresses: Address[] = [
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
