// Backend endpoint: /api/auth/google
// Add this to your backend routes

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required'
      });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.FRONTEND_URL}/auth/google/callback`
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    const googleUser = await userResponse.json();

    // Check if user exists in database
    let fuelFriend = await db.query(
      'SELECT * FROM fuel_friends WHERE email = $1',
      [googleUser.email]
    );

    if (fuelFriend.rows.length === 0) {
      // Create new fuel friend
      const newFuelFriend = await db.query(`
        INSERT INTO fuel_friends (
          id, full_name, email, profile_photo, is_email_verified, 
          location, delivery_fee, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `, [
        generateUUID(),
        googleUser.name,
        googleUser.email,
        googleUser.picture,
        true, // Email verified via Google
        'Jakarta', // Default location
        5000 // Default delivery fee
      ]);
      
      fuelFriend = newFuelFriend;
    }

    const user = fuelFriend.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: 'user'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          profilePhoto: user.profile_photo,
          isEmailVerified: user.is_email_verified
        }
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Google authentication failed'
    });
  }
};

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}