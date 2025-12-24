import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';
import { generateOTP, saveOTP, verifyOTP } from '../services/otp';
import { whatsappService } from '../services/whatsapp';
import { sendEmailOTP as emailService } from '../services/email';

export const sendEmailOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, RESPONSE_CODES.EMAIL_INVALID, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otp = generateOTP();
    saveOTP(normalizedEmail, otp);

    console.log('📧 Sending email OTP to:', normalizedEmail, 'OTP:', otp);

    const result = await emailService(normalizedEmail, otp);

    if (result.success) {
      return sendSuccess(res, null, RESPONSE_CODES.OTP_SENT);
    } else {
      return sendError(res, RESPONSE_CODES.EMAIL_SEND_FAILED, 500, result.error);
    }
  } catch (error) {
    console.error('Email OTP error:', error);
    return sendError(res, RESPONSE_CODES.EMAIL_SEND_FAILED, 500);
  }
};

export const verifyEmailOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Email and OTP are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, RESPONSE_CODES.EMAIL_INVALID, 400);
    }

    if (!/^\d{6}$/.test(otp)) {
      return sendError(res, RESPONSE_CODES.OTP_INVALID, 400, 'OTP must be 6 digits');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = verifyOTP(normalizedEmail, otp);

    if (result.success) {
      return sendSuccess(res, { message: result.message }, RESPONSE_CODES.SUCCESS);
    } else {
      let errorCode = RESPONSE_CODES.OTP_INVALID;
      if (result.error === 'OTP expired') errorCode = RESPONSE_CODES.OTP_EXPIRED;
      if (result.error === 'OTP already used') errorCode = RESPONSE_CODES.OTP_ALREADY_USED;
      
      return sendError(res, errorCode, 400, result.error);
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500);
  }
};

export const sendWhatsAppOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Phone number required');
    }

    const otp = generateOTP();
    saveOTP(phoneNumber, otp);

    console.log('📱 Sending WhatsApp OTP to:', phoneNumber, 'OTP:', otp);

    if (!whatsappService.isConnected) {
      return sendError(res, RESPONSE_CODES.WA_NOT_CONNECTED, 503);
    }

    const result = await whatsappService.sendOTP(phoneNumber, otp);

    if (result.success) {
      return sendSuccess(res, { 
        message: 'Verification code sent to your WhatsApp',
        provider: 'whatsapp'
      }, RESPONSE_CODES.OTP_SENT);
    } else {
      return sendError(res, RESPONSE_CODES.WA_SEND_FAILED, 500, result.message);
    }
  } catch (error: any) {
    console.error('WhatsApp OTP error:', error);
    return sendError(res, RESPONSE_CODES.WA_SEND_FAILED, 500, error.message);
  }
};

export const verifyWhatsAppOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Phone number and OTP are required');
    }

    console.log('Verifying WhatsApp OTP for:', phoneNumber, 'OTP:', otp);
    const result = verifyOTP(phoneNumber, otp);
    console.log('Verification result:', result);

    if (result.success) {
      return sendSuccess(res, { 
        message: result.message, 
        user: { phoneNumber, verified: true } 
      }, RESPONSE_CODES.SUCCESS);
    } else {
      let errorCode = RESPONSE_CODES.OTP_INVALID;
      if (result.error === 'OTP expired') errorCode = RESPONSE_CODES.OTP_EXPIRED;
      if (result.error === 'OTP already used') errorCode = RESPONSE_CODES.OTP_ALREADY_USED;
      
      return sendError(res, errorCode, 400, result.error);
    }
  } catch (error) {
    console.error('WhatsApp OTP verify error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500);
  }
};