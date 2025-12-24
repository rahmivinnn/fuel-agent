import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';
import { whatsappService } from '../services/whatsapp';
import { storage } from '../services/storage';
import { sendOrderNotificationToDrivers } from '../services/pushNotifications';

export const restartWhatsApp = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Restarting WhatsApp service...');
    await whatsappService.initialize();
    return sendSuccess(res, { 
      message: 'WhatsApp service restarted - check terminal for QR code' 
    }, RESPONSE_CODES.SUCCESS);
  } catch (error: any) {
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, error.message);
  }
};

export const addResendContact = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName } = req.body;
    if (!email) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Email required');
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return sendSuccess(res, { error: 'Resend not configured' }, RESPONSE_CODES.SUCCESS);
    }

    const response = await fetch('https://api.resend.com/audiences/78261da4-41a8-4ef8-8c49-c57536b363de/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, first_name: firstName, last_name: lastName })
    });

    const data = await response.json();
    return sendSuccess(res, { data }, RESPONSE_CODES.SUCCESS);
  } catch (err: any) {
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, err.message);
  }
};

export const createTestOrder = async (req: Request, res: Response) => {
  try {
    const order = await storage.createOrder({
      trackingNumber: `TEST${Date.now()}`,
      customerId: 'cust1',
      deliveryAddress: 'Test Address',
      deliveryPhone: '+1234567890',
      fuelType: 'Premium',
      fuelQuantity: '10.00',
      totalAmount: '50.00',
      deliveryFee: '5.00',
      orderType: 'instant',
      status: 'pending'
    });
    
    return sendSuccess(res, { 
      order, 
      message: 'Test order created - notification will be sent automatically' 
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to create test order');
  }
};