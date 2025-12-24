import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

class WhatsAppService {
  private sock: ReturnType<typeof makeWASocket> | null = null;
  public isConnected = false;
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
        browser: ['FuelFriend Agent', 'Chrome', '1.0.0'],
        syncFullHistory: false,
        generateHighQualityLinkPreview: false,
        markOnlineOnConnect: false,
      });

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          console.log('\n🔥 WHATSAPP QR CODE - SCAN WITH YOUR PHONE:');
          console.log('='.repeat(50));
          try {
            const qrcode = await import('qrcode-terminal');
            qrcode.default.generate(qr, { small: true });
          } catch (e) {
            console.log('QR Code:', qr);
          }
          console.log('='.repeat(50));
          console.log('⬆️ Open WhatsApp > Settings > Linked Devices > Link a Device');
          console.log('📱 Scan the QR code above to connect WhatsApp\n');
        }
        
        if (connection === 'close') {
          this.isConnected = false;
          const shouldReconnect = (lastDisconnect?.error instanceof Boom) 
            ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
            : true;
          
          console.log('❌ WhatsApp disconnected');
          if (shouldReconnect) {
            console.log('🔄 Reconnecting in 10 seconds...');
            setTimeout(() => this.initialize(), 10000);
          }
        } else if (connection === 'open') {
          console.log('✅ WhatsApp connected successfully!');
          this.isConnected = true;
        } else if (connection === 'connecting') {
          console.log('🔄 WhatsApp connecting...');
        }
      });

      this.sock.ev.on('creds.update', saveCreds);
      
    } catch (error) {
      console.error('❌ WhatsApp initialization error:', error);
      setTimeout(() => this.initialize(), 10000);
    }
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<{success: boolean, message: string}> {
    for (let i = 0; i < 10; i++) {
      if (this.isConnected) break;
      console.log(`⏳ Waiting for WhatsApp connection... (${i+1}/10)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp not connected - scan QR code first');
    }

    try {
      let formattedNumber = phoneNumber.replace(/[^\d]/g, '');
      if (formattedNumber.startsWith('08')) {
        formattedNumber = '62' + formattedNumber.substring(1);
      } else if (formattedNumber.startsWith('8')) {
        formattedNumber = '62' + formattedNumber;
      }
      
      const jid = `${formattedNumber}@s.whatsapp.net`;
      
      const message = `🔐 *FuelFriend Agent OTP*\n\nKode verifikasi: *${otp}*\n\n⏰ Berlaku 10 menit\n🔒 Jangan bagikan kode ini\n\nTerima kasih! 🚗⛽`;
      
      await this.sock.sendMessage(jid, { text: message });
      
      console.log(`✅ WhatsApp OTP sent to ${phoneNumber}`);
      return { success: true, message: 'WhatsApp OTP sent successfully' };
      
    } catch (error: any) {
      console.error('❌ Failed to send WhatsApp OTP:', error);
      throw new Error(`WhatsApp send failed: ${error.message}`);
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      hasSocket: !!this.sock
    };
  }
}

export const whatsappService = new WhatsAppService();
whatsappService.initialize();

export default whatsappService;