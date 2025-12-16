import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { OrderCard } from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useOrders, useAcceptOrder, useCancelOrder } from "@/hooks/useOrders";
import { useDriver } from "@/hooks/useDriver";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { Order } from "@shared/schema";
import { MobileContainer } from "@/components/MobileContainer";

// Mock completed order data for demonstration
const mockCompletedOrder: Order = {
  id: "completed-order-1",
  trackingNumber: "FF7890",
  customerId: "cust1",
  stationId: "station1",
  fuelFriendId: "ff1",
  vehicleId: "veh1",
  deliveryAddress: "456 Completed St, Nashville, TN",
  deliveryPhone: "+1 615-555-0199",
  fuelType: "Premium",
  fuelQuantity: "15.00",
  fuelCost: "25.00",
  deliveryFee: "5.00",
  groceriesCost: "12.50",
  totalAmount: "42.50",
  orderType: "instant",
  scheduledDate: null,
  scheduledTime: null,
  estimatedDeliveryTime: "Completed",
  status: "completed",
  paymentStatus: "completed",
  paymentMethod: "credit_card",
  createdAt: new Date(Date.now() - 3600000), // 1 hour ago
  updatedAt: new Date(Date.now() - 1800000), // 30 minutes ago
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { position, error, loading } = useGeolocation();
  const [city, setCity] = useState<string>("");
  const [useFallbackLocation, setUseFallbackLocation] = useState<boolean>(false);
  const [showCompletedOrder, setShowCompletedOrder] = useState<boolean>(true);

  // Persist Google OAuth callback params into localStorage if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const driverIdParam = params.get("driverId");
    const emailParam = params.get("email");
    if (driverIdParam && emailParam) {
      localStorage.setItem("driverId", driverIdParam);
      localStorage.setItem("driverEmail", emailParam);
      // Clean up query params from URL
      window.history.replaceState(null, "", "/dashboard");
    }
  }, []);

  // Get city name based on geolocation or fallback
  useEffect(() => {
    if (useFallbackLocation) {
      // Use a default location when geolocation fails (likely due to VPN)
      setCity("Global"); // Show all orders when location is unavailable
      return;
    }

    if (position) {
      // Simple reverse geocoding - in a real app, you would use a proper reverse geocoding service
      const lat = position.latitude;
      const lng = position.longitude;
      
      // Determine city based on coordinates
      if (lat > 51 && lat < 52 && lng > -1 && lng < 1) {
        setCity("London");
      } else if (lat > 40 && lat < 41 && lng > -75 && lng < -73) {
        setCity("New York");
      } else if (lat > 36 && lat < 37 && lng > -87 && lng < -86) {
        setCity("Nashville");
      } else {
        // Format coordinates to show as city name
        setCity(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } else if (error) {
      // When there's an error (common with VPN), offer fallback
      setCity("Location Unavailable");
    }
  }, [position, error, useFallbackLocation]);

  // Show notification about VPN issues
  useEffect(() => {
    if (error && error.message.includes("VPN") && !useFallbackLocation) {
      toast({
        title: "VPN Detected",
        description: "We detected you're using a VPN which may affect location accuracy. Showing all nearby orders.",
        duration: 8000,
      });
      // Automatically enable fallback after notification
      const timer = setTimeout(() => {
        setUseFallbackLocation(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, toast, useFallbackLocation]);

  // Show welcome notification with completed order
  useEffect(() => {
    toast({
      title: "Welcome Back!",
      description: "You've completed 1 order today. Ready for more deliveries?",
      duration: 5000,
    });
  }, [toast]);

  // Simulate incoming order notification based on real location
  useEffect(() => {
    if (!city) return;
    
    const timer = setInterval(() => {
      // 20% chance to trigger notification every 15 seconds
      if (Math.random() > 0.8) {
        const locationText = useFallbackLocation ? "your area" : city;
        toast({
          title: "New Order Request",
          description: `New delivery request available in ${locationText}!`,
          duration: 5000,
        });
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [city, toast, useFallbackLocation]);

  const driverId = localStorage.getItem("driverId") || "ff1";

  const { data: driver, isLoading: isLoadingDriver } = useDriver(driverId);
  const { data: pendingOrders = [], isLoading: isLoadingPending } = useOrders("pending");
  const { data: activeOrders = [], isLoading: isLoadingActive } = useOrders("active", driverId);

  const acceptOrderMutation = useAcceptOrder();
  const cancelOrderMutation = useCancelOrder();

  // Filter orders based on real location or show all if using fallback
  const filteredPendingOrders = pendingOrders.filter((order: Order) => {
    if (useFallbackLocation) return true; // Show all orders when using fallback
    if (!position || !city) return true;
    
    // Filter based on the determined city
    if (city === "London") return order.deliveryAddress.includes("UK") || order.deliveryAddress.includes("London");
    if (city === "New York") return order.deliveryAddress.includes("USA") || order.deliveryAddress.includes("NY");
    if (city === "Nashville") return order.deliveryAddress.includes("Tennessee") || order.deliveryAddress.includes("Nashville");
    
    return true;
  });

  const filteredActiveOrders = activeOrders.filter((order: Order) => {
    if (useFallbackLocation) return true; // Show all orders when using fallback
    if (!position || !city) return true;
    
    // Filter based on the determined city
    if (city === "London") return order.deliveryAddress.includes("UK") || order.deliveryAddress.includes("London");
    if (city === "New York") return order.deliveryAddress.includes("USA") || order.deliveryAddress.includes("NY");
    if (city === "Nashville") return order.deliveryAddress.includes("Tennessee") || order.deliveryAddress.includes("Nashville");
    
    return true;
  });

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptOrderMutation.mutateAsync({ orderId, driverId });
      toast({
        title: "Order Accepted!",
        description: "You have accepted the order",
      });
      // Navigate to My Orders page with the accepted order ID
      setLocation(`/my-orders?accepted=${orderId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrderMutation.mutateAsync(orderId);
      toast({
        title: "Order Cancelled",
        description: "You have cancelled the order request",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  const handleCall = (orderId: string) => {
    toast({
      title: "Calling customer...",
    });
  };

  const handleMessage = (orderId: string) => {
    toast({
      title: "Opening messages...",
    });
  };

  const handleTrack = (orderId: string) => {
    setLocation(`/track-customer/${orderId}`);
  };

  const handleUseFallback = () => {
    setUseFallbackLocation(true);
    toast({
      title: "Location Fallback Enabled",
      description: "Showing orders from all areas. You can change this in settings.",
    });
  };

  const hideCompletedOrder = () => {
    setShowCompletedOrder(false);
  };

  return (
    <div className="min-h-screen bg-background mobile-safe-area">
      <MobileContainer className="py-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Hello!</h2>
              {isLoadingDriver ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <h1 className="text-2xl font-bold text-foreground">{driver?.fullName || "Driver"}</h1>
              )}
              <div className="flex items-center gap-2">
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : error ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Location: Error - {error.message}</p>
                    {!useFallbackLocation && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={handleUseFallback}
                      >
                        Show All
                      </Button>
                    )}
                  </div>
                ) : position ? (
                  <p className="text-sm text-muted-foreground">Location: {city}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Getting location...</p>
                )}
              </div>
            </div>
          </div>

          {/* Recently Completed Order */}
          {showCompletedOrder && (
            <div className="space-y-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Recently Completed</h3>
                  <p className="text-sm text-green-700">Order #{mockCompletedOrder.trackingNumber}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-green-800"
                  onClick={hideCompletedOrder}
                >
                  ×
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-800">${mockCompletedOrder.totalAmount}</p>
                  <p className="text-xs text-green-700">{mockCompletedOrder.deliveryAddress.split(',')[0]}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-green-800 border-green-300 hover:bg-green-100"
                  onClick={() => handleTrack(mockCompletedOrder.id)}
                >
                  View Details
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Order Requests</h3>
              <Button
                variant="ghost"
                className="text-primary p-0 h-auto"
                onClick={() => setLocation("/orders")}
                data-testid="link-see-all-requests"
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
              ) : filteredPendingOrders.length > 0 ? (
                filteredPendingOrders.slice(0, 2).map((order: Order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onAccept={handleAcceptOrder}
                    onCancel={handleCancelOrder}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No requests in your area
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Current orders</h3>
              <Button
                variant="ghost"
                className="text-primary p-0 h-auto"
                onClick={() => setLocation("/orders")}
                data-testid="link-see-all-current"
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
              ) : filteredActiveOrders.length > 0 ? (
                filteredActiveOrders.slice(0, 2).map((order: Order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onCall={handleCall}
                    onMessage={handleMessage}
                    onTrack={handleTrack}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active orders in your area
                </p>
              )}
            </div>
          </div>
        </div>
      </MobileContainer>

      <BottomNav />
    </div>
  );
}