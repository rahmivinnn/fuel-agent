// Alternative WhatsApp service tanpa Twilio
// Menggunakan WhatsApp Web API langsung

export async function sendWhatsAppDirect(phoneNumber: string, otp: string) {
  try {
    // Gunakan Baileys (WhatsApp Web API)
    const { whatsappService } = await import('./whatsapp');
    
    if (!whatsappService.isConnected) {
      throw new Error('WhatsApp not connected - scan QR code first');
    }
    
    const message = `🔐 *FuelFriend Driver OTP*

Kode verifikasi: *${otp}*

⏰ Berlaku 10 menit
🔒 Jangan bagikan kode ini`;
    
    await whatsappService.sendOTP(phoneNumber, otp);
    
    return {
      success: true,
      message: 'WhatsApp OTP sent via direct connection',
      provider: 'baileys'
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      provider: 'baileys'
    };
  }
}