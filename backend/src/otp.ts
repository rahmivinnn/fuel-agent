// OTP Storage and Utilities
const otpStorage = new Map<string, { otp: string; expiresAt: Date; verified: boolean }>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveOTP(identifier: string, otp: string): void {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  otpStorage.set(identifier, { otp, expiresAt, verified: false });
  
  // Auto cleanup after 5 minutes
  setTimeout(() => {
    otpStorage.delete(identifier);
  }, 5 * 60 * 1000);
}

export function verifyOTP(identifier: string, inputOtp: string): { success: boolean; error?: string; message?: string } {
  console.log('🔍 Verifying OTP for:', identifier);
  console.log('🔍 Input OTP:', inputOtp);
  console.log('🔍 Stored OTPs:', Array.from(otpStorage.keys()));
  
  const stored = otpStorage.get(identifier);
  
  if (!stored) {
    console.log('❌ OTP not found for:', identifier);
    return { success: false, error: 'OTP not found' };
  }
  
  console.log('✅ Found stored OTP:', stored.otp);
  
  if (new Date() > stored.expiresAt) {
    otpStorage.delete(identifier);
    return { success: false, error: 'OTP expired' };
  }
  
  if (stored.otp !== inputOtp) {
    return { success: false, error: 'Invalid OTP' };
  }
  
  return { success: true, message: 'OTP verified successfully' };
}

export function verifyAndConsumeOTP(identifier: string, inputOtp: string): { success: boolean; error?: string; message?: string } {
  const result = verifyOTP(identifier, inputOtp);
  
  if (result.success) {
    // Mark as verified to prevent reuse
    const stored = otpStorage.get(identifier);
    if (stored) {
      stored.verified = true;
      otpStorage.set(identifier, stored);
    }
  }
  
  return result;
}

export function cleanupExpiredOTPs(): void {
  const now = new Date();
  for (const [identifier, data] of otpStorage.entries()) {
    if (now > data.expiresAt) {
      otpStorage.delete(identifier);
    }
  }
}
