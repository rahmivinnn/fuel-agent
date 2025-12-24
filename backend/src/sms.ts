// SMS OTP Service using Twilio
// For Indonesian phone numbers, SMS is more reliable than WhatsApp Business API

import { generateOTP } from './otp';

interface SMSResult {
  success: boolean;
  message?: string;
  error?: string;
  provider?: 'twilio-sms' | 'twilio-whatsapp' | 'simulation';
  messageId?: string;
}

/**
 * Send OTP via Twilio SMS (Recommended for Indonesian numbers)
 */
async function sendViaTwilioSMS(phoneNumber: string, otp: string): Promise<SMSResult> {
  try {
    // Check Twilio configuration
    if (!process.env.TWILIO_ACCOUNT_SID || 
        !process.env.TWILIO_AUTH_TOKEN || 
        process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') {
      throw new Error('Twilio not configured');
    }

    const { default: twilio } = await import('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const message = `🔐 FuelFriend Driver OTP

Kode verifikasi: ${otp}

Berlaku 10 menit. Jangan bagikan kode ini.`;
    
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber;
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log('✅ Twilio SMS OTP sent to:', phoneNumber);
    
    return {
      success: true,
      message: 'OTP sent via SMS',
      provider: 'twilio-sms',
      messageId: result.sid
    };
    
  } catch (error: any) {
    console.error('❌ Twilio SMS error:', error.message);
    throw error;
  }
}

/**
 * Send OTP via Twilio WhatsApp (if WhatsApp Business is configured)
 */
async function sendViaTwilioWhatsApp(phoneNumber: string, otp: string): Promise<SMSResult> {
  try {
    const { default: twilio } = await import('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const message = `🔐 *FuelFriend Driver OTP*

Kode verifikasi: *${otp}*

⏰ Berlaku 10 menit
🔒 Jangan bagikan kode ini`;
    
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber;
    
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('✅ Twilio WhatsApp OTP sent to:', phoneNumber);
    
    return {
      success: true,
      message: 'OTP sent via WhatsApp',
      provider: 'twilio-whatsapp',
      messageId: result.sid
    };
    
  } catch (error: any) {
    console.error('❌ Twilio WhatsApp error:', error.message);
    throw error;
  }
}

/**
 * Simulation mode for development
 */
function simulateSMS(phoneNumber: string, otp: string): SMSResult {
  console.log('📱 SIMULATED: SMS OTP sent to:', phoneNumber);
  console.log('🔐 SIMULATED OTP Code:', otp);
  
  return {
    success: true,
    message: 'SMS OTP simulated successfully',
    provider: 'simulation',
    messageId: 'simulated-' + Date.now()
  };
}

/**
 * Main function to send WhatsApp OTP using Baileys (primary) with Twilio fallback
 */
export async function sendSMSOTP(phoneNumber: string, otp?: string, preferWhatsApp: boolean = true): Promise<SMSResult> {
  const otpCode = otp || generateOTP();
  
  // NO SIMULATION - always try real services
  console.log('📱 Attempting to send WhatsApp OTP to:', phoneNumber);
  
  // Strategy 1: Try Baileys WhatsApp first (free, no limits)
  if (preferWhatsApp) {
    try {
      const { whatsappService } = await import('./whatsapp');
      
      console.log('🔍 Checking Baileys connection status:', whatsappService.isConnected);
      
      if (whatsappService.isConnected) {
        console.log('✅ Baileys connected, sending OTP...');
        const result = await whatsappService.sendOTP(phoneNumber, otpCode);
        return {
          success: true,
          message: 'WhatsApp OTP sent via Baileys',
          provider: 'baileys',
          messageId: 'baileys-' + Date.now()
        };
      } else {
        console.warn('⚠️ Baileys WhatsApp not connected');
        throw new Error('WhatsApp not connected - scan QR code first');
      }
    } catch (baileysError) {
      console.error('❌ Baileys failed:', baileysError.message);
      
      // Return error immediately - no fallback to avoid confusion
      return {
        success: false,
        error: `WhatsApp not connected. Please ensure WhatsApp Web is connected by scanning QR code in server terminal.`,
        provider: 'baileys-error'
      };
    }
  }
  
  // If not preferring WhatsApp, return error
  return {
    success: false,
    error: 'WhatsApp service not available',
    provider: 'error'
  };
}

/**
 * Check SMS service status
 */
export async function getSMSStatus() {
  const status = {
    twilioSMS: false,
    twilioWhatsApp: false,
    available: false
  };
  
  // Check Twilio SMS
  try {
    if (process.env.TWILIO_ACCOUNT_SID && 
        process.env.TWILIO_AUTH_TOKEN && 
        process.env.TWILIO_PHONE_NUMBER &&
        process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid') {
      status.twilioSMS = true;
    }
  } catch (error) {
    // SMS not available
  }
  
  // Check Twilio WhatsApp
  try {
    if (process.env.TWILIO_WHATSAPP_NUMBER) {
      status.twilioWhatsApp = true;
    }
  } catch (error) {
    // WhatsApp not available
  }
  
  status.available = status.twilioSMS || status.twilioWhatsApp;
  
  return status;
}