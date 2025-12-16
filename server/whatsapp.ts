import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import logger from '@whiskeysockets/baileys/lib/Utils/logger';

// Logger configuration
const log = logger.child({});
log.level = 'silent'; // Set to 'debug' for more verbose logging

// Store authentication state in files
let authState: Awaited<ReturnType<typeof useMultiFileAuthState>> | null = null;

/**
 * Initialize WhatsApp connection
 */
async function initWhatsApp() {
  if (!authState) {
    authState = await useMultiFileAuthState('whatsapp-auth');
  }

  const sock = makeWASocket({
    auth: authState.state,
    logger: log,
    printQRInTerminal: true,
    browser: ['FuelFriend', 'Chrome', '1.0.0'],
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        initWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('WhatsApp connection opened');
    }
  });

  sock.ev.on('creds.update', authState.saveCreds);

  return sock;
}

// Global WhatsApp socket instance
let whatsappSocket: ReturnType<typeof makeWASocket> | null = null;

/**
 * Get WhatsApp socket instance
 */
async function getWhatsAppSocket() {
  if (!whatsappSocket) {
    whatsappSocket = await initWhatsApp();
  }
  return whatsappSocket;
}

/**
 * Send OTP via WhatsApp
 * @param phoneNumber Phone number in international format (e.g., +1234567890)
 * @param otp 4-digit OTP code
 */
export async function sendOTPviaWhatsApp(phoneNumber: string, otp: string) {
  try {
    // Ensure we have a valid WhatsApp connection
    const sock = await getWhatsAppSocket();
    
    // Format phone number for WhatsApp (remove + and add @s.whatsapp.net)
    const formattedNumber = phoneNumber.replace('+', '') + '@s.whatsapp.net';
    
    // Send OTP message
    const message = {
      text: `🔐 FuelFriendly Verification Code: ${otp}

Please enter this code to verify your account.

This code will expire in 10 minutes.`
    };
    
    await sock.sendMessage(formattedNumber, message);
    console.log(`OTP sent successfully to ${phoneNumber}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send OTP via WhatsApp:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Generate a random 4-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Export for use in other modules
export { initWhatsApp, getWhatsAppSocket };