import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';
import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export const useCapacitorGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const initializeGoogleAuth = () => {
    return new Promise((resolve) => {
      if (Capacitor.isNativePlatform()) {
        // Native platform - use Capacitor plugin when available
        resolve(true);
      } else {
        // Web platform - use Google Identity Services
        if (window.google) {
          resolve(true);
        } else {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => resolve(true);
          document.head.appendChild(script);
        }
      }
    });
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        // Native platform - simulate Google Auth for now
        const userInfo = {
          sub: 'native_user_' + Date.now(),
          email: 'user@example.com',
          name: 'Native User',
          picture: null
        };
        
        // Send to backend for native
        const apiResponse = await fetch(`${API_BASE_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: userInfo.sub,
            email: userInfo.email,
            displayName: userInfo.name,
            photoURL: userInfo.picture
          })
        });

        const data = await apiResponse.json();
        if (data.success) {
          localStorage.setItem('token', data.data.token);
          return { success: true, user: data.data.fuelFriend };
        }
      } else {
        // Web platform - direct redirect to Google OAuth
        window.location.href = `https://accounts.google.com/oauth/authorize?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${API_BASE_URL}/api/auth/google/callback&response_type=code&scope=email profile`;
        return { success: true };
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading
  };
};