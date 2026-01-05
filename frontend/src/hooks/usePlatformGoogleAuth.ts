import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

// Check if running in Capacitor (native app)
const isNative = () => {
  return window.Capacitor?.isNativePlatform?.() || false;
};

export const usePlatformGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Use backend domain for all platforms
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = 'https://api.kelolahrd.life/api/auth/google/callback';
      
      const isAPK = window.location.protocol === 'file:' || window.location.hostname === 'localhost';
      console.log('Environment:', isAPK ? 'APK' : 'Web');
      console.log('Client ID:', clientId);
      console.log('Redirect URI:', redirectUri);
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `access_type=offline&` +
        `prompt=select_account`;

      console.log('Google Auth URL:', googleAuthUrl);
      console.log('Redirect URI:', redirectUri);

      window.location.href = googleAuthUrl;
      return { success: true };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Login Failed",
        description: error.message || 'Google sign-in failed',
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const processAuthCode = async (code: string) => {
    try {
      // Send auth code to backend for token exchange
      const response = await fetch(`${API_BASE_URL}/api/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store token
      localStorage.setItem('token', data.data.token);
      
      toast({
        title: "Login Successful",
        description: `Welcome ${data.data.fuelFriend.fullName}!`
      });

      return { success: true, user: data.data.fuelFriend };
    } catch (error: any) {
      throw error;
    }
  };

  const signOutGoogle = async () => {
    try {
      localStorage.removeItem('token');
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully"
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    signInWithGoogle,
    signOutGoogle,
    processAuthCode,
    loading
  };
};