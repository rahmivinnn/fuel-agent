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
import { useOrders } from "@/hooks/useOrders";
import { useDriver } from "@/hooks/useDriver";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const driverId = localStorage.getItem("driverId") || "ff1";
  const [earnings] = useState(127.50);
  
  // Get user data from storage
  const driverName = localStorage.getItem("customerName") || 
                     localStorage.getItem("driverName") || 
                     "Driver";
  
  const { data: driver, isLoading: isLoadingDriver } = useDriver(driverId);
  const { data: pendingOrders = [], isLoading: isLoadingPending } = useOrders("pending");
  const { data: activeOrders = [], isLoading: isLoadingActive } = useOrders("active", driverId);

  useEffect(() => {
    toast({
      title: "Welcome Back!",
      description: "Ready for deliveries?",
      duration: 3000,
    });
  }, [toast]);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
    toast({ title: "Data refreshed!", duration: 2000 });
  };

  const handleAcceptOrder = async (orderId: string) => {
    toast({ title: "Order Accepted!", description: "You have accepted the order" });
    setLocation(`/track-customer/${orderId}`);
  };

  const handleCancelOrder = async (orderId: string) => {
    toast({ title: "Order Cancelled", description: "You have cancelled the order request" });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileContainer>
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLocation("/my-profile")}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center hover:shadow-lg transition-all cursor-pointer"
            >
              <User className="w-6 h-6 text-white" />
            </button>
            <div>
              <p className="text-sm text-gray-600">Good morning!</p>
              <h1 className="text-xl font-semibold text-gray-900">{driverName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
          <div className="text-right relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/notifications")}
              className="text-gray-600 hover:text-green-600 mb-2 relative"
            >
              <Bell className="w-6 h-6" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">3</span>
              </div>
            </Button>
            <div className="text-xs text-gray-500">Today's Earnings</div>
            <div className="text-lg font-bold text-green-600 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {earnings.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 rounded-xl p-3 text-center"
          >
            <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-600">{activeOrders.length}</div>
            <div className="text-xs text-blue-600">Active</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-orange-50 rounded-xl p-3 text-center"
          >
            <TrendingUp className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-orange-600">{pendingOrders.length}</div>
            <div className="text-xs text-orange-600">Pending</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-50 rounded-xl p-3 text-center"
          >
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-600">12</div>
            <div className="text-xs text-green-600">Completed</div>
          </motion.div>
        </div>

        {/* Order Requests */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Order Requests</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-green-600 p-2"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                className="text-green-600 p-0 h-auto"
                onClick={() => setLocation("/orders")}
              >
                See all
              </Button>
            </div>
          </div>

          {isLoadingPending ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex-shrink-0">
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
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">No New Requests</h4>
              <p className="text-sm text-gray-600 mb-4">Check back soon for new delivery opportunities</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="border-green-200 text-green-600 hover:bg-green-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Orders
              </Button>
            </motion.div>
          )}
        </div>

        {/* Current Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Current Orders</h3>
            <Button
              variant="ghost"
              className="text-green-600 p-0 h-auto"
              onClick={() => setLocation("/my-orders")}
            >
              See all
            </Button>
          </div>

          {isLoadingActive ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex-shrink-0">
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
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Ready for Deliveries</h4>
              <p className="text-sm text-gray-600 mb-4">Accept new orders to start earning</p>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                0 Active Orders
              </Badge>
            </motion.div>
          )}
        </div>
      </MobileContainer>
      <BottomNav />
    </div>
  );
}