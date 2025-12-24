import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db, fuelFriends, customers } from '../config/database';
import { generateToken, hashPassword, comparePassword, JWTPayload } from '../utils/auth';
import { sendSuccess, sendError, sendValidationError } from '../utils/response';
import { z } from 'zod';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerDriverSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(10, 'Valid phone number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  location: z.string().min(2, 'Location is required'),
  deliveryFee: z.string().min(1, 'Delivery fee is required'),
});

export class AuthController {
  // Driver Login
  static async loginDriver(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Find driver
      const driver = await db.select().from(fuelFriends).where(eq(fuelFriends.email, email)).limit(1);
      
      if (!driver.length) {
        return sendError(res, 'Invalid credentials', 401);
      }

      // Verify password (assuming password is hashed in DB)
      const isValidPassword = await comparePassword(password, driver[0].password || '');
      if (!isValidPassword) {
        return sendError(res, 'Invalid credentials', 401);
      }

      // Generate tokens
      const payload: JWTPayload = {
        userId: driver[0].id,
        email: driver[0].email,
        role: 'driver'
      };

      const accessToken = generateToken(payload);
      
      // Store session
      req.session.userId = driver[0].id;
      req.session.userRole = 'driver';

      const { password: _, ...driverData } = driver[0];

      return sendSuccess(res, {
        user: driverData,
        accessToken,
        tokenType: 'Bearer'
      }, 'Login successful');

    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, error.flatten().fieldErrors);
      }
      return sendError(res, 'Login failed', 500);
    }
  }

  // Driver Registration
  static async registerDriver(req: Request, res: Response) {
    try {
      const data = registerDriverSchema.parse(req.body);

      // Check if email exists
      const existingDriver = await db.select().from(fuelFriends).where(eq(fuelFriends.email, data.email)).limit(1);
      
      if (existingDriver.length) {
        return sendError(res, 'Email already registered', 409);
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create driver
      const newDriver = await db.insert(fuelFriends).values({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: hashedPassword,
        location: data.location,
        deliveryFee: data.deliveryFee,
        isAvailable: true
      }).returning();

      // Generate tokens
      const payload: JWTPayload = {
        userId: newDriver[0].id,
        email: newDriver[0].email,
        role: 'driver'
      };

      const accessToken = generateToken(payload);

      // Store session
      req.session.userId = newDriver[0].id;
      req.session.userRole = 'driver';

      const { password: _, ...driverData } = newDriver[0];

      return sendSuccess(res, {
        user: driverData,
        accessToken,
        tokenType: 'Bearer'
      }, 'Registration successful', 201);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, error.flatten().fieldErrors);
      }
      return sendError(res, 'Registration failed', 500);
    }
  }

  // Logout
  static async logout(req: Request, res: Response) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return sendError(res, 'Logout failed', 500);
        }
        return sendSuccess(res, null, 'Logout successful');
      });
    } catch (error) {
      return sendError(res, 'Logout failed', 500);
    }
  }

  // Get Profile
  static async getProfile(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const role = req.user.role;

      let user;
      if (role === 'driver') {
        const driver = await db.select().from(fuelFriends).where(eq(fuelFriends.id, userId)).limit(1);
        if (!driver.length) {
          return sendError(res, 'User not found', 404);
        }
        const { password: _, ...userData } = driver[0];
        user = userData;
      } else {
        const customer = await db.select().from(customers).where(eq(customers.id, userId)).limit(1);
        if (!customer.length) {
          return sendError(res, 'User not found', 404);
        }
        const { password: _, ...userData } = customer[0];
        user = userData;
      }

      return sendSuccess(res, { user }, 'Profile retrieved successfully');

    } catch (error) {
      return sendError(res, 'Failed to get profile', 500);
    }
  }
}