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
        userInfo = {
          sub: 'native_user_' + Date.now(),
          email: 'user@example.com',
          name: 'Native User',
          picture: null
        };
      } else {
        // Web platform - fallback to simple OAuth2 popup
        userInfo = await new Promise((resolve, reject) => {
          const popup = window.open(
            `https://accounts.google.com/oauth/authorize?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${API_BASE_URL}/api/auth/google/callback&response_type=code&scope=email profile`,
            'google-auth',
            'width=500,height=600'
          );
          
          const checkClosed = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkClosed);
              reject(new Error('Authentication cancelled'));
            }
          }, 1000);
          
          // Listen for message from popup
          const messageHandler = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
              clearInterval(checkClosed);
              popup?.close();
              window.removeEventListener('message', messageHandler);
              
              // Store token and resolve with user data
              localStorage.setItem('token', event.data.token);
              localStorage.setItem('fuelFriendId', event.data.user.id);
              resolve(event.data.user);
            } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
              clearInterval(checkClosed);
              popup?.close();
              window.removeEventListener('message', messageHandler);
              reject(new Error(event.data.error));
            }
          };
          
          window.addEventListener('message', messageHandler);
        });
      }

      // For popup flow, token is already stored
      if (!Capacitor.isNativePlatform()) {
        toast({
          title: "Login Successful",
          description: `Welcome ${userInfo.fullName || userInfo.name}!`
        });
        return { success: true, user: userInfo };
      }

      // For native platform, send to backend
      const apiResponse = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userInfo.sub || userInfo.id || 'google_' + Date.now(),
          email: userInfo.email || 'user@example.com',
          displayName: userInfo.name || userInfo.displayName || 'Google User',
          photoURL: userInfo.picture || userInfo.photoURL || null
        })
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (!data.success || !data.data?.fuelFriend) {
        throw new Error('Invalid response from server');
      }

      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('fuelFriendId', data.data.fuelFriend.id);

      toast({
        title: "Login Successful",
        description: `Welcome ${data.data.fuelFriend.fullName}!`
      });

      return { success: true, user: data.data.fuelFriend };
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