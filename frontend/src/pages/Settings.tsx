import { BottomNav } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Info, 
  CreditCard, 
  Bell, 
  Palette, 
  HelpCircle, 
  FileText, 
  Shield, 
  Trash2 
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { MobileContainer } from "@/components/MobileContainer";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
      onClick: () => toast({ title: "Privacy", description: "Privacy policy coming soon" }),
    },
    {
      icon: Trash2,
      label: "Request Account Deletion",
      onClick: () => toast({ title: "Account Deletion", description: "Account deletion request coming soon", variant: "destructive" }),
    },
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

      <BottomNav />
    </div>
  );
}
