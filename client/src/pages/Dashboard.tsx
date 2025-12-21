import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { OrderCard } from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MobileContainer } from "@/components/MobileContainer";
import { RefreshCw, Bell } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { JobAcceptedModal } from "@/components/JobAcceptedModal";

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
  const [userName, setUserName] = useState("Shah Hussain");
  const [manualPendingOrders, setManualPendingOrders] = useState([]);
  const [manualActiveOrders, setManualActiveOrders] = useState([]);
  const [manualDriver, setManualDriver] = useState({ fullName: "Driver" });
  const [showJobModal, setShowJobModal] = useState(false);
  const [acceptedOrder, setAcceptedOrder] = useState<any>(null);

  const driverId = localStorage.getItem("driverId") || "ff1";

  useEffect(() => {
    // Update userName when component mounts
    const storedName = localStorage.getItem("customerName");
    if (storedName) {
      setUserName(storedName);
    } else if (manualDriver?.fullName) {
      setUserName(manualDriver.fullName);
    }
  }, [manualDriver]);

  useEffect(() => {
    // Force refresh on mount
    setTimeout(() => {
      console.log('Force invalidating queries...');
      queryClient.invalidateQueries();
      queryClient.refetchQueries();
    }, 100);
    
    setIsReady(true);
    toast({
      title: "Welcome Back!",
      description: "Ready for deliveries?",
      duration: 3000,
    });
  }, [toast, queryClient]);

  const { data: driver, isLoading: isLoadingDriver, refetch: refetchDriver } = useDriver(driverId);
  const { data: pendingOrders = [], isLoading: isLoadingPending, refetch: refetchPending } = useOrders("pending");
  const { data: activeOrders = [], isLoading: isLoadingActive, refetch: refetchActive } = useOrders("active", driverId);
  const { position, error, loading } = useGeolocation();

  // Manual data fetching as fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending orders
        const pendingResponse = await fetch(`${API_BASE_URL}/api/orders?status=pending`);
        const pendingData = await pendingResponse.json();
        setManualPendingOrders(pendingData);
        
        // Fetch active orders for driver
        const activeResponse = await fetch(`${API_BASE_URL}/api/orders?status=active&driverId=${driverId}`);
        const activeData = await activeResponse.json();
        setManualActiveOrders(activeData);
        
        // Fetch driver info
        const driverResponse = await fetch(`${API_BASE_URL}/api/fuel-friends/${driverId}`);
        const driverData = await driverResponse.json();
        setManualDriver(driverData.fuelFriend || { fullName: "Driver" });
        
        console.log('Manual data loaded:', { pendingData, activeData, driverData });
      } catch (error) {
        console.error('Manual fetch error:', error);
      }
    };
    fetchData();
  }, [driverId]);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard Debug:', {
      driverId,
      driver: manualDriver,
      pendingOrders: manualPendingOrders,
      activeOrders: manualActiveOrders,
      isLoadingPending: false,
      isLoadingActive: false,
      API_BASE_URL_DIRECT: API_BASE_URL,
      ENV_VAR: import.meta.env.VITE_API_BASE_URL
    });
  }, [driverId, manualDriver, manualPendingOrders, manualActiveOrders]);

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
      const order = manualPendingOrders.find((o: any) => o.id === orderId);
      await acceptOrderMutation.mutateAsync({ orderId, driverId });
      
      setAcceptedOrder(order);
      setShowJobModal(true);
      
      toast({ title: "Order Accepted!", description: "You have accepted the order" });
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
    <div className="min-h-screen bg-white pb-20">
      <MobileContainer className="py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                <img 
                  src="/avatar.png" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%23e5e7eb'/%3E%3Cpath d='M24 12c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6zm0 28c-6.6 0-12-5.4-12-12 0-1.3.2-2.5.6-3.6 2.4 1.8 5.4 2.9 8.7 2.9h5.4c3.3 0 6.3-1.1 8.7-2.9.4 1.1.6 2.3.6 3.6 0 6.6-5.4 12-12 12z' fill='%23fff'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hello!</p>
                <h1 className="text-xl font-semibold text-gray-900">
                  {localStorage.getItem("customerName") || manualDriver?.fullName || "Shah Hussain"}
                </h1>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setLocation("/notifications")}
            >
              <img src="/ring.png" alt="Notifications" className="w-6 h-6" />
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
              ) : manualPendingOrders && manualPendingOrders.length > 0 ? (
                manualPendingOrders.slice(0, 2).map((order: any) => (
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
                  <p className="text-xs text-[#606268] mt-1">Pending orders: {manualPendingOrders?.length || 0}</p>
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
              ) : manualActiveOrders.length > 0 ? (
                manualActiveOrders.slice(0, 2).map((order: any) => (
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

      <JobAcceptedModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        onTrackOrder={() => {
          setShowJobModal(false);
          setLocation(`/track-customer/${acceptedOrder?.id}`);
        }}
        order={{
          stationName: acceptedOrder?.stationId || "Shell Station",
          deliveryAddress: acceptedOrder?.deliveryAddress || "Shell Station- Abc Town",
          fuelType: acceptedOrder?.fuelType || "Fuel delivery"
        }}
      />

      <BottomNav />
    </div>
  );
}