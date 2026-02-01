import prisma from '@/lib/prisma';
import { getUserRepository, getAddressRepository } from '../model/repository';
import {
  loginRequestSchema,
  registerRequestSchema,
  updateProfileRequestSchema,
  createAddressRequestSchema,
  updateAddressRequestSchema,
  type User,
  type Address,
  type AuthResponse,
  type UserProfileResponse,
} from '../model/schemas';

const userRepo = getUserRepository();
const addressRepo = getAddressRepository();

/**
 * Авторизация пользователя
 */
export async function loginUser(params: unknown): Promise<AuthResponse | null> {
  const validatedParams = loginRequestSchema.safeParse(params);

  if (!validatedParams.success) {
    return null;
  }

  const { email } = validatedParams.data;
  const user = await userRepo.findByEmail(email);

  if (!user) {
    return null;
  }

  // В реальном приложении здесь будет проверка пароля
  return {
    user,
    token: 'mock-jwt-token-' + Date.now(),
  };
}

/**
 * Регистрация пользователя
 */
export async function registerUser(params: unknown): Promise<AuthResponse | null> {
  const validatedParams = registerRequestSchema.safeParse(params);

  if (!validatedParams.success) {
    return null;
  }

  const { email, firstName, lastName, phone } = validatedParams.data;

  // Проверяем, существует ли уже пользователь
  const existingUser = await userRepo.findByEmail(email);
  if (existingUser) {
    return null;
  }

  // Create user using Prisma directly for proper typing
  const newUser = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      phone,
    },
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone ?? undefined,
      avatar: newUser.avatar ?? undefined,
      createdAt: newUser.createdAt.toISOString().split('T')[0],
    },
    token: 'mock-jwt-token-' + Date.now(),
  };
}

/**
 * Получить профиль пользователя
 */
export async function getUserProfile(userId: string): Promise<UserProfileResponse | null> {
  const user = await userRepo.findById(userId);
  if (!user) return null;

  const addresses = await addressRepo.findByUserId(userId);

  return {
    user,
    addresses,
  };
}

/**
 * Обновить профиль пользователя
 */
export async function updateUserProfile(
  userId: string,
  params: unknown
): Promise<User | null> {
  const validatedParams = updateProfileRequestSchema.safeParse(params);

  if (!validatedParams.success) {
    return null;
  }

  return userRepo.update(userId, validatedParams.data);
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  return userRepo.findById(userId);
}

/**
 * Получить пользователя по email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return userRepo.findByEmail(email);
}

/**
 * Получить адреса пользователя
 */
export async function getUserAddresses(userId: string): Promise<Address[]> {
  return addressRepo.findByUserId(userId);
}

/**
 * Добавить адрес
 */
export async function addUserAddress(
  userId: string,
  params: unknown
): Promise<Address | null> {
  const validatedParams = createAddressRequestSchema.safeParse(params);

  if (!validatedParams.success) {
    return null;
  }

  // Use Prisma directly for proper typing
  const newAddress = await prisma.address.create({
    data: {
      ...validatedParams.data,
      user: { connect: { id: userId } },
    },
  });

  return {
    id: newAddress.id,
    userId: newAddress.userId,
    title: newAddress.title,
    fullName: newAddress.fullName,
    phone: newAddress.phone,
    city: newAddress.city,
    street: newAddress.street,
    building: newAddress.building,
    apartment: newAddress.apartment ?? undefined,
    postalCode: newAddress.postalCode,
    isDefault: newAddress.isDefault,
  };
}

/**
 * Обновить адрес
 */
export async function updateUserAddress(params: unknown): Promise<Address | null> {
  const validatedParams = updateAddressRequestSchema.safeParse(params);

  if (!validatedParams.success) {
    return null;
  }

  const { id, ...data } = validatedParams.data;
  return addressRepo.update(id, data);
}

/**
 * Удалить адрес
 */
export async function deleteUserAddress(addressId: string): Promise<boolean> {
  return addressRepo.delete(addressId);
}

/**
 * Установить адрес по умолчанию
 */
export async function setDefaultAddress(userId: string, addressId: string): Promise<void> {
  await addressRepo.setDefault(userId, addressId);
}
