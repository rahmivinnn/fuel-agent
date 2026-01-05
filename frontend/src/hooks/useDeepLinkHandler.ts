import { useEffect } from 'react';
import { useLocation } from 'wouter';

export const useDeepLinkHandler = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Handle deep link when app opens
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      if (url.includes('fuelfriend://auth/success')) {
        try {
          const urlObj = new URL(url);
          const token = urlObj.searchParams.get('token');
          
          if (token) {
            console.log('Token received from deep link:', token.substring(0, 20) + '...');
            localStorage.setItem('token', token);
            setLocation('/dashboard');
          }
        } catch (error) {
          console.error('Error parsing deep link:', error);
        }
      } else if (url.includes('fuelfriend://login')) {
        const urlObj = new URL(url);
        const error = urlObj.searchParams.get('error');
        console.error('Google auth error:', error);
        setLocation('/login');
      }
    };

    // For Cordova/PhoneGap
    if (window.handleOpenURL) {
      const originalHandler = window.handleOpenURL;
      window.handleOpenURL = (url: string) => {
        handleDeepLink(url);
        if (originalHandler) originalHandler(url);
      };
    } else {
      window.handleOpenURL = handleDeepLink;
    }

    // For Capacitor
    if (window.Capacitor) {
      try {
        // Dynamic import with fallback
        const capacitorApp = (window as any).Capacitor?.Plugins?.App;
        if (capacitorApp && capacitorApp.addListener) {
          capacitorApp.addListener('appUrlOpen', (event: any) => {
            handleDeepLink(event.url);
          });
        }
      } catch (error) {
        console.log('Capacitor App plugin not available:', error);
      }
    }

    return () => {
      // Cleanup
      if (window.handleOpenURL) {
        window.handleOpenURL = undefined;
      }
    };
  }, [setLocation]);
};

// Global type declaration
declare global {
  interface Window {
    handleOpenURL?: (url: string) => void;
    Capacitor?: any;
  }
}