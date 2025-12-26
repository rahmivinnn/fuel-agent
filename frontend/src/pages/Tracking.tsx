import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, MapPin, Clock, RefreshCw, Truck, DollarSign } from "lucide-react";
import { useLocation } from "wouter";
import { useOrders } from "@/hooks/useOrders";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { MobileContainer } from "@/components/MobileContainer";

export default function MyOrders() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const driverId = localStorage.getItem("driverId") || "ff1";
  const { data: orders = [], isLoading, refetch } = useOrders(undefined, driverId, "driver");
  const [acceptedOrderId, setAcceptedOrderId] = useState<string | null>(null);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
    await refetch();
    toast({ title: "Orders refreshed!", duration: 2000 });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileContainer>
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 flex-1">My Orders</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="text-green-500"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 text-center text-sm leading-relaxed mb-6">
              You haven't accepted any orders yet. Check the dashboard for new requests.
            </p>
            <Button 
              onClick={() => setLocation("/dashboard")}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6"
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          /* Orders List */
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Active Orders ({orders.length})
              </h2>
            </div>
            
            {orders.map((order: any) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-gray-900">
                      Order #{order.trackingNumber || order.id}
                    </h3>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>{order.fuelType} • {order.fuelQuantity}L</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{order.deliveryAddress}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>${order.totalAmount}</span>
                  </div>
                </div>
                
                {order.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      Decline
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      Accept
                    </Button>
                  </div>
                )}
                
                {order.status === 'accepted' && (
                  <Button 
                    size="sm" 
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
                  >
                    Start Delivery
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </MobileContainer>
      <BottomNav />
    </div>
  );
}