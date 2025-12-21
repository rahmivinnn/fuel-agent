import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { OrderCard } from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MobileContainer } from "@/components/MobileContainer";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Safe hook imports with fallbacks
let useOrders: any, useAcceptOrder: any, useCancelOrder: any, useDriver: any, useGeolocation: any;
try {
  const ordersHook = require("@/hooks/useOrders");
  useOrders = ordersHook.useOrders || (() => ({ data: [], isLoading: false }));
  useAcceptOrder = ordersHook.useAcceptOrder || (() => ({ mutateAsync: async () => {} }));
  useCancelOrder = ordersHook.useCancelOrder || (() => ({ mutateAsync: async () => {} }));
} catch {
  useOrders = () => ({ data: [], isLoading: false });
  useAcceptOrder = () => ({ mutateAsync: async () => {} });
  useCancelOrder = () => ({ mutateAsync: async () => {} });
}

try {
  const driverHook = require("@/hooks/useDriver");
  useDriver = driverHook.useDriver || (() => ({ data: { fullName: "Driver" }, isLoading: false }));
} catch {
  useDriver = () => ({ data: { fullName: "Driver" }, isLoading: false });
}

try {
  const geoHook = require("@/hooks/useGeolocation");
  useGeolocation = geoHook.useGeolocation || (() => ({ position: null, error: null, loading: false }));
} catch {
  useGeolocation = () => ({ position: null, error: null, loading: false });
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [city, setCity] = useState<string>("Global");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    // Force refresh data on mount
    setTimeout(() => {
      queryClient.invalidateQueries();
    }, 100);
    toast({
      title: "Welcome Back!",
      description: "Ready for deliveries?",
      duration: 3000,
    });
  }, [toast, queryClient]);

  const driverId = localStorage.getItem("driverId") || "ff1";
  
  const { data: driver, isLoading: isLoadingDriver, refetch: refetchDriver } = useDriver(driverId);
  const { data: pendingOrders = [], isLoading: isLoadingPending, refetch: refetchPending } = useOrders("pending");
  const { data: activeOrders = [], isLoading: isLoadingActive, refetch: refetchActive } = useOrders("active", driverId);
  const { position, error, loading } = useGeolocation();

  // Debug logging
  useEffect(() => {
    console.log('Dashboard Debug:', {
      driverId,
      driver,
      pendingOrders,
      activeOrders,
      isLoadingPending,
      isLoadingActive,
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'not set'
    });
  }, [driverId, driver, pendingOrders, activeOrders, isLoadingPending, isLoadingActive]);

  const handleRefresh = async () => {
    try {
      console.log('Refreshing data...');
      await queryClient.invalidateQueries();
      if (refetchDriver) await refetchDriver();
      if (refetchPending) await refetchPending();
      if (refetchActive) await refetchActive();
      toast({ title: "Data refreshed!", duration: 2000 });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({ title: "Refresh failed", variant: "destructive", duration: 2000 });
    }
  };

  const acceptOrderMutation = useAcceptOrder();
  const cancelOrderMutation = useCancelOrder();

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptOrderMutation.mutateAsync({ orderId, driverId });
      toast({ title: "Order Accepted!", description: "You have accepted the order" });
      setLocation(`/my-orders?accepted=${orderId}`);
    } catch (error) {
      toast({ title: "Error", description: "Failed to accept order", variant: "destructive" });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrderMutation.mutateAsync(orderId);
      toast({ title: "Order Cancelled", description: "You have cancelled the order request" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel order", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MobileContainer className="py-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#3F4249] font-['Poppins']">Hello!</h2>
              {isLoadingDriver ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <h1 className="text-2xl font-bold text-[#3F4249] font-['Poppins']">{driver?.fullName || "Driver"}</h1>
              )}
              <div className="flex items-center gap-2">
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <p className="text-sm text-[#606268] font-['Poppins']">Location: {city}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="text-[#3AC36C]"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#3F4249] font-['Poppins']">Order Requests</h3>
              <Button
                variant="ghost"
                className="text-[#3AC36C] p-0 h-auto font-['Poppins']"
                onClick={() => setLocation("/orders")}
              >
                See all
              </Button>
            </div>

            <div className="space-y-3">
              {isLoadingPending ? (
                <>
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-40 w-full rounded-xl" />
                </>
              ) : pendingOrders && pendingOrders.length > 0 ? (
                pendingOrders.slice(0, 2).map((order: any) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onAccept={handleAcceptOrder}
                    onCancel={handleCancelOrder}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-[#606268] font-['Poppins']">No requests available</p>
                  <p className="text-xs text-[#606268] mt-1">Pending orders: {pendingOrders?.length || 0}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRefresh}
                    className="mt-2 text-[#3AC36C]"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#3F4249] font-['Poppins']">Current orders</h3>
              <Button
                variant="ghost"
                className="text-[#3AC36C] p-0 h-auto font-['Poppins']"
                onClick={() => setLocation("/orders")}
              >
                See all
              </Button>
            </div>

            <div className="space-y-3">
              {isLoadingActive ? (
                <>
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-40 w-full rounded-xl" />
                </>
              ) : activeOrders.length > 0 ? (
                activeOrders.slice(0, 2).map((order: any) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onCall={() => toast({ title: "Calling customer..." })}
                    onMessage={() => toast({ title: "Opening messages..." })}
                    onTrack={(orderId) => setLocation(`/track-customer/${orderId}`)}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-[#606268] font-['Poppins']">No active orders</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRefresh}
                    className="mt-2 text-[#3AC36C]"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </MobileContainer>

      <BottomNav />
    </div>
  );
}