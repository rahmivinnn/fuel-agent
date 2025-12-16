import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, CheckCircle, MapPin, Navigation } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useOrder, useCompleteOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeolocation } from "@/hooks/useGeolocation";

// Dynamically import mapboxgl to avoid SSR issues
let mapboxgl: any = null;
if (typeof window !== 'undefined') {
  import('mapbox-gl').then((module) => {
    mapboxgl = module.default;
  });
}

export default function TrackCustomer() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/track-customer/:id");
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const { toast } = useToast();
  const { position: driverPosition, error: driverError, loading: driverLoading } = useGeolocation();
  const [customerPosition, setCustomerPosition] = useState<[number, number] | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useSimulatedPosition, setUseSimulatedPosition] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  const [isDelivering, setIsDelivering] = useState(true);

  const orderId = params?.id;
  const { data: orderData, isLoading } = useOrder(orderId);
  const completeOrderMutation = useCompleteOrder();

  const handleCompleteOrder = async () => {
    if (!orderId) return;
    try {
      await completeOrderMutation.mutateAsync(orderId);
      toast({
        title: "Order Completed!",
        description: "Payment has been added to your wallet.",
      });
      setLocation("/wallet");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete order",
        variant: "destructive",
      });
    }
  };

  // Show notification about location issues
  useEffect(() => {
    if (driverError && driverError.message.includes("VPN")) {
      toast({
        title: "VPN Detected",
        description: "We detected you're using a VPN. Using simulated position for tracking.",
        duration: 8000,
      });
      setUseSimulatedPosition(true);
    }
  }, [driverError, toast]);

  // Simulate delivery progress
  useEffect(() => {
    if (!isDelivering) return;
    
    const interval = setInterval(() => {
      setDeliveryProgress(prev => {
        if (prev >= 100) {
          setIsDelivering(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Increase by 2% every 300ms
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isDelivering]);

  // Show completion notification when delivery reaches 100%
  useEffect(() => {
    if (deliveryProgress === 100 && isDelivering === false) {
      toast({
        title: "Delivery Almost Complete!",
        description: "You're at the customer's location. Tap 'Complete Delivery' to finish.",
        duration: 10000,
      });
    }
  }, [deliveryProgress, isDelivering, toast]);

  // Get customer position from order data or fallback to a default
  useEffect(() => {
    if (orderData?.deliveryAddress) {
      // In a real app, you would use a geocoding service to convert address to coordinates
      // For now, we'll use the location from the order data if available
      if (orderData.deliveryAddress.includes("London")) {
        setCustomerPosition([-0.1276, 51.5072]); // London
      } else if (orderData.deliveryAddress.includes("New York") || orderData.deliveryAddress.includes("NY")) {
        setCustomerPosition([-73.9851, 40.7589]); // Times Square, NYC
      } else if (orderData.deliveryAddress.includes("Tennessee") || orderData.deliveryAddress.includes("Nashville")) {
        setCustomerPosition([-86.7816, 36.1627]); // Nashville
      } else {
        // Default to Nashville if we can't determine location
        setCustomerPosition([-86.7816, 36.1627]);
      }
    } else if (orderData) {
      // Fallback if no delivery address
      setCustomerPosition([-86.7816, 36.1627]); // Default to Nashville
    }
  }, [orderData]);

  // Initialize map with real positions
  useEffect(() => {
    // Wait for mapboxgl to be loaded
    if (!mapboxgl) {
      const interval = setInterval(() => {
        if (typeof window !== 'undefined' && window.mapboxgl) {
          mapboxgl = window.mapboxgl;
          setMapLoaded(true);
        }
      }, 100);
      return () => clearInterval(interval);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapboxgl || !mapRef.current || !customerPosition || !orderData) return;

    // Make sure mapboxgl is properly loaded
    if (!mapboxgl.accessToken) {
      const token = "pk.eyJ1IjoidmluYTk4IiwiYSI6ImNtN3I3eDF6ZTB2OW0yam9kdzFxdndhdTkifQ.HNqbNgBUAoBPYmoAMISdaw";
      mapboxgl.accessToken = token;
    }

    // Clean up previous map instance if exists
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn("Error removing previous map instance:", e);
      }
    }

    // Use either real driver position or simulated position
    const driverCoords = useSimulatedPosition || !driverPosition 
      ? { latitude: 36.1627, longitude: -86.7816 } // Default to Nashville
      : driverPosition;

    const customerLngLat: [number, number] = customerPosition;
    const driverLngLat: [number, number] = [driverCoords.longitude, driverCoords.latitude];

    try {
      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [(customerLngLat[0] + driverLngLat[0]) / 2, (customerLngLat[1] + driverLngLat[1]) / 2],
        zoom: 12,
      });

      mapInstanceRef.current = map;

      // Add customer marker
      const customerMarker = new mapboxgl.Marker({ color: "#e11d48" })
        .setLngLat(customerLngLat)
        .setPopup(new mapboxgl.Popup({ offset: 24 }).setText("Customer"))
        .addTo(map);

      // Add driver marker
      const driverMarker = new mapboxgl.Marker({ color: "#22c55e" })
        .setLngLat(driverLngLat)
        .setPopup(new mapboxgl.Popup({ offset: 24 }).setText(useSimulatedPosition ? "Driver (Simulated)" : "You (Driver)"))
        .addTo(map);

      // Fit bounds to show both markers
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(customerLngLat);
      bounds.extend(driverLngLat);
      map.fitBounds(bounds, { padding: 60, duration: 800 });

      // Update driver position periodically to simulate movement
      const interval = setInterval(() => {
        // Calculate intermediate position based on delivery progress
        const progress = deliveryProgress / 100;
        const newLng = driverLngLat[0] + (customerLngLat[0] - driverLngLat[0]) * progress;
        const newLat = driverLngLat[1] + (customerLngLat[1] - driverLngLat[1]) * progress;
        
        driverMarker.setLngLat([newLng, newLat]);
        
        // Update bounds to include new position
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(customerLngLat);
        bounds.extend([newLng, newLat]);
        mapInstanceRef.current.fitBounds(bounds, { padding: 60, duration: 800 });
      }, 500); // Update every 500ms

      return () => {
        clearInterval(interval);
        try {
          if (customerMarker && customerMarker.remove) customerMarker.remove();
          if (driverMarker && driverMarker.remove) driverMarker.remove();
          if (map && map.remove) map.remove();
        } catch (e) {
          console.warn("Error cleaning up map components:", e);
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Failed to load the map. Showing fallback view.",
        variant: "destructive",
      });
    }
  }, [customerPosition, driverPosition, mapLoaded, useSimulatedPosition, deliveryProgress, orderData, toast]);

  if (isLoading) {
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
          <h1 className="text-lg font-bold">Track Customer</h1>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <BottomNav />
      </div>
    );
  }

  // Fallback UI when map fails to load or order data is missing
  if (!orderData) {
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
          <h1 className="text-lg font-bold">Track Customer</h1>
        </div>
        <div className="p-6 flex flex-col items-center justify-center text-center py-16 gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Navigation className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Order Not Found</h2>
          <p className="text-sm text-muted-foreground">
            We couldn't find the order you're trying to track.
          </p>
          <Button variant="default" onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

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
        <h1 className="text-lg font-bold">Track Customer</h1>
      </div>

      <div className="relative">
        {/* Mapbox map */}
        <div ref={mapRef} className="h-[60vh] relative overflow-hidden" />
        
        {/* Loading indicator when getting location */}
        {(!mapLoaded || !customerPosition || (driverLoading && !useSimulatedPosition)) && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {driverError ? `Location error: ${driverError.message}` : "Loading map..."}
              </p>
            </div>
          </div>
        )}

        {/* Location status indicator */}
        {useSimulatedPosition && (
          <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg text-sm max-w-xs">
            <p>⚠️ Using simulated location due to VPN</p>
          </div>
        )}

        {/* Delivery Progress Bar */}
        <div className="absolute top-4 right-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
          <div className="flex justify-between text-sm font-medium mb-1">
            <span>Delivery Progress</span>
            <span>{deliveryProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${deliveryProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Floating info card */}
        <Card className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-card-border p-6 space-y-4 shadow-lg bg-card/95 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground">{orderData?.customerName || "Customer"}</h3>
              <p className="text-sm text-muted-foreground">{orderData?.deliveryAddress || "Getting address..."}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Your Delivery Time</span>
              <span className="text-sm font-semibold text-primary">{orderData?.estimatedDeliveryTime || "Calculating..."}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-foreground">Status: <span className="uppercase text-primary">{orderData?.status}</span></h4>
              <span className="text-lg font-bold">{orderData?.totalAmount ? `$${orderData.totalAmount}` : "$0.00"}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {deliveryProgress >= 100 ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
                onClick={handleCompleteOrder}
                disabled={completeOrderMutation.isPending}
              >
                {completeOrderMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Complete Delivery
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="w-full"
                size="lg"
                disabled
              >
                Delivering... {deliveryProgress}%
              </Button>
            )}
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}