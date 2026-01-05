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
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [routeCoordinates, setRouteCoordinates] = useState<number[][]>([]);
  const [sheetHeight, setSheetHeight] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Get route from Mapbox Directions API
  const getRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;
        const distance = route.distance;
        const duration = route.duration;
        
        setRouteCoordinates(coordinates);
        setDistance(distance < 1000 ? `${Math.round(distance)}m` : `${(distance/1000).toFixed(1)}km`);
        setDuration(`${Math.round(duration/60)}min`);
        
        return coordinates;
      }
    } catch (error) {
      console.error('Error getting route:', error);
    }
    return null;
  };

  // Update route when locations change
  useEffect(() => {
    if (driverLocation && order?.deliveryLatitude && order?.deliveryLongitude) {
      const customerLocation: [number, number] = [order.deliveryLongitude, order.deliveryLatitude];
      getRoute(driverLocation, customerLocation);
    }
  }, [driverLocation, order]);
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
        console.log('Fetching order details for ID:', id);
        const token = localStorage.getItem('token') || localStorage.getItem('jwt_token');
        console.log('Using token:', token ? 'Token found' : 'No token');
        
        const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Order API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        
        const data = await response.json();
        console.log('Order API response data:', data);
        
        if (data.success) {
          const orderData = data.data?.order || data.data || data.order;
          console.log('Setting order data:', orderData);
          setOrder(orderData);
          
          if (orderData?.fuelFriendId) {
            console.log('Fetching driver for ID:', orderData.fuelFriendId);
            const driverResponse = await fetch(`${API_BASE_URL}/api/fuel-friends/${orderData.fuelFriendId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const driverData = await driverResponse.json();
            console.log('Driver data:', driverData);
            if (driverData.success) {
              setDriver(driverData.data || driverData.fuelFriend);
            }
          }
          
          if (orderData?.customerId) {
            console.log('Fetching customer for ID:', orderData.customerId);
            const customerResponse = await fetch(`${API_BASE_URL}/api/customers/${orderData.customerId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const customerData = await customerResponse.json();
            console.log('Customer data:', customerData);
            if (customerData.success) {
              setCustomer(customerData.data || customerData.customer);
            }
          }
        } else {
          console.error('API returned error:', data);
          // Fallback: create dummy order data for demo
          const dummyOrder = {
            id: id,
            trackingNumber: `DEMO${id}`,
            pickupLocation: "Shell Station NYC",
            deliveryAddress: "123 Broadway, New York",
            fuelType: "Premium",
            totalAmount: "50.00",
            status: "in_progress",
            deliveryLatitude: 40.7589,
            deliveryLongitude: -73.9851,
            createdAt: new Date().toISOString()
          };
          
          const dummyDriver = {
            id: "demo-driver",
            fullName: "Demo Driver",
            phoneNumber: "+1234567890",
            location: "New York"
          };
          
          const dummyCustomer = {
            id: "demo-customer",
            fullName: "Demo Customer",
            phoneNumber: "+1987654321"
          };
          
          setOrder(dummyOrder);
          setDriver(dummyDriver);
          setCustomer(dummyCustomer);
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      console.log('Order ID from params:', id);
      fetchOrderDetails();
    } else {
      console.error('No order ID provided');
    }
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

    // Add route line between driver and customer using real road data
    if (order?.deliveryLatitude && order?.deliveryLongitude) {
      const customerLocation: [number, number] = [order.deliveryLongitude, order.deliveryLatitude];
      
      map.current.on('load', () => {
        // Add route source
        map.current!.addSource('route', {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'LineString',
              'coordinates': []
            }
          }
        });
        
        // Add route layer
        map.current!.addLayer({
          'id': 'route',
          'type': 'line',
          'source': 'route',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#3AC36C',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });
      });
      
      // Add customer marker
      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(customerLocation)
        .addTo(map.current);
        
      // Fit map to show both markers
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(driverLocation);
      bounds.extend(customerLocation);
      map.current.fitBounds(bounds, { padding: 50 });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [driverLocation]);

  // Update route on map when coordinates change
  useEffect(() => {
    if (map.current && routeCoordinates.length > 0) {
      const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': routeCoordinates
          }
        });
      }
    }
  }, [routeCoordinates]);
  useEffect(() => {
    if (map.current && driverMarker.current && driverLocation) {
      driverMarker.current.setLngLat(driverLocation);
      map.current.setCenter(driverLocation);
    }
  }, [driverLocation]);

  return (
    <div className="min-h-screen bg-white relative">
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        <div>
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
            
            {/* Distance Info */}
            {distance && (
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Distance to Customer</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-800">{distance}</p>
                    <p className="text-xs text-green-600">~{duration} away</p>
                  </div>
                </div>
              </div>
            )}
            
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
                  order?.createdAt ? 
                    `Before ${new Date(new Date(order.createdAt).getTime() + 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` :
                    "30 minutes"
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
                  <span className="text-gray-900">{order?.pickupLocation || order?.stationName || order?.stationId || "Loading..."}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Drop Off</span>
                  <span className="text-gray-900">{order?.deliveryAddress || order?.customerAddress || "Loading..."}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Type</span>
                  <span className="text-gray-900">{order?.fuelType || order?.productType || "Loading..."}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-gray-900">{order?.totalAmount ? `$${order.totalAmount}` : order?.amount ? `$${order.amount}` : "Loading..."}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-gray-900 capitalize">{order?.status || "Loading..."}</span>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}