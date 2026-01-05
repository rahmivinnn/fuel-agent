import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

declare global {
  interface Window {
    google: any;
  }
}

export const useGoogleOneTap = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCredentialResponse = async (response: any) => {
    setLoading(true);
    try {
      // Decode JWT token from Google
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      // Send to backend
      const apiResponse = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: payload.sub,
          email: payload.email,
          displayName: payload.name,
          photoURL: payload.picture
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

  const initializeOneTap = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      // Show One Tap prompt
      window.google.accounts.id.prompt();
    }
  };

  const renderButton = (elementId: string) => {
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: "outline",
          size: "large",
          width: "100%"
        }
      );
    }
  };

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeOneTap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return {
    loading,
    renderButton,
    initializeOneTap
  };
};