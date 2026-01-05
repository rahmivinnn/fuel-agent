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
      await initializeGoogleAuth();

      let userInfo;

      if (Capacitor.isNativePlatform()) {
        // Native platform - simulate Google Auth for now
        // In real implementation, use actual Capacitor Google Auth plugin
        userInfo = {
          sub: 'native_user_' + Date.now(),
          email: 'user@example.com',
          name: 'Native User',
          picture: null
        };
      } else {
        // Web platform - use Google Identity Services
        const response = await new Promise((resolve, reject) => {
          if (!window.google?.accounts) {
            reject(new Error('Google Identity Services not loaded'));
            return;
          }

          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: (response: any) => {
              if (response.credential) {
                resolve(response);
              } else {
                reject(new Error('No credential received'));
              }
            },
            auto_select: false
          });
          
          // Try One Tap first
          window.google.accounts.id.prompt((notification: any) => {
            if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
              // Fallback to OAuth2 popup
              try {
                window.google.accounts.oauth2.initTokenClient({
                  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                  scope: 'email profile',
                  callback: async (tokenResponse: any) => {
                    try {
                      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`);
                      const userInfo = await userResponse.json();
                      resolve(userInfo);
                    } catch (error) {
                      reject(error);
                    }
                  }
                }).requestAccessToken();
              } catch (error) {
                reject(error);
              }
            }
          });
        });

        if ((response as any).credential) {
          // JWT credential from One Tap
          const credential = (response as any).credential;
          userInfo = JSON.parse(atob(credential.split('.')[1]));
        } else {
          // User info from OAuth2
          userInfo = response as any;
        }
      }

      // Send to backend
      const apiResponse = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userInfo.sub || userInfo.id,
          email: userInfo.email,
          displayName: userInfo.name,
          photoURL: userInfo.picture
        })
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('fuelFriendId', data.fuelFriend.id);

      toast({
        title: "Login Successful",
        description: `Welcome ${data.fuelFriend.fullName}!`
      });

      return { success: true, user: data.fuelFriend };
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