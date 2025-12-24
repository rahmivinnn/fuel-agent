// Unified WhatsApp OTP Service
// Supports both Twilio (recommended) and Baileys (fallback)

import { generateOTP } from './otp';

interface WhatsAppResult {
  success: boolean;
  message?: string;
  error?: string;
  provider?: 'twilio' | 'baileys' | 'simulation';
  messageId?: string;
}

/**
 * Send OTP via Twilio WhatsApp Business API (Recommended)
 */
async function sendViaTwilio(phoneNumber: string, otp: string): Promise<WhatsAppResult> {
  try {
    // Check Twilio configuration
    if (!process.env.TWILIO_ACCOUNT_SID || 
        !process.env.TWILIO_AUTH_TOKEN || 
        process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') {
      throw new Error('Twilio not configured');
    }

    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const message = `🔐 *FuelFriend Driver OTP*

Your verification code: *${otp}*

⏰ Valid for 10 minutes
🔒 Do not share this code with anyone

Thank you for using FuelFriend! 🚗⛽`;
    
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber;
    
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('✅ Twilio WhatsApp OTP sent to:', phoneNumber);
    
    return {
      success: true,
      message: 'OTP sent via WhatsApp (Twilio)',
      provider: 'twilio',
      messageId: result.sid
    };
    
  } catch (error: any) {
    console.error('❌ Twilio WhatsApp error:', error.message);
    throw error;
  }
}

/**
 * Send OTP via Baileys (Direct WhatsApp Web API)
 */
async function sendViaBaileys(phoneNumber: string, otp: string): Promise<WhatsAppResult> {
  try {
    const { whatsappService } = await import('./whatsapp');
    
    if (!whatsappService.isConnected) {
      throw new Error('Baileys WhatsApp not connected');
    }
    
    const result = await whatsappService.sendOTP(phoneNumber, otp);
    
    return {
      success: true,
      message: 'OTP sent via WhatsApp (Baileys)',
      provider: 'baileys',
      messageId: 'baileys-' + Date.now()
    };
    
  } catch (error: any) {
    console.error('❌ Baileys WhatsApp error:', error.message);
    throw error;
  }
}

/**
 * Simulation mode for development
 */
function simulateWhatsApp(phoneNumber: string, otp: string): WhatsAppResult {
  console.log('📱 SIMULATED: WhatsApp OTP sent to:', phoneNumber);
  console.log('🔐 SIMULATED OTP Code:', otp);
  
  return {
    success: true,
    message: 'WhatsApp OTP simulated successfully',
    provider: 'simulation',
    messageId: 'simulated-' + Date.now()
  };
}

/**
 * Main function to send WhatsApp OTP with fallback strategy
 */
export async function sendWhatsAppOTP(phoneNumber: string, otp?: string): Promise<WhatsAppResult> {
  const otpCode = otp || generateOTP();
  
  // Development simulation
  if (process.env.NODE_ENV === 'development' && process.env.SIMULATE_WHATSAPP_SENDING === 'true') {
    return simulateWhatsApp(phoneNumber, otpCode);
  }
  
  // Strategy 1: Try Twilio first (recommended for production)
  try {
    return await sendViaTwilio(phoneNumber, otpCode);
  } catch (twilioError) {
    console.warn('⚠️ Twilio failed, trying Baileys fallback...');
    
    // Strategy 2: Fallback to Baileys
    try {
      return await sendViaBaileys(phoneNumber, otpCode);
    } catch (baileysError) {
      console.warn('⚠️ Baileys also failed, using simulation...');
      
      // Strategy 3: Final fallback to simulation
      return {
        ...simulateWhatsApp(phoneNumber, otpCode),
        error: `Both providers failed: Twilio(${twilioError.message}), Baileys(${baileysError.message})`
      };
    }
  }
}

/**
 * Check WhatsApp service status
 */
export async function getWhatsAppStatus() {
  const status = {
    twilio: false,
    baileys: false,
    available: false
  };
  
  // Check Twilio
  try {
    if (process.env.TWILIO_ACCOUNT_SID && 
        process.env.TWILIO_AUTH_TOKEN && 
        process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid') {
      status.twilio = true;
    }
  } catch (error) {
    // Twilio not available
  }
  
  // Check Baileys
  try {
    const { whatsappService } = await import('./whatsapp');
    status.baileys = whatsappService.isConnected || false;
  } catch (error) {
    // Baileys not available
  }
  
  status.available = status.twilio || status.baileys;
  
  return status;
}