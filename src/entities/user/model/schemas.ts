import { z } from 'zod';
import { emailSchema, phoneSchema } from '@/shared/lib/zod-helpers';

/**
 * Схема пользователя
 */
export const userSchema = z.object({
  id: z.string(),
  email: emailSchema,
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  phone: phoneSchema.optional(),
  avatar: z.string().url().optional(),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

/**
 * Схема адреса
 */
export const addressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1, 'Название обязательно'),
  fullName: z.string().min(1, 'ФИО обязательно'),
  phone: phoneSchema,
  city: z.string().min(1, 'Город обязателен'),
  street: z.string().min(1, 'Улица обязательна'),
  building: z.string().min(1, 'Дом обязателен'),
  apartment: z.string().optional(),
  postalCode: z.string().min(1, 'Индекс обязателен'),
  isDefault: z.boolean().default(false),
});

export type Address = z.infer<typeof addressSchema>;

/**
 * Схема регистрации
 */
export const registerRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  phone: phoneSchema.optional(),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

/**
 * Схема входа
 */
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Пароль обязателен'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

/**
 * Схема обновления профиля
 */
export const updateProfileRequestSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: phoneSchema.optional(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

/**
 * Схема создания адреса
 */
export const createAddressRequestSchema = addressSchema.omit({ id: true, userId: true });

export type CreateAddressRequest = z.infer<typeof createAddressRequestSchema>;

/**
 * Схема обновления адреса
 */
export const updateAddressRequestSchema = createAddressRequestSchema.partial().extend({
  id: z.string(),
});

export type UpdateAddressRequest = z.infer<typeof updateAddressRequestSchema>;

/**
 * Схема ответа авторизации
 */
export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

/**
 * Схема профиля пользователя
 */
export const userProfileResponseSchema = z.object({
  user: userSchema,
  addresses: z.array(addressSchema),
});

export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
