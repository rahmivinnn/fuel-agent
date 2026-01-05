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

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Authorization code required');
    }

    // Check for required environment variables
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('Missing Google OAuth credentials:', { 
        clientId: clientId ? 'present' : 'missing',
        clientSecret: clientSecret ? 'present' : 'missing'
      });
      throw new Error('Could not determine client ID from request.');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`
      })
    });

    const tokens = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || 'Token exchange failed');
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const userInfo = await userResponse.json();
    
    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    // Create or get fuel friend
    let fuelFriend = await storage.getFuelFriendByEmail(userInfo.email);
    
    if (!fuelFriend) {
      fuelFriend = await storage.createFuelFriend({
        fullName: userInfo.name || userInfo.email.split('@')[0],
        email: userInfo.email,
        phoneNumber: '',
        password: userInfo.id,
        location: '',
        deliveryFee: '5000.00',
        isEmailVerified: true
      });
    }

    const token = generateToken({ userId: fuelFriend.id, email: fuelFriend.email });
    const { password, ...fuelFriendData } = fuelFriend;

    return sendSuccess(res, {
      fuelFriend: fuelFriendData,
      token
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('Google callback error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Google authentication failed');
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { uid, email, displayName } = req.body;

    if (!uid || !email) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Invalid Google user data');
    }

    let fuelFriend = await storage.getFuelFriendByEmail(email);
    
    if (!fuelFriend) {
      // Create new fuel friend from Google account
      fuelFriend = await storage.createFuelFriend({
        fullName: displayName || email.split('@')[0],
        email: email,
        phoneNumber: '',
        password: uid, // Use Google UID as password
        location: '',
        deliveryFee: '5000.00',
        isEmailVerified: true
      });
    }

    const token = generateToken({ userId: fuelFriend.id, email: fuelFriend.email });
    const { password, ...fuelFriendData } = fuelFriend;

    return sendSuccess(res, {
      fuelFriend: fuelFriendData,
      token
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('Google auth error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Google authentication failed');
  }
};

export const registerStep1 = async (req: Request, res: Response) => {
  return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'This endpoint is not available for fuel agent app');
};

export const registerComplete = async (req: Request, res: Response) => {
  return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'This endpoint is not available for fuel agent app');
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