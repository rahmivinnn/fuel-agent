import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';
import { storage } from '../services/postgres-storage';
import { generateOTP, saveOTP } from '../services/otp';
import { sendEmailOTP } from '../services/email';
import { whatsappService } from '../services/whatsapp';
import { generateToken } from '../utils/auth';
import {
  registrationStep1Schema,
  registrationStep2Schema,
  loginSchema,
  emailVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../schemas/validation';

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { uid, email, displayName } = req.body;

    if (!uid || !email) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Invalid Google user data');
    }

    let customer = await storage.getCustomerByEmail(email);
    
    if (!customer) {
      customer = await storage.createCustomer({
        fullName: displayName || email.split('@')[0],
        email: email,
        phoneNumber: '',
        password: uid,
        isEmailVerified: true
      });
    }

    const token = generateToken({ userId: customer.id, email: customer.email });

    return sendSuccess(res, {
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        isEmailVerified: customer.isEmailVerified
      },
      token
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('Google auth error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Google authentication failed');
  }
};

export const registerStep1 = async (req: Request, res: Response) => {
  try {
    const data = registrationStep1Schema.parse(req.body);

    const existingCustomer = await storage.getCustomerByEmail(data.email);
    if (existingCustomer) {
      return sendError(res, RESPONSE_CODES.USER_EXISTS, 400, 'Email already registered');
    }

    return sendSuccess(res, { data }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    return sendError(res, RESPONSE_CODES.VALIDATION_ERROR, 400, 'Invalid registration data');
  }
};

export const registerComplete = async (req: Request, res: Response) => {
  try {
    const { step1, step2 } = req.body;

    const step1Data = registrationStep1Schema.parse(step1);
    const step2Data = registrationStep2Schema.parse(step2);

    const existingCustomer = await storage.getCustomerByEmail(step1Data.email);
    if (existingCustomer) {
      return sendError(res, RESPONSE_CODES.USER_EXISTS, 400, 'Email already registered');
    }

    const customer = await storage.createCustomer({
      fullName: step1Data.fullName,
      email: step1Data.email,
      phoneNumber: step1Data.phoneNumber,
      password: step1Data.password,
    });

    await storage.createVehicle({
      customerId: customer.id,
      brand: step2Data.brand,
      color: step2Data.color,
      licenseNumber: step2Data.licenseNumber,
      fuelType: step2Data.fuelType,
      isPrimary: true,
    });

    const token = generateToken({ userId: customer.id, email: customer.email });

    return sendSuccess(res, {
      customer: {
        id: customer.id,
        email: customer.email,
        fullName: customer.fullName
      },
      token
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    return sendError(res, RESPONSE_CODES.VALIDATION_ERROR, 400, 'Invalid registration data');
  }
};

export const emailVerification = async (req: Request, res: Response) => {
  try {
    const { email } = emailVerificationSchema.parse(req.body);

    const customer = await storage.getCustomerByEmail(email);
    if (!customer) {
      return sendError(res, RESPONSE_CODES.USER_NOT_FOUND, 404, 'Email not found');
    }

    const otp = generateOTP();
    
    await storage.updateCustomer(customer.id, { 
      otpCode: otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000)
    });

    let emailSent = false;
    let whatsappSent = false;

    try {
      const emailResult = await sendEmailOTP(email, otp);
      emailSent = emailResult.success;
    } catch (error) {
      console.warn('Failed to send email OTP:', error);
    }

    if (customer.phoneNumber) {
      try {
        const result = await whatsappService.sendOTP(customer.phoneNumber, otp);
        whatsappSent = result.success;
      } catch (error) {
        console.warn('Failed to send WhatsApp OTP:', error);
      }
    }

    return sendSuccess(res, {
      message: emailSent && whatsappSent 
        ? 'Verification code sent to your email and WhatsApp' 
        : emailSent 
          ? 'Verification code sent to your email'
          : whatsappSent
            ? 'Verification code sent to your WhatsApp'
            : 'Verification code generated',
      code: process.env.NODE_ENV === 'development' ? otp : undefined
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Invalid request');
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { code, email } = req.body;

    if (!code || !email) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Code and email are required');
    }

    const customer = await storage.getCustomerByEmail(email);
    if (!customer) {
      return sendError(res, RESPONSE_CODES.USER_NOT_FOUND, 404, 'Customer not found');
    }

    if (!customer.otpCode || customer.otpCode !== code) {
      return sendError(res, RESPONSE_CODES.OTP_INVALID, 400, 'Invalid verification code');
    }
    
    if (!customer.otpExpires || new Date() > customer.otpExpires) {
      return sendError(res, RESPONSE_CODES.OTP_EXPIRED, 400, 'Verification code has expired');
    }

    await storage.updateCustomer(customer.id, { 
      isEmailVerified: true,
      otpCode: null,
      otpExpires: null
    });

    return sendSuccess(res, { message: 'Email verified successfully' }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('Verify code error:', error);
    return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Invalid request');
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { emailOrPhone } = forgotPasswordSchema.parse(req.body);

    const customer = await storage.getCustomerByEmailOrPhone(emailOrPhone);
    if (!customer) {
      return sendError(res, RESPONSE_CODES.USER_NOT_FOUND, 404, 'Account not found');
    }

    return sendSuccess(res, {
      message: 'Reset code sent',
      code: '1234' // For demo
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Invalid request');
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password } = resetPasswordSchema.parse(req.body);
    const { email } = req.body;

    const customer = await storage.getCustomerByEmail(email);
    if (!customer) {
      return sendError(res, RESPONSE_CODES.USER_NOT_FOUND, 404, 'Customer not found');
    }

    await storage.updateCustomer(customer.id, { password });

    return sendSuccess(res, { message: 'Password reset successfully' }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Invalid request');
  }
};