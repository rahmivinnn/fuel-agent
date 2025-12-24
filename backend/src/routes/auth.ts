import { Router } from 'express';
import { login, getProfile, getWhatsAppStatus } from '../controllers/authOTP';
import { sendEmailOTP, verifyEmailOTP, sendWhatsAppOTP, verifyWhatsAppOTP } from '../controllers/otpController';
import { 
  googleAuth, registerStep1, registerComplete, emailVerification, 
  verifyCode, forgotPassword, resetPassword 
} from '../controllers/authExtended';
import { restartWhatsApp, addResendContact, createTestOrder } from '../controllers/misc';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Auth routes
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/register/step1', registerStep1);
router.post('/register/complete', registerComplete);
router.post('/email-verification', emailVerification);
router.post('/verify-code', verifyCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticateToken, getProfile);

// OTP routes - separate like old API
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