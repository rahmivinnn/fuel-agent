import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';
import { verifyOTP } from '../otp';
import { storage } from '../services/postgres-storage';
import { generateToken } from '../utils/auth';

export const registerFuelFriend = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Fuel friend registration started:', req.body);
    
    const { 
      email, 
      otp, 
      fullName, 
      phoneNumber, 
      password, 
      location, 
      deliveryFee 
    } = req.body;

    // Validasi input
    if (!email || !otp || !fullName || !phoneNumber || !password || !location || !deliveryFee) {
      console.log('❌ Missing required fields');
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'All fields are required');
    }

    // Verifikasi OTP terlebih dahulu
    const normalizedEmail = email.trim().toLowerCase();
    console.log('🔍 Verifying OTP for fuel friend registration:', normalizedEmail);
    
    const otpResult = verifyOTP(normalizedEmail, otp);
    console.log('🔍 OTP verification result:', otpResult);

    if (!otpResult.success) {
      let errorCode = RESPONSE_CODES.OTP_INVALID;
      if (otpResult.error === 'OTP expired') errorCode = RESPONSE_CODES.OTP_EXPIRED;
      if (otpResult.error === 'OTP already used') errorCode = RESPONSE_CODES.OTP_ALREADY_USED;
      
      return sendError(res, errorCode, 400, otpResult.error);
    }

    // Cek apakah email sudah terdaftar di fuel friends
    console.log('🔍 Checking existing fuel friend:', normalizedEmail);
    const existingFuelFriend = await storage.getFuelFriendByEmail(normalizedEmail);
    if (existingFuelFriend) {
      return sendError(res, RESPONSE_CODES.EMAIL_ALREADY_EXISTS, 409, 'Email already registered');
    }

    // Buat fuel friend baru
    console.log('🔄 Creating fuel friend:', { fullName, email: normalizedEmail, phoneNumber, location, deliveryFee });
    
    const fuelFriend = await storage.createFuelFriend({
      fullName,
      email: normalizedEmail,
      phoneNumber,
      password,
      location,
      deliveryFee: parseFloat(deliveryFee),
      isAvailable: true,
      isEmailVerified: true // Set true karena sudah verifikasi OTP
    });

    console.log('✅ Fuel friend created:', fuelFriend.id);

    // Generate token
    const token = generateToken({ 
      userId: fuelFriend.id, 
      email: fuelFriend.email,
      userType: 'fuel_friend'
    });

    return sendSuccess(res, {
      fuelFriend: {
        id: fuelFriend.id,
        fullName: fuelFriend.fullName,
        email: fuelFriend.email,
        phoneNumber: fuelFriend.phoneNumber,
        location: fuelFriend.location,
        deliveryFee: fuelFriend.deliveryFee,
        isAvailable: fuelFriend.isAvailable,
        isEmailVerified: fuelFriend.isEmailVerified
      },
      token
    }, RESPONSE_CODES.SUCCESS);

  } catch (error) {
    console.error('❌ Fuel friend registration error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, error.message || 'Registration failed');
  }
};

export const loginFuelFriend = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Email and password are required');
    }

    const fuelFriend = await storage.getFuelFriendByEmail(email.trim().toLowerCase());
    if (!fuelFriend) {
      return sendError(res, RESPONSE_CODES.INVALID_CREDENTIALS, 401);
    }

    const bcrypt = require('bcrypt');
    const isValidPassword = await bcrypt.compare(password, fuelFriend.password);
    if (!isValidPassword) {
      return sendError(res, RESPONSE_CODES.INVALID_CREDENTIALS, 401);
    }

    const token = generateToken({ 
      userId: fuelFriend.id, 
      email: fuelFriend.email,
      userType: 'fuel_friend'
    });

    return sendSuccess(res, {
      fuelFriend: {
        id: fuelFriend.id,
        fullName: fuelFriend.fullName,
        email: fuelFriend.email,
        phoneNumber: fuelFriend.phoneNumber,
        location: fuelFriend.location,
        deliveryFee: fuelFriend.deliveryFee,
        isAvailable: fuelFriend.isAvailable
      },
      token
    }, RESPONSE_CODES.SUCCESS);

  } catch (error) {
    console.error('Fuel friend login error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500);
  }
};