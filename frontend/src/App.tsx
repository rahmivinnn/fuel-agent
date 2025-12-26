import { Switch, Route } from "wouter";
import PageTransition from "@/components/PageTransition";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import AllOrders from "@/pages/AllOrders";
import MyOrders from "@/pages/Tracking"; // Renamed from Tracking to MyOrders
import Wallet from "@/pages/Wallet";
import Settings from "@/pages/Settings";
import ManagePassword from "@/pages/ManagePassword";
import NotificationSettings from "@/pages/NotificationSettings";
import SupportHelp from "@/pages/SupportHelp";
import LiveChatSupport from "@/pages/LiveChatSupport";
import ReportIssue from "@/pages/ReportIssue";
import TermsConditions from "@/pages/TermsConditions";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TrackCustomer from "@/pages/TrackCustomer";
import Message from "@/pages/Message";
import Notifications from "@/pages/Notifications";
import EmailVerification from "@/pages/EmailVerification";
import VerifyCode from "@/pages/VerifyCode";
import VerifySuccess from "@/pages/VerifySuccess";
import FaceVerification from "@/pages/FaceVerification";
import WhatsAppVerification from "@/pages/WhatsAppVerification";
import VerifyWhatsAppCode from "@/pages/VerifyWhatsAppCode";
import WhatsAppLogin from "@/pages/WhatsAppLogin";
import { useEffect, useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import TestComponent from "./TestComponent";

function Router() {
  return (
    <PageTransition>
      <Switch>
        <Route path="/test" component={TestComponent} />
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        {/* Added app pages */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/orders" component={AllOrders} />
        <Route path="/my-orders" component={MyOrders} /> {/* Changed from /tracking to /my-orders */}
        <Route path="/wallet" component={Wallet} />
        <Route path="/settings" component={Settings} />
        <Route path="/manage-password" component={ManagePassword} />
        <Route path="/notification-settings" component={NotificationSettings} />
        <Route path="/support-help" component={SupportHelp} />
        <Route path="/live-chat-support" component={LiveChatSupport} />
        <Route path="/report-issue" component={ReportIssue} />
        <Route path="/terms-conditions" component={TermsConditions} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/track-customer/:id" component={TrackCustomer} />
        <Route path="/message/:id" component={Message} />
        <Route path="/notifications" component={Notifications} />
        {/* Verification flow */}
        <Route path="/email-verification" component={EmailVerification} />
        <Route path="/whatsapp-verification" component={WhatsAppVerification} />
        <Route path="/verify-code" component={VerifyCode} />
        <Route path="/verify-whatsapp-code" component={VerifyWhatsAppCode} />
        <Route path="/verify-success" component={VerifySuccess} />
        <Route path="/face-verification" component={FaceVerification} />
        <Route path="/whatsapp-login" component={WhatsAppLogin} />
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

function App() {
  // Show green splash on initial mount, then hide after animations
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <SplashScreen show={showSplash} />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;