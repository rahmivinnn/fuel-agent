import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePlatformGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Temporary disable Google Auth to fix build error
      toast({
        title: "Google Sign-In",
        description: "Google authentication temporarily disabled",
        variant: "destructive"
      });
      return { success: false, error: "Temporarily disabled" };
    } finally {
      setLoading(false);
    }
  };

  const signOutGoogle = async () => {
    return { success: true };
  };

  return {
    signInWithGoogle,
    signOutGoogle,
    loading
  };
};