import { useEffect } from 'react';
import { setupForegroundNotifications, registerFCMToken } from '@/lib/firebase-messaging';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { user: authData } = useAuthContext();
  const { toast } = useToast();
  const driverId = authData?.fuelFriend?.id;

  useEffect(() => {
    if (!driverId) return;

    // Skip FCM registration if VAPID key not available
    if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) {
      console.log('FCM disabled - no VAPID key');
      return;
    }

    try {
      // Register FCM token
      registerFCMToken(driverId);

      // Setup foreground notifications
      setupForegroundNotifications((payload) => {
        // Show toast notification
        toast({
          title: payload.notification?.title || 'New Notification',
          description: payload.notification?.body,
          duration: 5000
        });

        // Refresh data if it's a new order
        if (payload.data?.type === 'new_order') {
          window.location.reload();
        }
      });
    } catch (error) {
      console.log('FCM setup failed:', error);
    }
  }, [driverId, toast]);
}

export default useNotifications;