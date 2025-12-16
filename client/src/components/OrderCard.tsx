import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, MapPin } from "lucide-react";
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
        return "bg-[hsl(var(--pending))] text-[hsl(var(--pending-foreground))]";
      case "active":
        return "bg-[hsl(var(--active))] text-[hsl(var(--active-foreground))]";
      case "in_progress":
        return "bg-[hsl(var(--active))] text-[hsl(var(--active-foreground))]";
      case "completed":
        return "bg-[hsl(var(--completed))] text-[hsl(var(--completed-foreground))]";
      case "canceled":
        return "bg-[hsl(var(--canceled))] text-[hsl(var(--canceled-foreground))]";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateValue: any) => {
    try {
      const d = new Date(dateValue);
      return d.toLocaleDateString();
    } catch {
      return String(dateValue || "")
    }
  };

  const formatMoney = (amount: string | number) => {
    return formatCurrency(amount as any);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative p-4 space-y-3 border-card-border shadow-sm rounded-xl hover-elevate">
        <Badge 
          className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(order.status)}`}
        >
          {order.status}
        </Badge>
        
        <div className="pr-20">
          <h3 className="text-base font-bold text-foreground">Tracking #{order.trackingNumber}</h3>
          <p className="text-xs text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground min-w-[90px]">Address:</span>
            <span className="text-foreground font-medium">{order.deliveryAddress}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground min-w-[90px]">Type:</span>
            <span className="text-foreground font-medium">{order.orderType}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground min-w-[90px]">Total:</span>
            <span className="text-foreground font-medium">{formatMoney(order.totalAmount as any)}</span>
          </div>
        </div>

        {order.status === "pending" && onAccept && onCancel && (
          <motion.div 
            className="grid grid-cols-2 gap-3 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant="outline"
              onClick={() => onCancel(order.id)}
              data-testid={`button-cancel-${order.id}`}
              className="w-full"
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => onAccept(order.id)}
              data-testid={`button-accept-${order.id}`}
              className="w-full"
              whileTap={{ scale: 0.95 }}
            >
              Accept
            </Button>
          </motion.div>
        )}

        {(order.status === "active" || order.status === "in_progress") && onCall && onMessage && onTrack && (
          <motion.div 
            className="grid grid-cols-3 gap-2 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCall(order.id)}
              data-testid={`button-call-${order.id}`}
              className="flex items-center gap-1"
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMessage(order.id)}
              data-testid={`button-message-${order.id}`}
              className="flex items-center gap-1"
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
            <Button
              size="sm"
              onClick={() => onTrack(order.id)}
              data-testid={`button-track-${order.id}`}
              className="flex items-center gap-1"
              whileTap={{ scale: 0.95 }}
            >
              <MapPin className="w-4 h-4" />
              Track
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}