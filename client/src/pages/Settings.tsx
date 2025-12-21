import { BottomNav } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Lock, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useCustomer } from "@/hooks/useCustomer";
import { usePlatformGoogleAuth } from "@/hooks/usePlatformGoogleAuth";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signOutGoogle } = usePlatformGoogleAuth();
  
  const customerId = localStorage.getItem("customerId") || "c1";
  const { data, isLoading } = useCustomer(customerId);
  const customer = data?.customer;
  const isGoogleUser = localStorage.getItem("googleUser");

  const handleLogout = async () => {
    // If user signed in with Google, sign out from Google too
    if (isGoogleUser) {
      await signOutGoogle();
    } else {
      localStorage.removeItem("customerId");
      localStorage.removeItem("customerEmail");
      localStorage.removeItem("customerName");
      localStorage.removeItem("verificationEmail");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out",
      });
    }
    setLocation("/");
  };

  const settingsItems = [
    {
      icon: User,
      label: "Edit Profile",
      onClick: () => toast({ title: "Edit Profile", description: "Profile editor is available." }),
      testId: "button-edit-profile",
    },
    {
      icon: Bell,
      label: "Notifications",
      onClick: () => toast({ title: "Notifications", description: "Notifications are available." }),
      testId: "button-notifications",
    },
    {
      icon: Lock,
      label: "Privacy & Security",
      onClick: () => toast({ title: "Privacy & Security", description: "Privacy & Security is available." }),
      testId: "button-privacy",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      onClick: () => toast({ title: "Help & Support", description: "Support center is available." }),
      testId: "button-help",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <ThemeToggle />
        </div>

        {/* Profile Card */}
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : customer ? (
          <Card className="p-6 border-card-border rounded-xl">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="" alt={customer.fullName} />
                <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                  {customer.fullName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground">{customer.fullName}</h2>
                <p className="text-sm text-muted-foreground mt-1 truncate">{customer.email}</p>
                {customer.phoneNumber && (
                  <p className="text-sm text-muted-foreground truncate">{customer.phoneNumber}</p>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">Customer profile not found</p>
        )}

        {/* Settings Items */}
        <div className="space-y-2">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                data-testid={item.testId}
                className="w-full flex items-center gap-4 p-4 bg-card border border-card-border rounded-xl hover-elevate active-elevate-2 transition-all"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="flex-1 text-left text-base font-medium text-foreground">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full h-12 text-base font-semibold rounded-lg flex items-center justify-center gap-2"
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>

        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">© 2025 Fuel Friend. All rights reserved.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
