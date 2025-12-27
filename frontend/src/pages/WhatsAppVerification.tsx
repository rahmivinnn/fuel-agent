import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";

export default function WhatsAppVerification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get phone number from localStorage (from registration)
  const registeredPhone = localStorage.getItem("verificationPhone") || "";

  const handleSendCode = async () => {
    const phoneToUse = phoneNumber || registeredPhone;
    
    if (!phoneToUse) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get email from registration data
      const pendingRegistration = localStorage.getItem("pendingRegistration");
      let email = localStorage.getItem("verificationEmail");
      
      if (pendingRegistration && !email) {
        try {
          const registrationData = JSON.parse(pendingRegistration);
          email = registrationData.step1?.email;
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/api/otp/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phoneNumber: phoneToUse,
          email: email // Send email too for cross-verification
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to send verification code");
      }

      // Store phone for verification page
      localStorage.setItem("verificationPhone", phoneToUse);
      
      toast({
        title: "Code sent!",
        description: "Verification code has been sent to your WhatsApp",
      });
      
      setLocation("/verify-whatsapp-code");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAnotherWay = () => {
    setLocation("/email-verification");
  };

  return (
    <div className="relative w-full max-w-[402px] mx-auto min-h-screen bg-white">
      <div className="px-4 pt-6 pb-8">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-8">
          <button 
            onClick={() => setLocation('/email-verification')}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E5E7EB] text-[#3F4249] hover:text-[#3AC36C] hover:border-[#3AC36C] transition-colors"
          >
            <img src="/icon-back.png" alt="Back" className="w-4 h-4" />
          </button>
        </div>

        {/* WhatsApp Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 text-green-600 text-2xl">📱</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#3F4249] font-['Poppins'] mb-4">WhatsApp Verification</h1>
          <p className="text-sm text-[#606268] font-['Poppins']">
            Enter your phone number to receive verification code
          </p>
        </div>

        {/* Phone Input */}
        <div className="mb-6">
          <Input
            type="tel"
            placeholder="Phone number"
            value={phoneNumber || registeredPhone}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full h-12 rounded-[30px] border border-black/50 px-4 font-['Poppins']"
            disabled={!!registeredPhone}
          />
        </div>

        {/* Send Code Button */}
        <Button
          onClick={handleSendCode}
          className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins'] mb-6"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Code"}
        </Button>

        {/* Try Another Way */}
        <div className="text-center">
          <button
            onClick={handleTryAnotherWay}
            className="text-[#3F4249] font-['Poppins'] underline"
          >
            Try another way
          </button>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#101010] rounded-full mb-2"></div>
    </div>
  );
}