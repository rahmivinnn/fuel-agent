import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';

export const createVeriffSession = async (req: Request, res: Response) => {
  try {
    const { fuelFriendId } = req.body;

    // Call Veriff API to create session
    const veriffResponse = await fetch('https://stationapi.veriff.com/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-CLIENT': process.env.VERIFF_API_KEY || 'your-veriff-api-key'
      },
      body: JSON.stringify({
        verification: {
          callback: `${process.env.BASE_URL}/api/veriff/webhook`,
          person: {
            firstName: 'Driver',
            lastName: 'User'
          },
          vendorData: fuelFriendId
        }
      })
    });

    const veriffData = await veriffResponse.json();

    if (!veriffResponse.ok) {
      throw new Error(veriffData.message || 'Failed to create Veriff session');
    }

    return sendSuccess(res, {
      sessionId: veriffData.verification.id,
      sessionUrl: veriffData.verification.url
    }, RESPONSE_CODES.SUCCESS);

  } catch (error) {
    console.error('Create Veriff session error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to create verification session');
  }
};