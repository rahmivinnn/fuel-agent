import { useEffect } from 'react';
import { setupForegroundNotifications, registerFCMToken } from '@/lib/firebase-messaging';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { data: authData } = useAuth();
  const { toast } = useToast();
  const driverId = authData?.fuelFriend?.id;

  useEffect(() => {
    if (!driverId) return;

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
  }, [driverId, toast]);
}

export default useNotifications;