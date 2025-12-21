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
      const result = await signInWithPopup(auth, googleProvider);
      const user = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      };
      
      // Send user data to backend
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store user data
      console.log('Storing Google user data:', data.customer);
      localStorage.setItem('customerId', data.customer.id);
      localStorage.setItem('customerEmail', data.customer.email);
      localStorage.setItem('customerName', data.customer.fullName);
      localStorage.setItem('googleUser', JSON.stringify(user));

      toast({
        title: "Login Successful",
        description: `Welcome ${data.customer.fullName}!`
      });

      return { success: true, user: data.customer };
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