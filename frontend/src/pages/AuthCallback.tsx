import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { usePlatformGoogleAuth } from '@/hooks/usePlatformGoogleAuth';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { processAuthCode } = usePlatformGoogleAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        setLocation('/login');
        return;
      }

      if (code) {
        try {
          const result = await processAuthCode(code);
          if (result.success) {
            setLocation('/dashboard');
          } else {
            setLocation('/login');
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          setLocation('/login');
        }
      } else {
        setLocation('/login');
      }
    };

    handleCallback();
  }, [processAuthCode, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3AC36C] mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}