import { BottomNav } from "@/components/BottomNav";
import { OrderCard } from "@/components/OrderCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/useOrders";
import type { Order } from "@/lib/schemas";

export default function AllOrders() {
  const fuelFriendId = localStorage.getItem("driverId") || "ff1";
  
  const { data: activeOrders = [], isLoading: isLoadingActive } = useOrders("active", fuelFriendId, "driver");
  const { data: completedOrders = [], isLoading: isLoadingCompleted } = useOrders("completed", fuelFriendId, "driver");
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Orders</h1>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active" data-testid="tab-active">Ongoing</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-0">
            {isLoadingActive ? (
              <>
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </>
            ) : activeOrders.length > 0 ? (
              activeOrders.map((order: Order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No ongoing orders</p>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3 mt-0">
            {isLoadingCompleted ? (
              <>
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </>
            ) : completedOrders.length > 0 ? (
              completedOrders.map((order: Order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No order history</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
