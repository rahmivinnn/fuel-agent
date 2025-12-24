import { z } from 'zod';

export const registrationStep1Schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(10, 'Valid phone number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registrationStep2Schema = z.object({
  brand: z.string().min(1, 'Vehicle brand is required'),
  color: z.string().min(1, 'Vehicle color is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  fuelType: z.string().min(1, 'Fuel type is required'),
});

export const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const emailVerificationSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const forgotPasswordSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phoneNumber: z.string().min(10).optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const reviewSchema = z.object({
  targetType: z.enum(['fuel_station', 'fuel_friend']),
  targetId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});