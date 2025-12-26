import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (payload: Omit<JWTPayload, 'role'>): string => {
  return jwt.sign({ ...payload, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};