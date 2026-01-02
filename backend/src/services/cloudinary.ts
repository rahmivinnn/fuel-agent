import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dxbqxchad',
  api_key: '973127639812274',
  api_secret: 'm4EWF_GdkoXq2Xaxejf8IjZq69s'
});

export const uploadFaceImage = async (base64Image: string, fuelFriendId: string): Promise<string> => {
  try {
    console.log('📤 Uploading face image to Cloudinary...');
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'fuel-friend/face-biometrics',
      public_id: `face_${fuelFriendId}_${Date.now()}`,
      resource_type: 'image',
      format: 'jpg',
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto:good' }
      ]
    });

    console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
    
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

export const deleteFaceImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from URL
    const publicId = imageUrl.split('/').pop()?.split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`fuel-friend/face-biometrics/${publicId}`);
      console.log('✅ Image deleted from Cloudinary');
    }
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
  }
};