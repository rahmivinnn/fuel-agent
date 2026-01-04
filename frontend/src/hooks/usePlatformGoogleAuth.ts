import { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

export const usePlatformGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (!auth || !googleProvider) {
        throw new Error('Firebase not initialized');
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Send user data to backend
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store token for API requests
      localStorage.setItem('token', data.data.token);
      
      toast({
        title: "Login Successful",
        description: `Welcome ${data.data.fuelFriend.fullName}!`
      });

      return { success: true, user: data.data.fuelFriend };
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

  const signOutGoogle = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
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
    loading
  };
};