import { useState } from 'react';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
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

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('fuelFriendId', data.fuelFriend.id);
      localStorage.setItem('fuelFriendEmail', data.fuelFriend.email);
      localStorage.setItem('fuelFriendName', data.fuelFriend.fullName);
      localStorage.setItem('googleUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }));

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

  const signOutGoogle = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('googleUser');
      localStorage.removeItem('customerId');
      localStorage.removeItem('customerEmail');
      localStorage.removeItem('customerName');
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