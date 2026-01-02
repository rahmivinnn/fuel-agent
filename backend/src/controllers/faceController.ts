import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';
import { db } from '../db';
import { faceBiometrics, fuelFriends } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { uploadFaceImage } from '../services/cloudinary';

export const saveFaceBiometric = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Saving face biometric with Cloudinary upload');
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

    console.log('✅ Fuel friend found, uploading image to Cloudinary');
    
    // Upload image to Cloudinary
    let faceImageUrl = null;
    if (faceImage) {
      try {
        console.log('📤 Starting Cloudinary upload...');
        faceImageUrl = await uploadFaceImage(faceImage, fuelFriendId);
        console.log('✅ Cloudinary upload successful:', faceImageUrl);
        
        if (!faceImageUrl) {
          console.log('❌ Cloudinary returned null/empty URL');
          throw new Error('Cloudinary upload returned empty URL');
        }
      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
        return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to upload image to Cloudinary');
      }
    } else {
      console.log('⚠️ No face image provided in request');
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Face image is required');
    }
    
    // Save face biometric data
    console.log('💾 Saving to database:', {
      fuelFriendId,
      faceDescriptorLength: JSON.stringify(faceDescriptor).length,
      faceImageUrl,
      confidence
    });
    
    const [biometric] = await db.insert(faceBiometrics).values({
      fuelFriendId,
      faceDescriptor: JSON.stringify(faceDescriptor),
      faceImageUrl: faceImageUrl, // Use correct column name
      confidence: confidence?.toString()
    }).returning();

    console.log('✅ Biometric saved to DB:', {
      id: biometric.id,
      faceImageUrl: biometric.faceImageUrl
    });

    // Update fuel friend verification status and profile photo
    await db.update(fuelFriends)
      .set({ 
        isIdentityVerified: true, 
        verificationStatus: 'verified',
        profilePhoto: faceImageUrl // Set profile photo to Cloudinary URL
      })
      .where(eq(fuelFriends.id, fuelFriendId));

    console.log('✅ Fuel friend verification status and profile photo updated');

    return sendSuccess(res, { 
      biometricId: biometric.id,
      imageUrl: faceImageUrl 
    }, RESPONSE_CODES.CREATED);

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