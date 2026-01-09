export async function sendEmailOTP(email: string, otp: string) {
  try {
    if (process.env.NODE_ENV === 'development' && process.env.SIMULATE_EMAIL_SENDING === 'true') {
      console.log('📧 SIMULATED: OTP email sent to:', email);
      console.log('🔐 SIMULATED OTP Code:', otp);
      return { success: true, messageId: 'simulated-' + Date.now(), simulated: true, otp };
    }
    
    if (!process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID) {
      console.warn('⚠️ EmailJS not configured, using simulation mode');
      console.log('📧 SIMULATED: OTP email sent to:', email);
      console.log('🔐 SIMULATED OTP Code:', otp);
      return { success: true, messageId: 'simulated-' + Date.now(), simulated: true, otp };
    }

    const templateParams = {
      to_email: email.trim().toLowerCase(),
      otp_code: otp,
      user_name: 'FuelFriend User'
    };
    
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: templateParams
      })
    });
    
    if (!response.ok) {
      throw new Error(`EmailJS API error: ${response.status} ${response.statusText}`);
    }
    
    console.log('✅ Email OTP sent successfully to:', email);
    
    return { 
      success: true, 
      messageId: 'emailjs-' + Date.now(),
      provider: 'emailjs'
    };
  } catch (error: any) {
    console.error('❌ EmailJS error:', error.message);
    
    return { 
      success: false, 
      error: error.message || 'Failed to send email'
    };
  }
}