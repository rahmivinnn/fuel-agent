import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;

// Registration schemas
export const registrationStep1Schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registrationStep2Schema = z.object({
  brand: z.string().min(1, "Vehicle brand is required"),
  color: z.string().min(1, "Vehicle color is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
});

export type RegistrationStep1 = z.infer<typeof registrationStep1Schema>;
export type RegistrationStep2 = z.infer<typeof registrationStep2Schema>;

// OTP schemas
export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export type OTPData = z.infer<typeof otpSchema>;

// Email verification
export const emailVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;

// Forgot password
export const forgotPasswordSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone is required"),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

// Frontend-only types (matching backend structure)
export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  profilePhoto?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  customerId: string;
  deliveryAddress: string;
  deliveryPhone: string;
  fuelType?: string;
  fuelQuantity?: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface FuelFriend {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  location: string;
  deliveryFee: number;
  rating: number;
  isAvailable: boolean;
  profilePhoto?: string;
}

export interface Wallet {
  id: string;
  driverId: string;
  balance: number;
  currency: string;
  bankName?: string;
  cardNumber?: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  time: string;
}