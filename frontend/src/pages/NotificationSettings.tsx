import { useState } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Bell, Shield } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { useToast } from "@/hooks/use-toast";

export default function NotificationSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    orderUpdates: true,
    reviewReminders: true,
    securityAlerts: false,
    earningsUpdates: true,
    systemUpdates: true,
    safetyAlerts: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved",
    });
  };

  const notificationItems = [
    {
      key: 'orderUpdates' as keyof typeof settings,
      icon: Bell,
      title: "Order Updates",
      description: "Get notified about your fuel order status",
      enabled: settings.orderUpdates,
    },
    {
      key: 'reviewReminders' as keyof typeof settings,
      icon: Bell,
      title: "Review & Rating Reminders",
      description: "Get reminders to rate and review completed deliveries.",
      enabled: settings.reviewReminders,
    },
    {
      key: 'securityAlerts' as keyof typeof settings,
      icon: Shield,
      title: "Account & Security Alerts",
      description: "Get notified of login attempts, password changes, or suspicious activity.",
      enabled: settings.securityAlerts,
    },
    {
      key: 'earningsUpdates' as keyof typeof settings,
      icon: Bell,
      title: "Earnings Updates",
      description: "Get alerts for app updates, security notices, and policy changes.",
      enabled: settings.earningsUpdates,
    },
    {
      key: 'systemUpdates' as keyof typeof settings,
      icon: Bell,
      title: "System Updates",
      description: "Receive notifications for completed payments and withdrawals.",
      enabled: settings.systemUpdates,
    },
    {
      key: 'safetyAlerts' as keyof typeof settings,
      icon: Shield,
      title: "Safety Alerts",
      description: "Receive important safety notifications",
      enabled: settings.safetyAlerts,
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileContainer>
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/settings")}
            className="text-gray-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Notification Settings</h1>
        </div>

        <div className="py-6">
          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-600 text-sm leading-relaxed">
              Customize your notification preferences to stay updated.
            </p>
          </div>

          {/* Notification Items */}
          <div className="space-y-6">
            {notificationItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Icon className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={() => handleToggle(item.key)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </MobileContainer>

      <BottomNav />
    </div>
  );
}