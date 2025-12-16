import { Resend } from "resend";

export async function sendEmailOTP(email: string, otp: string) {
  try {
    if (process.env.NODE_ENV === 'development' && process.env.SIMULATE_EMAIL_SENDING === 'true') {
      console.log('📧 SIMULATED: OTP email sent to:', email);
      console.log('🔐 SIMULATED OTP Code:', otp);
      return { success: true, messageId: 'simulated-' + Date.now(), simulated: true, otp };
    }
    
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'Email service not configured' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: email.trim().toLowerCase(),
      subject: 'Your OTP Code - FuelFriend Driver',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ea580c;">FuelFriend Driver</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #333; margin: 20px 0;">${otp}</div>
          <p style="color: #666;">This code expires in 10 minutes.</p>
        </div>
      `
    });
    
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}