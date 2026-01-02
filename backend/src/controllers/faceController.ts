import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';
import { db } from '../db';
import { faceBiometrics, fuelFriends } from '../shared/schema';
import { eq } from 'drizzle-orm';

export const saveFaceBiometric = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Saving face biometric:', req.body);
    const { fuelFriendId, faceDescriptor, faceImage, confidence } = req.body;

    // Validate required fields
    if (!fuelFriendId || !faceDescriptor) {
      console.log('❌ Missing required fields');
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Missing required fields');
    }

    // Check if fuel friend exists
    console.log('🔍 Checking fuel friend exists:', fuelFriendId);
    const fuelFriend = await db.select().from(fuelFriends).where(eq(fuelFriends.id, fuelFriendId)).limit(1);
    if (fuelFriend.length === 0) {
      console.log('❌ Fuel friend not found');
      return sendError(res, RESPONSE_CODES.NOT_FOUND, 404, 'Fuel friend not found');
    }

    console.log('✅ Fuel friend found, saving biometric data');
    
    // Save face biometric data
    const [biometric] = await db.insert(faceBiometrics).values({
      fuelFriendId,
      faceDescriptor: JSON.stringify(faceDescriptor),
      faceImage,
      confidence: confidence?.toString()
    }).returning();

    console.log('✅ Biometric saved:', biometric.id);

    // Update fuel friend verification status
    await db.update(fuelFriends)
      .set({ 
        isIdentityVerified: true, 
        verificationStatus: 'verified' 
      })
      .where(eq(fuelFriends.id, fuelFriendId));

    console.log('✅ Fuel friend verification status updated');

    return sendSuccess(res, { biometricId: biometric.id }, RESPONSE_CODES.CREATED);

  } catch (error) {
    console.error('❌ Save face biometric error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to save face biometric');
  }
};

export const verifyFace = async (req: Request, res: Response) => {
  try {
    const { fuelFriendId, faceDescriptor } = req.body;

    if (!fuelFriendId || !faceDescriptor) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Missing required fields');
    }

    // Get stored biometric data
    const [storedBiometric] = await db.select()
      .from(faceBiometrics)
      .where(eq(faceBiometrics.fuelFriendId, fuelFriendId))
      .limit(1);

    if (!storedBiometric) {
      return sendError(res, RESPONSE_CODES.NOT_FOUND, 404, 'No biometric data found');
    }

    const storedDescriptor = JSON.parse(storedBiometric.faceDescriptor);
    
    // Calculate Euclidean distance between descriptors
    const distance = calculateEuclideanDistance(faceDescriptor, storedDescriptor);
    const threshold = 0.6; // Face-api.js recommended threshold
    const isMatch = distance < threshold;

    return sendSuccess(res, {
      isMatch,
      distance,
      confidence: isMatch ? (1 - distance) : 0
    }, RESPONSE_CODES.SUCCESS);

  } catch (error) {
    console.error('Verify face error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to verify face');
  }
};

function calculateEuclideanDistance(desc1: number[], desc2: number[]): number {
  if (desc1.length !== desc2.length) {
    throw new Error('Descriptors must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  
  return Math.sqrt(sum);
}