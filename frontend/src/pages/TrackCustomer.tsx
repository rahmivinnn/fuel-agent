import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Phone, MapPin, User, Car, CheckCircle } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/lib/api";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoidmluYTk4IiwiYSI6ImNtN3I3eDF6ZTB2OW0yam9kdzFxdndhdTkifQ.HNqbNgBUAoBPYmoAMISdaw";

export default function TrackCustomer() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [sheetHeight, setSheetHeight] = useState(50); // Percentage of viewport height
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Handle drag functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    startHeight.current = sheetHeight;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = startY.current - currentY;
    const viewportHeight = window.innerHeight;
    const deltaPercent = (deltaY / viewportHeight) * 100;
    
    const newHeight = Math.max(20, Math.min(80, startHeight.current + deltaPercent));
    setSheetHeight(newHeight);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    // Snap to nearest position
    if (sheetHeight < 35) {
      setSheetHeight(20); // Minimized
    } else if (sheetHeight > 65) {
      setSheetHeight(80); // Maximized
    } else {
      setSheetHeight(50); // Default
    }
  };

  // Get driver's current location
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
            setDriverLocation(coords);
          },
          (error) => {
            console.error('Error getting location:', error);
            // Fallback to Memphis coordinates
            setDriverLocation([-90.0715, 35.1495]);
          }
        );
      } else {
        // Fallback to Memphis coordinates
        setDriverLocation([-90.0715, 35.1495]);
      }
    };

    getCurrentLocation();
    
    // Update location every 10 seconds
    const locationInterval = setInterval(getCurrentLocation, 10000);
    
    return () => clearInterval(locationInterval);
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setOrder(data.data || data.order);
          
          if (data.data?.fuelFriendId || data.order?.fuelFriendId) {
            const fuelFriendId = data.data?.fuelFriendId || data.order?.fuelFriendId;
            const driverResponse = await fetch(`${API_BASE_URL}/api/fuel-friends/${fuelFriendId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const driverData = await driverResponse.json();
            if (driverData.success) {
              setDriver(driverData.data || driverData.fuelFriend);
            }
          }
          
          if (data.data?.customerId || data.order?.customerId) {
            const customerId = data.data?.customerId || data.order?.customerId;
            const customerResponse = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const customerData = await customerResponse.json();
            if (customerData.success) {
              setCustomer(customerData.data || customerData.customer);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      }
    };
    
    if (id) fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    if (map.current || !mapContainer.current || !driverLocation) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: driverLocation,
      zoom: 14
    });

    // Add driver marker (green) at current location
    driverMarker.current = new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat(driverLocation)
      .addTo(map.current);

    // Add customer marker (red) - use real customer location if available
    let customerLocation: [number, number];
    if (order?.deliveryLatitude && order?.deliveryLongitude) {
      customerLocation = [order.deliveryLongitude, order.deliveryLatitude];
    } else {
      // Fallback: offset slightly from driver location
      customerLocation = [
        driverLocation[0] + 0.01, 
        driverLocation[1] - 0.01
      ];
    }
    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat(customerLocation)
      .addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [driverLocation]);

  // Update driver marker position when location changes
  useEffect(() => {
    if (map.current && driverMarker.current && driverLocation) {
      driverMarker.current.setLngLat(driverLocation);
      map.current.setCenter(driverLocation);
    }
  }, [driverLocation]);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold ml-3">Track Customer</h1>
      </div>

      {/* Map Container - Fixed Full Screen */}
      <div className="fixed inset-0 z-0">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* Bottom Sheet - Draggable */}
      <div 
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-10 bg-white rounded-t-3xl transition-all duration-300 ease-out"
        style={{ height: `${sheetHeight}vh` }}
      >
        {/* Drag Handle */}
        <div 
          className="w-full p-4 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>
        
        {/* Content - Scrollable */}
        <div className="px-6 pb-6 space-y-6 overflow-y-auto" style={{ height: `calc(${sheetHeight}vh - 60px)` }}>
        
        {/* Driver Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
              <img 
                src="/avatar.png" 
                alt="Driver" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%23e5e7eb'/%3E%3Cpath d='M24 12c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6zm0 28c-6.6 0-12-5.4-12-12 0-1.3.2-2.5.6-3.6 2.4 1.8 5.4 2.9 8.7 2.9h5.4c3.3 0 6.3-1.1 8.7-2.9.4 1.1.6 2.3.6 3.6 0 6.6-5.4 12-12 12z' fill='%23fff'/%3E%3C/svg%3E";
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{driver?.fullName || "Loading..."}</h3>
              <p className="text-sm text-gray-500">{driver?.location || order?.pickupLocation || "Location not available"}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              className="bg-green-500 hover:bg-green-600 rounded-full"
              onClick={() => setLocation(`/message/${id}`)}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </Button>
            <Button size="icon" className="bg-green-500 hover:bg-green-600 rounded-full">
              <Phone className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Delivery Time */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Delivery Time</h4>
          <p className="text-gray-600">
            {order?.estimatedDeliveryTime ? 
              `Before ${new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 
              "Calculating..."
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1 h-0.5 bg-green-200 mx-2 relative">
            <div className="absolute inset-0 bg-green-500 w-1/3" />
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-green-200 rounded-full flex items-center justify-center">
              <Car className="w-4 h-4 text-green-500" />
            </div>
          </div>
          
          <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
          
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-gray-200 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
          
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-gray-200 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Customer</h4>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{customer?.fullName || "Customer"}</p>
              <p className="text-sm text-gray-500">{customer?.phoneNumber || order?.deliveryPhone || "Phone not available"}</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Order</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Pickup</span>
              <span className="text-gray-900">{order?.pickupLocation || order?.stationName || "Loading..."}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Drop Off</span>
              <span className="text-gray-900">{order?.deliveryAddress || "Loading..."}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fuel Type</span>
              <span className="text-gray-900">{order?.fuelType || "Loading..."}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="text-gray-900">{order?.totalAmount ? `$${order.totalAmount}` : "Loading..."}</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}