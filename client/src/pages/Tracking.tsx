import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, MapPin, Clock, Navigation, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useOrders } from "@/hooks/useOrders";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function MyOrders() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const customerId = localStorage.getItem("customerId") || "cust1";
  const { data: orders = [], isLoading } = useOrders(undefined, customerId, "customer");
  const { position, error } = useGeolocation();
  const [cancelledOrders, setCancelledOrders] = useState<Set<string>>(new Set());
  const [acceptedOrderId, setAcceptedOrderId] = useState<string | null>(null);

  // Check if there's a newly accepted order
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const acceptedId = params.get('accepted');
    if (acceptedId) {
      setAcceptedOrderId(acceptedId);
      // Clear the query param
      window.history.replaceState(null, '', '/my-orders');
      
      // Scroll to the accepted order after a short delay to ensure DOM is updated
      setTimeout(() => {
        const element = document.getElementById('accepted-order');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get fuel station details for an order
  const getStationDetails = (order: any) => {
    // In a real implementation, station details would come from the API
    // For now, we'll use the data that's available in the order object
    if (order.stationId && order.deliveryAddress) {
      return {
        name: order.stationId, // In a real app, this would be fetched from a stations API
        address: order.deliveryAddress
      };
    }
    return {
      name: "Fuel Station",
      address: order.deliveryAddress || "Address not available"
    };
  };

  // Handle order cancellation
  const handleCancelOrder = (orderId: string) => {
    // Add to cancelled orders set to hide it
    setCancelledOrders(prev => new Set(prev).add(orderId));
    
    // Show toast notification
    toast({
      title: "Order Cancelled",
      description: "Your order has been successfully cancelled.",
    });
  };

  // Handle order acceptance
  const handleAcceptOrder = (orderId: string) => {
    // Set the accepted order ID
    setAcceptedOrderId(orderId);
    
    // Show confirmation message
    toast({
      title: "Order Accepted",
      description: "Your order has been accepted. Please proceed to the fuel station.",
    });
  };

  // Filter out cancelled orders and mock orders
  // Mock orders have specific tracking numbers that we can identify
  const visibleOrders = orders.filter((order: any) => {
    // Filter out cancelled orders
    if (cancelledOrders.has(order.id)) return false;
    
    // Don't filter out the accepted order
    if (acceptedOrderId && order.id === acceptedOrderId) return true;
    
    // Filter out mock orders by checking for specific patterns in tracking numbers
    // Mock orders have tracking numbers like "162432", "GB8821", "US9922", "US9923"
    const mockTrackingNumbers = ["162432", "GB8821", "US9922", "US9923"];
    if (mockTrackingNumbers.includes(order.trackingNumber)) return false;
    
    return true;
  });
  
  // Get the accepted order if there is one
  const acceptedOrder = acceptedOrderId 
    ? visibleOrders.find((order: any) => order.id === acceptedOrderId)
    : null;

  // Get other orders (excluding the accepted one)
  const otherOrders = acceptedOrderId
    ? visibleOrders.filter((order: any) => order.id !== acceptedOrderId)
    : visibleOrders;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-card border-b border-card-border p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">My Orders</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Recently accepted order confirmation */}
        {acceptedOrder && (
          <div
            id="accepted-order"
            className="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-green-800">Order Accepted!</h3>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your order has been accepted. Please proceed to the fuel station.
            </p>
            
            {/* Show the accepted order details */}
            <div className="mt-4 border border-card-border rounded-xl p-4 bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">Order #{acceptedOrder.trackingNumber}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{acceptedOrder.fuelType} • {acceptedOrder.fuelQuantity}L</p>
                </div>
                <span className="text-sm font-semibold text-primary">${acceptedOrder.totalAmount}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{getStationDetails(acceptedOrder).name}</span>
              </div>
              
              <p className="text-xs text-muted-foreground mt-1 ml-6">{getStationDetails(acceptedOrder).address}</p>
              
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Ordered: {formatDate(acceptedOrder.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize">{acceptedOrder.status.replace('_', ' ')}</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 text-green-700 border-green-300 hover:bg-green-100"
              onClick={() => setAcceptedOrderId(null)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : otherOrders.length === 0 && !acceptedOrder ? (
          <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">No Orders Yet</h2>
            <p className="text-sm text-muted-foreground">
              You haven't placed any orders. Visit a fuel station to get started.
            </p>
            <Button variant="default" onClick={() => setLocation("/dashboard")}>
              Find Stations
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Order History ({otherOrders.length}{acceptedOrder ? ' + 1 accepted' : ''})</h2>
            {otherOrders.map((order: any) => {
              const station = getStationDetails(order);
              return (
                <div 
                  key={order.id} 
                  className="border border-card-border rounded-xl p-4 bg-card"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">Order #{order.trackingNumber}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{order.fuelType} • {order.fuelQuantity}L</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">${order.totalAmount}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{station.name}</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1 ml-6">{station.address}</p>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Ordered: {formatDate(order.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">{order.status.replace('_', ' ')}</span>
                  </div>
                  
                  {order.status === "completed" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => setLocation(`/order-details/${order.id}`)}
                    >
                      View Details
                    </Button>
                  )}
                  
                  {order.status === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Request
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAcceptOrder(order.id)}
                      >
                        Accept Request
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Display current location info */}
        <div className="mt-8 p-4 bg-card rounded-lg border border-card-border">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Your Location</h3>
          </div>
          
          {error ? (
            <p className="text-sm text-destructive">Error getting location: {error.message}</p>
          ) : position ? (
            <div className="text-sm">
              <p>Latitude: {position.latitude.toFixed(6)}</p>
              <p>Longitude: {position.longitude.toFixed(6)}</p>
              <p className="text-muted-foreground mt-1">Accuracy: ±{position.accuracy.toFixed(0)} meters</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Getting your location...</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}