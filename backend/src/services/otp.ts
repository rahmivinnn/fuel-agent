const otpStorage = new Map<string, { otp: string; expiresAt: Date; verified: boolean }>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveOTP(identifier: string, otp: string): void {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  otpStorage.set(identifier, { otp, expiresAt, verified: false });
  
  setTimeout(() => {
    otpStorage.delete(identifier);
  }, 10 * 60 * 1000);
}

export function verifyOTP(identifier: string, inputOtp: string): { success: boolean; error?: string; message?: string } {
  const stored = otpStorage.get(identifier);
  
  if (!stored) {
    return { success: false, error: 'OTP not found' };
  }
  
  if (stored.verified) {
    return { success: false, error: 'OTP already used' };
  }
  
  if (new Date() > stored.expiresAt) {
    otpStorage.delete(identifier);
    return { success: false, error: 'OTP expired' };
  }
  
  if (stored.otp !== inputOtp) {
    return { success: false, error: 'Invalid OTP' };
  }
  
  stored.verified = true;
  otpStorage.set(identifier, stored);
  
  return { success: true, message: 'OTP verified successfully' };
}

export function cleanupExpiredOTPs(): void {
  const now = new Date();
  for (const [identifier, data] of otpStorage.entries()) {
    if (now > data.expiresAt) {
      otpStorage.delete(identifier);
    }
  }
}