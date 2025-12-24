import sgMail from '@sendgrid/mail';

export async function sendEmailOTP(email: string, otp: string) {
  try {
    // Development simulation
    if (process.env.NODE_ENV === 'development' && process.env.SIMULATE_EMAIL_SENDING === 'true') {
      console.log('📧 SIMULATED: OTP email sent to:', email);
      console.log('🔐 SIMULATED OTP Code:', otp);
      return { success: true, messageId: 'simulated-' + Date.now(), simulated: true, otp };
    }
    
    // Check SendGrid configuration
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key') {
      console.warn('⚠️ SendGrid not configured, using simulation mode');
      console.log('📧 SIMULATED: OTP email sent to:', email);
      console.log('🔐 SIMULATED OTP Code:', otp);
      return { success: true, messageId: 'simulated-' + Date.now(), simulated: true, otp };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@fuelfriend.com';
    
    const msg = {
      to: email.trim().toLowerCase(),
      from: {
        email: fromEmail,
        name: 'FuelFriend Driver'
      },
      subject: '🔐 Your Verification Code - FuelFriend Driver',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FuelFriend Driver OTP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #3AC36C 0%, #2EAD5A 100%); padding: 30px; text-align: center;">
              <img src="https://api.kelolahrd.life/logo.png" alt="FuelFriend" style="height: 40px; margin-bottom: 10px;" />
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold; font-family: 'Poppins', Arial, sans-serif;">FuelFriend Driver</h1>
            </div>
            <div style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #3F4249; margin: 0 0 20px 0; font-size: 20px; font-family: 'Poppins', Arial, sans-serif;">Verification Code</h2>
              <p style="color: #606268; margin: 0 0 30px 0; font-size: 16px; line-height: 1.5; font-family: 'Poppins', Arial, sans-serif;">Enter this code in the app to verify your account:</p>
              <div style="background-color: #f0fdf4; border: 2px dashed #3AC36C; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <div style="font-size: 32px; font-weight: bold; color: #3AC36C; letter-spacing: 4px; font-family: 'Courier New', monospace;">${otp}</div>
              </div>
              <p style="color: #606268; font-size: 14px; margin: 20px 0 0 0; font-family: 'Poppins', Arial, sans-serif;">This code expires in 10 minutes</p>
              <p style="color: #606268; font-size: 14px; margin: 5px 0 0 0; font-family: 'Poppins', Arial, sans-serif;">Do not share this code with anyone</p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; font-family: 'Poppins', Arial, sans-serif;">© 2024 FuelFriend. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `FuelFriend Driver\n\nYour verification code: ${otp}\n\nThis code expires in 10 minutes.\nDo not share this code with anyone.`
    };
    
    const result = await sgMail.send(msg);
    console.log('✅ Email OTP sent successfully to:', email);
    
    return { 
      success: true, 
      messageId: result[0].headers['x-message-id'] || 'sendgrid-' + Date.now(),
      provider: 'sendgrid'
    };
  } catch (error: any) {
    console.error('❌ SendGrid error:', error.response?.body || error.message);
    
    // Return error instead of fallback to prevent double response
    return { 
      success: false, 
      error: error.message || 'Failed to send email'
    };
  }
}