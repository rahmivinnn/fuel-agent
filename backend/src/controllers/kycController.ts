import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';
import { storage } from '../services/postgres-storage';

export const updateKYCStatus = async (req: Request, res: Response) => {
  try {
    const { fuelFriendId } = req.params;
    const { isIdentityVerified, verificationStatus } = req.body;

    if (!fuelFriendId) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Fuel friend ID is required');
    }

    // Update KYC status in database
    await storage.updateFuelFriend(fuelFriendId, {
      isIdentityVerified: isIdentityVerified,
      verificationStatus: verificationStatus
    });

    return sendSuccess(res, {
      message: 'KYC status updated successfully',
      isIdentityVerified,
      verificationStatus
    }, RESPONSE_CODES.SUCCESS);

  } catch (error) {
    console.error('Update KYC status error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to update KYC status');
  }
};