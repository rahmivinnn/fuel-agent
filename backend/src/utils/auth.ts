import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  userType?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (payload: Omit<JWTPayload, 'role'> & { userType?: string }): string => {
  console.log('🔑 Generating token with payload:', payload);
  console.log('🔐 JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
  const token = jwt.sign({ ...payload, role: payload.userType || 'user' }, JWT_SECRET, { expiresIn: '24h' });
  console.log('✅ Token generated:', token.substring(0, 50) + '...');
  return token;
};

export const verifyToken = (token: string): JWTPayload => {
  console.log('🔍 Verifying token:', token.substring(0, 50) + '...');
  console.log('🔐 JWT_SECRET for verification:', JWT_SECRET ? 'Set' : 'Not set');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log('✅ Token verified, payload:', decoded);
    return decoded;
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    throw error;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};