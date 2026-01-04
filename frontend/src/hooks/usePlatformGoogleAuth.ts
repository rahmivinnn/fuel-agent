import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Google OAuth configuration
const GOOGLE_WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = import.meta.env.VITE_GOOGLE_ANDROID_CLIENT_ID;
// Use current origin for redirect URI
const GOOGLE_REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

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
      // Use appropriate Client ID based on platform
      const clientId = isNative() ? GOOGLE_ANDROID_CLIENT_ID : GOOGLE_WEB_CLIENT_ID;
      
      if (!clientId) {
        toast({
          title: "Google Sign-In",
          description: `Google authentication not configured for ${isNative() ? 'Android' : 'Web'}`,
          variant: "destructive"
        });
        return { success: false, error: "Not configured" };
      }

      if (isNative()) {
        // Native Android - use Capacitor Google Auth plugin
        try {
          // Use string-based import to avoid build-time resolution
          const moduleName = '@codetrix-studio/capacitor-google-auth';
          const googleAuthModule = await import(/* @vite-ignore */ moduleName).catch(() => null);
          if (!googleAuthModule) {
            return { success: false, error: "Google Auth plugin not installed" };
          }
          const result = await googleAuthModule.GoogleAuth.signIn();
          return { 
            success: true, 
            token: result.authentication.idToken,
            user: result 
          };
        } catch (error) {
          return { success: false, error: "Native Google Auth failed" };
        }
      } else {
        // Web - use redirect OAuth flow (instead of popup)
        const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        googleAuthUrl.searchParams.set('client_id', clientId);
        googleAuthUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
        googleAuthUrl.searchParams.set('response_type', 'code');
        googleAuthUrl.searchParams.set('scope', 'openid email profile');
        googleAuthUrl.searchParams.set('access_type', 'offline');
        googleAuthUrl.searchParams.set('prompt', 'select_account');

        console.log('Google Auth URL:', googleAuthUrl.toString());
        console.log('Redirect URI:', GOOGLE_REDIRECT_URI);

        // Use redirect instead of popup to avoid CORS issues
        window.location.href = googleAuthUrl.toString();
        
        return { success: true };
      }

    } catch (error) {
      toast({
        title: "Google Sign-In Error",
        description: error instanceof Error ? error.message : "Failed to initialize Google sign-in",
        variant: "destructive"
      });
      return { success: false, error: "Failed to initialize" };
    } finally {
      setLoading(false);
    }
  };

  const signOutGoogle = async () => {
    if (isNative()) {
      try {
        const moduleName = '@codetrix-studio/capacitor-google-auth';
        const googleAuthModule = await import(/* @vite-ignore */ moduleName).catch(() => null);
        if (googleAuthModule) {
          await googleAuthModule.GoogleAuth.signOut();
        }
      } catch (error) {
        // Ignore signout errors
      }
    }
    return { success: true };
  };

  return {
    signInWithGoogle,
    signOutGoogle,
    loading
  };
};