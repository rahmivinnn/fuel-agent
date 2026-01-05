import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';
import { useLocation } from 'wouter';

// Firebase imports (only for web)
let signInWithPopup: any, GoogleAuthProvider: any, auth: any;
if (!Capacitor.isNativePlatform()) {
  const firebase = await import('firebase/auth');
  const firebaseConfig = await import('@/lib/firebase');
  signInWithPopup = firebase.signInWithPopup;
  GoogleAuthProvider = firebase.GoogleAuthProvider;
  auth = firebaseConfig.auth;
}

// Cordova Google Plus (only for mobile)
declare global {
  interface Window {
    plugins: {
      googleplus: {
        login: (options: any, success: (user: any) => void, error: (err: any) => void) => void;
        logout: (success: () => void, error: (err: any) => void) => void;
      };
    };
  }
}

export const useHybridGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      let userInfo;

      if (Capacitor.isNativePlatform()) {
        // APK: Use Cordova Google Plus Plugin
        console.log('📱 Using Cordova Google Plus for APK');
        
        if (!window.plugins?.googleplus) {
          throw new Error('Google Plus plugin not available');
        }
        
        userInfo = await new Promise((resolve, reject) => {
          window.plugins.googleplus.login(
            {
              'scopes': 'profile email',
              'webClientId': import.meta.env.VITE_GOOGLE_CLIENT_ID,
              'offline': true
            },
            (user) => {
              console.log('Cordova Google login success:', user);
              resolve({
                uid: user.userId,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.imageUrl
              });
            },
            (error) => {
              console.error('Cordova Google login error:', error);
              reject(new Error(error));
            }
          );
        });
      } else {
        // Web: Use Firebase Auth
        console.log('🌐 Using Firebase Google Auth for Web');
        
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        userInfo = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
      }
      
      // Send user data to backend (same for both platforms)
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInfo)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store token (same for both platforms)
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('fuelFriendId', data.data.fuelFriend.id);

      toast({
        title: "Login Successful",
        description: `Welcome ${data.data.fuelFriend.fullName}!`
      });

      setLocation('/dashboard');
      return { success: true, user: data.data.fuelFriend };
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      toast({
        title: "Login Failed",
        description: error.message || 'Google authentication failed',
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    platform: Capacitor.isNativePlatform() ? 'APK' : 'Web'
  };
};