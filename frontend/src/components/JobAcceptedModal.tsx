import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, MapPin, Navigation, Package } from "lucide-react";

// Simple VisuallyHidden component as fallback
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <div className="sr-only">{children}</div>
);

interface JobAcceptedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: () => void;
  order?: {
    stationName?: string;
    deliveryAddress?: string;
    fuelType?: string;
  };
}

export function JobAcceptedModal({ isOpen, onClose, onTrackOrder, order }: JobAcceptedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl p-6">
        <VisuallyHidden>
          <DialogTitle>Job Started Successfully</DialogTitle>
          <DialogDescription>
            Your job has been accepted and started. Track your customer's location for delivery.
          </DialogDescription>
        </VisuallyHidden>
        
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900">
            Job Started Successfully!
          </h2>
          
          <p className="text-gray-600 text-sm">
            Track your customer's location to ensure a smooth delivery!
          </p>
          
          <div className="w-full space-y-3 text-left">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Pickup: {order?.stationName || "Shell Station- Abc Town"}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4 text-orange-500" />
              <span>Drop off: {order?.deliveryAddress || "Shell Station- Abc Town"}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-green-500" />
              <span>Order type: {order?.fuelType || "Fuel delivery"}</span>
            </div>
          </div>
          
          <Button 
            onClick={onTrackOrder}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-semibold"
          >
            Track Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}