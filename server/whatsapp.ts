import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';

class WhatsAppService {
  private sock: ReturnType<typeof makeWASocket> | null = null;
  private isConnected = false;
  private sessionPath = 'whatsapp-auth';

  async initialize() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);
      
      const logger = {
        level: 'silent' as const,
        child: () => logger,
        info: () => {},
        error: () => {},
        warn: () => {},
        debug: () => {},
        trace: () => {}
      };

      this.sock = makeWASocket({
        auth: state,
        logger,
        browser: ['FuelFriend Driver', 'Chrome', '1.0.0'],
        syncFullHistory: false,
        generateHighQualityLinkPreview: false,
        markOnlineOnConnect: false,
      });

      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          console.log('\n📱 SCAN QR CODE WITH WHATSAPP:');
          qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
          this.isConnected = false;
          const shouldReconnect = (lastDisconnect?.error instanceof Boom) 
            ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
            : true;
          
          if (shouldReconnect) {
            setTimeout(() => this.initialize(), 5000);
          }
        } else if (connection === 'open') {
          console.log('✅ WhatsApp connected successfully!');
          this.isConnected = true;
        }
      });

      this.sock.ev.on('creds.update', saveCreds);
      
    } catch (error) {
      console.error('❌ WhatsApp initialization error:', error);
      setTimeout(() => this.initialize(), 10000);
    }
  }

  async sendOTP(phoneNumber: string, otp: string) {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      const formattedNumber = phoneNumber.replace(/[^\d]/g, '');
      const jid = `${formattedNumber}@s.whatsapp.net`;
      
      const message = `🔐 *FuelFriend Driver OTP*\n\nVerification code: *${otp}*\n\nValid for 10 minutes.\nDo not share this code.`;
      
      await this.sock.sendMessage(jid, { text: message });
      
      console.log(`✅ OTP sent to ${phoneNumber}`);
      return { success: true, message: 'OTP sent successfully' };
      
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      throw new Error('Failed to send WhatsApp OTP');
    }
  }
}

export default new WhatsAppService();

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via WhatsApp (legacy function for compatibility)
 */
export async function sendOTPviaWhatsApp(phoneNumber: string, otp: string) {
  return await whatsappService.sendOTP(phoneNumber, otp);
}

const whatsappService = new WhatsAppService();

// Initialize on import
whatsappService.initialize();

export { whatsappService };