import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import qrcode from 'qrcode-terminal';

let sock: any = null;
let isConnected = false;

export const initializeWhatsApp = async () => {
  try {
    console.log('🔄 Initializing WhatsApp connection...');
    
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../auth_info_baileys'));
    
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: {
        level: 'error',
        child: () => ({
          level: 'error',
          trace: () => {},
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
          fatal: () => {}
        }),
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        fatal: () => {}
      }
    });

    sock.ev.on('connection.update', (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log('📱 Scan this QR code with WhatsApp:');
        qrcode.generate(qr, { small: true });
      }
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        
        if (shouldReconnect) {
          console.log('🔄 WhatsApp reconnecting...');
          setTimeout(() => initializeWhatsApp(), 5000);
        }
        isConnected = false;
      } else if (connection === 'open') {
        console.log('✅ WhatsApp connected');
        isConnected = true;
      }
    });

    sock.ev.on('creds.update', saveCreds);
    
  } catch (error) {
    console.error('❌ WhatsApp error:', error.message);
    setTimeout(() => initializeWhatsApp(), 10000);
  }
};

export const sendWhatsAppOTP = async (phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!sock || !isConnected) {
      return { success: false, error: 'WhatsApp not connected' };
    }

    // Format phone number - handle international numbers
    let formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!formattedNumber.match(/^(1|44|62)/)) {
      // Default to Indonesia if no country code detected
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '62' + formattedNumber.substring(1);
      } else {
        formattedNumber = '62' + formattedNumber;
      }
    }
    
    const jid = `${formattedNumber}@s.whatsapp.net`;
    const message = `Your Fuel Agent verification code is: ${otp}\n\nThis code will expire in 10 minutes. Do not share this code with anyone.`;

    await sock.sendMessage(jid, { text: message });
    
    console.log('📱 WhatsApp OTP sent to:', formattedNumber);
    return { success: true };
    
  } catch (error) {
    console.error('❌ WhatsApp send error:', error.message);
    return { success: false, error: error.message || 'Failed to send WhatsApp message' };
  }
};

export const isWhatsAppConnected = () => isConnected;