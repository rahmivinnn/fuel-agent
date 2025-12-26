import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Package2 } from "lucide-react";
import { useLocation } from "wouter";
import { useOrders } from "@/hooks/useOrders";
import { MobileContainer } from "@/components/MobileContainer";
import type { Order } from "@/lib/schemas";

export default function AllOrders() {
  const [, setLocation] = useLocation();
  const driverId = localStorage.getItem("driverId") || "ff1";
  
  const { data: newOrders = [], isLoading: isLoadingNew } = useOrders("pending");
  const { data: activeOrders = [], isLoading: isLoadingActive } = useOrders("active", driverId);
  const { data: completedOrders = [], isLoading: isLoadingCompleted } = useOrders("completed", driverId);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-xl font-semibold text-gray-900">All Orders</h1>
        </div>

        <div className="py-6">
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger 
                value="new" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-green-600 data-[state=active]:text-green-600 border-b-2 border-transparent data-[state=active]:border-green-500"
              >
                New
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-gray-500 data-[state=active]:text-gray-900"
              >
                Active
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-gray-500 data-[state=active]:text-green-600 border-b-2 border-transparent data-[state=active]:border-green-500"
              >
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-4 mt-0">
              {isLoadingNew ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="space-y-2 mb-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : newOrders.length > 0 ? (
                <div className="space-y-4">
                  {newOrders.map((order: any) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900">Order #{order.trackingNumber || order.id}</h3>
                        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Pending
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-3">{formatDate(order.createdAt)}</p>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-red-600">
                          <MapPin className="w-4 h-4" />
                          <span>Pickup: Shell Station- {order.pickupLocation || 'Abc Town'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-600">
                          <Clock className="w-4 h-4" />
                          <span>Drop off: Shell Station- {order.deliveryAddress || 'Abc Town'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <Package2 className="w-4 h-4" />
                          <span>Order type: {order.fuelType || 'Fuel'} delivery</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-gray-600 border-gray-300"
                        >
                          Cancel Request
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        >
                          Accept Request
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Package2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No New Orders</h2>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">
                    New order requests will appear here.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4 mt-0">
              {isLoadingActive ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="space-y-2 mb-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="h-8 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : activeOrders.length > 0 ? (
                <div className="space-y-4">
                  {activeOrders.map((order: any) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900">Order #{order.trackingNumber || order.id}</h3>
                        <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                          Active
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-3">{formatDate(order.createdAt)}</p>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-red-600">
                          <MapPin className="w-4 h-4" />
                          <span>Pickup: Shell Station- {order.pickupLocation || 'Abc Town'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-600">
                          <Clock className="w-4 h-4" />
                          <span>Drop off: {order.deliveryAddress || 'Shell Station- Abc Town'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <Package2 className="w-4 h-4" />
                          <span>Order type: {order.fuelType || 'Fuel'} delivery</span>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => setLocation(`/track-customer/${order.id}`)}
                      >
                        Track Order
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Orders</h2>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">
                    Your active orders will appear here.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-0">
              {isLoadingCompleted ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="space-y-2 mb-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : completedOrders.length > 0 ? (
                <div className="space-y-4">
                  {completedOrders.map((order: any, index: number) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900">Order #{order.trackingNumber || order.id}</h3>
                        <Badge className={index === completedOrders.length - 1 ? "bg-red-100 text-red-800 border border-red-200" : "bg-green-100 text-green-800 border border-green-200"}>
                          {index === completedOrders.length - 1 ? "Canceled" : "Completed"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-3">{formatDate(order.updatedAt || order.createdAt)}</p>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-red-600">
                          <MapPin className="w-4 h-4" />
                          <span>Pickup: Shell Station- {order.pickupLocation || 'Tennessee'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-600">
                          <Clock className="w-4 h-4" />
                          <span>Drop off: {order.deliveryAddress || 'Shell Station-Tennessee'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <Package2 className="w-4 h-4" />
                          <span>Order type: {order.fuelType || 'Fuel'}, Groceries delivery</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No Order History</h2>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">
                    Your completed orders will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </MobileContainer>
      <BottomNav />
    </div>
  );
}
