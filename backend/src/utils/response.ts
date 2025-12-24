import { Response } from 'express';

export const sendSuccess = (
  res: Response, 
  data: any = null, 
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const sendError = (
  res: Response,
  message: string = 'Error',
  statusCode: number = 400,
  error?: string
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || message,
    timestamp: new Date().toISOString()
  });
};

export const sendValidationError = (
  res: Response,
  errors: any,
  statusCode: number = 400
) => {
  return res.status(statusCode).json({
    success: false,
    message: 'Validation failed',
    errors,
    timestamp: new Date().toISOString()
  });
};