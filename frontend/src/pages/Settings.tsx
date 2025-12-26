import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  Info, 
  CreditCard, 
  Bell, 
  Palette, 
  HelpCircle, 
  FileText, 
  Shield, 
  Trash2,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { MobileContainer } from "@/components/MobileContainer";
import { apiCallWithAuth } from "@/lib/auth";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  const securityItems = [
    {
      icon: Info,
      label: "Manage Passwords",
      onClick: () => setLocation("/manage-password"),
    },
    {
      icon: Info,
      label: "Manage Payment Method",
      onClick: () => toast({ title: "Payment Methods", description: "Payment management coming soon" }),
    },
  ];

  const generalItems = [
    {
      icon: Bell,
      label: "Notifications",
      onClick: () => setLocation("/notification-settings"),
    },
    {
      icon: Palette,
      label: "Themes",
      onClick: () => toast({ title: "Themes", description: "Theme selection coming soon" }),
    },
  ];

  const customerCareItems = [
    {
      icon: Info,
      label: "Help and Support",
      onClick: () => setLocation("/support-help"),
    },
    {
      icon: Info,
      label: "Terms and Conditions",
      onClick: () => setLocation("/terms-conditions"),
    },
    {
      icon: Info,
      label: "Privacy & Policy",
      onClick: () => setLocation("/privacy-policy"),
    },
    {
      icon: Trash2,
      label: "Request Account Deletion",
      onClick: () => setShowDeleteModal(true),
    },
  ];

  const handleDeleteAccount = async () => {
    try {
      const customerId = localStorage.getItem("customerId") || "c1";
      const response = await apiCallWithAuth(`http://localhost:5000/api/customers/${customerId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason: deleteReason })
      });
      
      if (response.ok) {
        setShowDeleteModal(false);
        setShowDeleteSuccessModal(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAccount = () => {
    setShowDeleteSuccessModal(false);
    setLocation("/register");
  };

  const deleteReasons = [
    "No longer need the service",
    "Facing technical issues",
    "Privacy concern",
    "App Technical Problem",
    "Found a better alternative",
    "Other",
  ];

  const renderSettingsItem = (item: any) => {
    const Icon = item.icon;
    return (
      <button
        key={item.label}
        onClick={item.onClick}
        className="w-full flex items-center gap-3 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <Icon className="w-5 h-5 text-gray-600" />
        <span className="flex-1 text-base text-gray-900">{item.label}</span>
      </button>
    );
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
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>

        <div className="py-6 space-y-8">
          {/* Security & Passwords */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-4 px-1">Security & Passwords</h2>
            <div className="space-y-1">
              {securityItems.map(renderSettingsItem)}
            </div>
          </div>

          {/* General Settings */}
          <div>
            <div className="space-y-1">
              {generalItems.map(renderSettingsItem)}
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-4 px-1">Customer Care</h2>
            <div className="space-y-1">
              {customerCareItems.map(renderSettingsItem)}
            </div>
          </div>
        </div>
      </MobileContainer>

      {/* Account Deletion Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl p-6">
          <div className="sr-only">
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Confirm account deletion request
            </DialogDescription>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Are you sure you want to delete your account?
              </h2>
              <p className="text-sm text-gray-600">
                This Action is permanent and cannot be undone.
              </p>
            </div>
            
            <div className="w-full text-left">
              <p className="text-sm font-medium text-gray-900 mb-3">
                Deleting your FuelFriend account will:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Remove all your personal data and saved information.</li>
                <li>• Cancel any active subscriptions or ongoing orders.</li>
                <li>• Erase your payment methods and transaction history.</li>
                <li>• Disable access to the FuelFriend app and services.</li>
              </ul>
            </div>
            
            <div className="w-full">
              <p className="text-sm font-medium text-gray-900 mb-3">
                Tell us why you are leaving (Optional)
              </p>
              <Select value={deleteReason} onValueChange={setDeleteReason}>
                <SelectTrigger className="w-full rounded-full border-gray-300">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {deleteReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full space-y-3">
              <Button 
                onClick={handleDeleteAccount}
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-3 text-base font-medium"
              >
                Delete Account
              </Button>
              
              <Button 
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="w-full rounded-full py-3 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Deletion Success Modal */}
      <Dialog open={showDeleteSuccessModal} onOpenChange={setShowDeleteSuccessModal}>
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl p-8">
          <div className="sr-only">
            <DialogTitle>Account Deleted Successfully</DialogTitle>
            <DialogDescription>
              Your account has been permanently deleted.
            </DialogDescription>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Account has been deleted
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your FuelFriendly account and all associated data have been permanently removed. We're sorry to see you go!
              </p>
            </div>
            
            <Button 
              onClick={handleCreateAccount}
              className="w-auto bg-transparent hover:bg-transparent text-green-600 hover:text-green-700 py-2 text-base font-medium shadow-none underline"
            >
              Create account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
