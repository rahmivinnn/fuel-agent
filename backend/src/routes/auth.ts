import { Router } from 'express';
import { login, getProfile, getWhatsAppStatus } from '../controllers/authOTP';
import { sendEmailOTP, verifyEmailOTP, sendWhatsAppOTP, verifyWhatsAppOTP } from '../controllers/otpController';
import { 
  googleAuth, registerStep1, registerComplete, emailVerification, 
  verifyCode, forgotPassword, resetPassword 
} from '../controllers/authExtended';
import { restartWhatsApp, addResendContact, createTestOrder } from '../controllers/misc';
import { authenticateToken } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';
import { storage } from '../services/postgres-storage';
import { generateToken } from '../utils/auth';
import { registrationStep1Schema, registrationStep2Schema } from '@shared/schema';

const router = Router();

// Get current user from JWT token
router.get('/me', authenticateToken, async (req, res) => {
  console.log('🔐 /auth/me route handler called');
  console.log('👤 req.user:', req.user);
  
  try {
    const userId = req.user.userId;
    console.log('🆔 userId from token:', userId);
    
    const fuelFriend = await storage.getFuelFriend(userId);
    console.log('👥 fuelFriend from DB:', fuelFriend ? 'Found' : 'Not found');
    
    if (!fuelFriend) {
      console.log('❌ User not found in database');
      return sendError(res, RESPONSE_CODES.USER_NOT_FOUND, 404, 'User not found');
    }
    
    const vehicles = await storage.getVehiclesByCustomer(userId);
    const { password, ...fuelFriendData } = fuelFriend;
    
    console.log('✅ Returning user data:', { id: fuelFriendData.id, email: fuelFriendData.email });
    
    return sendSuccess(res, { 
      customer: fuelFriendData,
      vehicles 
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('💥 /auth/me error:', error);
    return sendError(res, RESPONSE_CODES.UNAUTHORIZED, 401, 'Invalid token');
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return sendError(res, RESPONSE_CODES.LOGIN_FAILED, 400, 'Email/phone and password are required');
    }

    const fuelFriend = await storage.getFuelFriendByEmail(emailOrPhone);
    if (!fuelFriend) {
      return sendError(res, RESPONSE_CODES.LOGIN_FAILED, 401, 'Invalid credentials');
    }

    const token = generateToken({
      userId: fuelFriend.id,
      email: fuelFriend.email
    });

    const { password: _, ...fuelFriendData } = fuelFriend;

    return sendSuccess(res, {
      fuelFriend: fuelFriendData,
      fuelFriendId: fuelFriend.id,
      token
    }, RESPONSE_CODES.LOGIN_SUCCESS);
  } catch (error) {
    return sendError(res, RESPONSE_CODES.LOGIN_FAILED, 500, 'Login failed');
  }
});

// Auth routes
router.post('/google', googleAuth);
router.post('/register/step1', registerStep1);
router.post('/register/complete', registerComplete);
router.post('/email-verification', emailVerification);
router.post('/verify-code', verifyCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticateToken, getProfile);

// OTP routes
router.post('/otp/email/send', sendEmailOTP);
router.post('/otp/email/verify', verifyEmailOTP);
router.post('/otp/whatsapp/send', sendWhatsAppOTP);
router.post('/otp/whatsapp/verify', verifyWhatsAppOTP);
router.get('/otp/whatsapp/status', getWhatsAppStatus);
router.post('/otp/whatsapp/restart', restartWhatsApp);

// Misc routes
router.post('/resend/contact', addResendContact);
router.post('/test/create-order', createTestOrder);

export default router;