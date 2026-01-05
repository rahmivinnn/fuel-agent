import { Router } from 'express';
import { login, getProfile, getWhatsAppStatus } from '../controllers/authOTP';
import { sendEmailOTP, verifyEmailOTP, sendWhatsAppOTP, verifyWhatsAppOTP } from '../controllers/otpController';
import { 
  googleAuth, googleCallback, registerStep1, registerComplete, emailVerification, 
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
    
    // Try to find user in fuel_friends table first
    let fuelFriend = await storage.getFuelFriend(userId);
    console.log('👥 fuelFriend from DB:', fuelFriend ? 'Found' : 'Not found');
    
    // If not found by ID, try by email
    if (!fuelFriend && req.user.email) {
      console.log('🔍 Trying to find by email:', req.user.email);
      fuelFriend = await storage.getFuelFriendByEmail(req.user.email);
      console.log('📧 fuelFriend by email:', fuelFriend ? 'Found' : 'Not found');
    }
    
    if (!fuelFriend) {
      console.log('❌ User not found in database');
      return sendError(res, RESPONSE_CODES.USER_NOT_FOUND, 404, 'User not found');
    }
    
    const vehicles = [];
    const { password, ...fuelFriendData } = fuelFriend;
    
    console.log('✅ Returning user data:', { id: fuelFriendData.id, email: fuelFriendData.email });
    
    return sendSuccess(res, { 
      fuelFriend: fuelFriendData,
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
    console.log('🔐 Login attempt:', { emailOrPhone, password: password ? 'provided' : 'missing' });

    if (!emailOrPhone || !password) {
      return sendError(res, RESPONSE_CODES.LOGIN_FAILED, 400, 'Email/phone and password are required');
    }

    let fuelFriend = await storage.getFuelFriendByEmail(emailOrPhone);
    console.log('👤 Found fuel friend:', fuelFriend ? `${fuelFriend.fullName} (${fuelFriend.email})` : 'Not found');
    
    // If user not found, create one for testing
    if (!fuelFriend && emailOrPhone === 'm.wasilahhadi@gmail.com') {
      console.log('🆕 Creating fuel friend for testing...');
      fuelFriend = await storage.createFuelFriend({
        fullName: 'M Wasilah Hadi',
        email: 'm.wasilahhadi@gmail.com',
        phoneNumber: '089502694005',
        password: 'password123',
        location: 'Jakarta',
        deliveryFee: '5000.00',
        isEmailVerified: true
      });
      console.log('✅ Created fuel friend:', fuelFriend.id);
    }
    
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
    console.error('Login error:', error);
    return sendError(res, RESPONSE_CODES.LOGIN_FAILED, 500, 'Login failed');
  }
});

// Auth routes
router.post('/google', googleAuth);
// OAuth callbacks - pindahkan ke atas sebelum routes lain
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    const userAgent = req.headers['user-agent'] || '';
    const isAPK = userAgent.includes('wv') || userAgent.includes('Mobile');
    
    if (error) {
      const redirectUrl = isAPK 
        ? `fuelfriend://login?error=${error}`
        : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${error}`;
      return res.redirect(redirectUrl);
    }
    
    if (!code) {
      const redirectUrl = isAPK 
        ? `fuelfriend://login?error=no_code`
        : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_code`;
      return res.redirect(redirectUrl);
    }
    
    const { googleCallback } = await import('../controllers/authExtended');
    const mockReq = { body: { code } };
    const mockRes = {
      json: (data: any) => data,
      status: (code: number) => ({ json: (data: any) => ({ status: code, data }) })
    };
    
    const result = await googleCallback(mockReq as any, mockRes as any);
    
    if (result.success) {
      const token = result.data.token;
      const redirectUrl = isAPK 
        ? `fuelfriend://auth/success?token=${token}`
        : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}`;
      return res.redirect(redirectUrl);
    } else {
      const redirectUrl = isAPK 
        ? `fuelfriend://login?error=auth_failed`
        : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`;
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Google callback error:', error);
    const userAgent = req.headers['user-agent'] || '';
    const isAPK = userAgent.includes('wv') || userAgent.includes('Mobile');
    const redirectUrl = isAPK 
      ? `fuelfriend://login?error=server_error`
      : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`;
    return res.redirect(redirectUrl);
  }
});

router.post('/google/callback', googleCallback);
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
router.post('/test/notification', async (req, res) => {
  try {
    const { title, body, token } = req.body;
    
    if (!title || !body) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Title and body required');
    }

    // Import push notification service
    const { sendPushNotification } = await import('../services/pushNotifications');
    
    const result = await sendPushNotification({
      token: token || 'test-token',
      title: title || 'Test Notification',
      body: body || 'This is a test notification from Fuel Friend',
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    });

    return sendSuccess(res, {
      message: 'Test notification sent',
      result
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('Test notification error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to send test notification');
  }
});

export default router;