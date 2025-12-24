import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';
import { generateToken } from '../utils/auth';
import { whatsappService } from '../services/whatsapp';
import { storage } from '../services/postgres-storage';

export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Email/phone and password are required');
    }

    const customer = await storage.getCustomerByEmailOrPhone(emailOrPhone);
    if (!customer) {
      return sendError(res, RESPONSE_CODES.INVALID_CREDENTIALS, 401);
    }

    const isValidPassword = await bcrypt.compare(password, customer.password);
    if (!isValidPassword) {
      return sendError(res, RESPONSE_CODES.INVALID_CREDENTIALS, 401);
    }

    const token = generateToken({ userId: customer.id, email: customer.email });

    return sendSuccess(res, {
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        isEmailVerified: customer.isEmailVerified || false
      },
      token
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    const customer = await storage.getCustomer(userId);
    if (!customer) {
      return sendError(res, RESPONSE_CODES.USER_NOT_FOUND, 404);
    }

    return sendSuccess(res, {
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        isEmailVerified: customer.isEmailVerified || false
      }
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500);
  }
};

export const getWhatsAppStatus = async (req: Request, res: Response) => {
  try {
    const status = whatsappService.getConnectionStatus();
    return sendSuccess(res, { 
      connected: status.connected,
      sms: false,
      whatsapp: false,
      baileys: status
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('WhatsApp status error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500);
  }
};