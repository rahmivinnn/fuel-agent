import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, RESPONSE_CODES.UNAUTHORIZED, 401, 'Access token required');
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, RESPONSE_CODES.UNAUTHORIZED, 401, 'Invalid token');
  }
};