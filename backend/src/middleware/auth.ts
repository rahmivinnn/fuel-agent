import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('🔐 authenticateToken middleware called');
  console.log('📡 Request URL:', req.method, req.url);
  
  const authHeader = req.headers['authorization'];
  console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing');
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('🎫 Token extracted:', token ? 'Yes' : 'No');

  if (!token) {
    console.log('❌ No token provided');
    return sendError(res, RESPONSE_CODES.UNAUTHORIZED, 401, 'Access token required');
  }

  try {
    const user = verifyToken(token);
    console.log('✅ Token verified, user:', user);
    req.user = user;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error);
    return sendError(res, RESPONSE_CODES.UNAUTHORIZED, 401, 'Invalid token');
  }
};