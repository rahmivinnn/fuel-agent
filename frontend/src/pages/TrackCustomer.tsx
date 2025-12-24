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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${id}`);
        const data = await response.json();
        setOrder(data.order);
        
        if (data.order?.fuelFriendId) {
          const driverResponse = await fetch(`${API_BASE_URL}/api/fuel-friends/${data.order.fuelFriendId}`);
          const driverData = await driverResponse.json();
          setDriver(driverData.fuelFriend);
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      }
    };
    
    if (id) fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-90.0715, 35.1495], // Memphis coordinates
      zoom: 12
    });

    // Add driver marker (green)
    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([-90.0715, 35.1495])
      .addTo(map.current);

    // Add customer marker (red)
    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([-90.0515, 35.1395])
      .addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold ml-3">Track Customer</h1>
      </div>

      {/* Map Container */}
      <div className="relative h-[60vh] rounded-b-3xl overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* Bottom Sheet */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 p-6 space-y-6">
        {/* Progress bar */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
        
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
              <h3 className="font-semibold text-gray-900">{driver?.fullName || "Cristopert Dastin"}</h3>
              <p className="text-sm text-gray-500">{driver?.location || "Tennessee"}</p>
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
          <h4 className="font-semibold text-gray-900 mb-1">Your Delivery Time</h4>
          <p className="text-gray-600">Before {order?.estimatedDeliveryTime || "8:30 PM"}</p>
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

        {/* Order Details */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Order</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Pickup</span>
              <span className="text-gray-900">{order?.stationId || "Abc Station-Tennessee"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Drop Off</span>
              <span className="text-gray-900">{order?.deliveryAddress?.split(',')[0] || "Abc-Tennessee"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}