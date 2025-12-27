import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';

let sock: any = null;
let isConnected = false;

export const initializeWhatsApp = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../auth_info_baileys'));
    
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    sock.ev.on('connection.update', (update: any) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('WhatsApp connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
        
        if (shouldReconnect) {
          initializeWhatsApp();
        }
        isConnected = false;
      } else if (connection === 'open') {
        console.log('✅ WhatsApp connected successfully');
        isConnected = true;
      }
    });

    sock.ev.on('creds.update', saveCreds);
    
  } catch (error) {
    console.error('❌ WhatsApp initialization error:', error);
  }
};

export const sendWhatsAppOTP = async (phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!sock || !isConnected) {
      return { success: false, error: 'WhatsApp not connected' };
    }

    // Format phone number (remove + and add country code if needed)
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const jid = `${formattedNumber}@s.whatsapp.net`;

    const message = `Your Fuel Agent verification code is: ${otp}\n\nThis code will expire in 10 minutes. Do not share this code with anyone.`;

    await sock.sendMessage(jid, { text: message });
    
    console.log('📱 WhatsApp OTP sent successfully to:', phoneNumber);
    return { success: true };
    
  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    return { success: false, error: error.message || 'Failed to send WhatsApp message' };
  }
};

export const isWhatsAppConnected = () => isConnected;