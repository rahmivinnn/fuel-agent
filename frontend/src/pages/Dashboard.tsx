import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { OrderCard } from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MobileContainer } from "@/components/MobileContainer";
import { RefreshCw, Bell, DollarSign, TrendingUp, Package, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useOrders, useAcceptOrder, useCancelOrder } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user from token
  const { data: authData, isLoading: isLoadingAuth } = useAuth();
  const currentUser = authData?.fuelFriend;
  const fuelFriendId = currentUser?.id;
  
  console.log('🔍 Dashboard Debug:', {
    authData,
    currentUser,
    fuelFriendId,
    isLoadingAuth
  });
  
  // Clean up old localStorage keys on first load
  useEffect(() => {
    const cleanupOldStorage = () => {
      const oldKeys = ['customerEmail', 'customerId', 'customerName', 'driverId', 'jwt_token'];
      let hasOldKeys = false;
      
      oldKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          hasOldKeys = true;
        }
      });
      
      if (hasOldKeys) {
        console.log('Cleaned up old localStorage keys');
      }
    };
    
    cleanupOldStorage();
  }, []);
  
  // Get user data from API (not localStorage)
  const driverName = currentUser?.fullName || "FuelFriend";
  
  // Use real API hooks with dynamic fuelFriendId
  const { data: pendingOrders = [], isLoading: isLoadingPending, refetch: refetchPending } = useOrders("pending", fuelFriendId);
  const { data: activeOrders = [], isLoading: isLoadingActive, refetch: refetchActive } = useOrders("active", fuelFriendId);
  
  console.log('📊 Orders Debug:', {
    fuelFriendId,
    pendingOrders: pendingOrders?.length || 0,
    activeOrders: activeOrders?.length || 0,
    isLoadingPending,
    isLoadingActive
  });
  
  const acceptOrderMutation = useAcceptOrder();
  const cancelOrderMutation = useCancelOrder();

  useEffect(() => {
    // Debug log API data
    console.log('Dashboard API Data:', {
      currentUser,
      fuelFriendId,
      pendingOrders,
      activeOrders,
      isLoadingPending,
      isLoadingActive
    });
  }, [currentUser, fuelFriendId, pendingOrders, activeOrders]);

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["fuel-friends"] });
      await refetchPending?.();
      await refetchActive?.();
      toast({ title: "Data refreshed!", duration: 2000 });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({ title: "Refresh failed", variant: "destructive", duration: 2000 });
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptOrderMutation.mutateAsync({ orderId, fuelFriendId });
      toast({ title: "Order Accepted!", description: "You have accepted the order" });
      setLocation(`/track-customer/${orderId}`);
    } catch (error) {
      console.error('Accept order error:', error);
      toast({ title: "Error", description: "Failed to accept order", variant: "destructive" });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrderMutation.mutateAsync(orderId);
      toast({ title: "Order Cancelled", description: "You have cancelled the order request" });
    } catch (error) {
      console.error('Cancel order error:', error);
      toast({ title: "Error", description: "Failed to cancel order", variant: "destructive" });
    }
  };

  return (
    <AuthGuard requireAuth={true}>
    <div className="min-h-screen bg-white pb-20 overscroll-none">
      <MobileContainer>
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLocation("/my-profile")}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-green-500 transition-all cursor-pointer"
            >
              {currentUser?.profilePhoto && currentUser?.isIdentityVerified ? (
                <img 
                  src={currentUser.profilePhoto} 
                  alt={currentUser.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center ${currentUser?.profilePhoto && currentUser?.isIdentityVerified ? 'hidden' : ''}`}>
                <span className="text-xl font-bold text-white">
                  {(currentUser?.fullName || driverName).charAt(0).toUpperCase()}
                </span>
              </div>
            </button>
            <div>
              <p className="text-sm text-gray-600">Hello!</p>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentUser?.fullName || driverName}
              </h1>
            </div>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/notifications")}
              className="text-gray-600 hover:text-green-600 relative"
            >
              <Bell className="w-6 h-6" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">3</span>
              </div>
            </Button>
          </div>
        </div>

        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Order Requests</h3>
            <Button
              variant="ghost"
              className="text-green-600 p-0 h-auto"
              onClick={() => setLocation("/my-orders?tab=new")}
            >
              See all
            </Button>
          </div>

          {isLoadingPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="space-y-2 mb-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : pendingOrders.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {pendingOrders.map((order: any) => (
                <div key={order.id} className="flex-shrink-0">
                  <OrderCard
                    order={order}
                    onAccept={handleAcceptOrder}
                    onCancel={handleCancelOrder}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="space-y-2 mb-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Current orders</h3>
            <Button
              variant="ghost"
              className="text-green-600 p-0 h-auto hover:text-green-700"
              onClick={() => setLocation("/my-orders?tab=active")}
            >
              See all
            </Button>
          </div>

          {isLoadingActive ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="space-y-2 mb-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeOrders.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {activeOrders.map((order: any) => (
                <div key={order.id} className="flex-shrink-0">
                  <OrderCard
                    order={order}
                    onTrack={(orderId) => setLocation(`/track-customer/${orderId}`)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="space-y-2 mb-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </MobileContainer>
      <BottomNav />
    </div>
    </AuthGuard>
  );
}