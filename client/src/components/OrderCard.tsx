import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, MapPin, Navigation, Fuel, ShoppingBag } from "lucide-react";
import type { Order } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

interface OrderCardProps {
  order: Order;
  onAccept?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  onCall?: (orderId: string) => void;
  onMessage?: (orderId: string) => void;
  onTrack?: (orderId: string) => void;
}

export function OrderCard({ order, onAccept, onCancel, onCall, onMessage, onTrack }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "active":
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateValue: any) => {
    try {
      const d = new Date(dateValue);
      return d.toLocaleDateString('en-GB');
    } catch {
      return "25/03/2025";
    }
  };

  const getOrderType = () => {
    if (order.groceriesCost && parseFloat(order.groceriesCost) > 0) {
      return "Fuel, Groceries delivery";
    }
    return "Fuel delivery";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative p-4 space-y-3 border border-gray-200 shadow-sm rounded-2xl bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order #{order.trackingNumber}</h3>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <Badge className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
            {order.status === "in_progress" ? "Active" : order.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">Pickup: Shell Station- {order.deliveryAddress?.split(',')[1] || 'Abc Town'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Navigation className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">Drop off: Shell Station- {order.deliveryAddress?.split(',')[1] || 'Abc Town'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {order.groceriesCost && parseFloat(order.groceriesCost) > 0 ? (
              <ShoppingBag className="w-4 h-4 text-green-500" />
            ) : (
              <Fuel className="w-4 h-4 text-red-500" />
            )}
            <span className="text-gray-600">Order type: {getOrderType()}</span>
          </div>
        </div>

        {order.status === "pending" && onAccept && onCancel && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onCancel(order.id)}
              className="w-full rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel Request
            </Button>
            <Button
              onClick={() => onAccept(order.id)}
              className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white"
            >
              Accept Request
            </Button>
          </div>
        )}

        {(order.status === "active" || order.status === "in_progress") && onCall && onMessage && onTrack && (
          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => onCall(order.id)}
              className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button
              variant="ghost"
              onClick={() => onMessage(order.id)}
              className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
            <Button
              onClick={() => onTrack(order.id)}
              className="rounded-full bg-green-500 hover:bg-green-600 text-white text-sm"
            >
              Track Customer
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}