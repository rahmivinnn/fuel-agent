import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiClient } from '@/lib/api';

export default function GoogleCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          // Send error to parent window
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error
          }, window.location.origin);
          window.close();
          return;
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Send code to backend for token exchange
        const response = await apiClient.fetch('/api/auth/google', {
          method: 'POST',
          body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (data.success) {
          // Send success to parent window
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            token: data.data.token,
            user: data.data.user
          }, window.location.origin);
        } else {
          throw new Error(data.error || 'Authentication failed');
        }

        window.close();
      } catch (error) {
        console.error('Google callback error:', error);
        // Send error to parent window
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error instanceof Error ? error.message : 'Authentication failed'
        }, window.location.origin);
        window.close();
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}