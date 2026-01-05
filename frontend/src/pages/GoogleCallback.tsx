import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function GoogleCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error
        }, window.location.origin);
        window.close();
      } else {
        setLocation('/login?error=' + error);
      }
      return;
    }

    if (code) {
      // Exchange code for user info via backend
      fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Send success to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              user: data.data.fuelFriend,
              token: data.data.token
            }, window.location.origin);
            window.close();
          } else {
            localStorage.setItem('token', data.data.token);
            setLocation('/dashboard');
          }
        } else {
          throw new Error(data.error);
        }
      })
      .catch(error => {
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error.message
          }, window.location.origin);
          window.close();
        } else {
          setLocation('/login?error=' + error.message);
        }
      });
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}