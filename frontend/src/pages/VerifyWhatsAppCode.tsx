import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";

export default function VerifyWhatsAppCode() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const phoneNumber = localStorage.getItem("verificationPhone");
      
      // First verify WhatsApp OTP
      const verifyResponse = await fetch(`${API_BASE_URL}/api/otp/whatsapp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp: code }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyResult.error || "Invalid verification code");
      }

      // If OTP is valid, create account in database
      const pendingRegistration = localStorage.getItem("pendingRegistration");
      if (pendingRegistration) {
        const registrationData = JSON.parse(pendingRegistration);
        
        const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registrationData),
        });

        const registerResult = await registerResponse.json();

        if (!registerResponse.ok) {
          throw new Error(registerResult.error || "Registration failed");
        }

        // Store customer data temporarily for success screen
        localStorage.setItem("tempCustomerId", registerResult.customer.id);
        localStorage.setItem("tempCustomerEmail", registerResult.customer.email);
        localStorage.setItem("tempCustomerName", registerResult.customer.fullName);
        
        // Clear pending registration
        localStorage.removeItem("pendingRegistration");
      }

      setLocation("/verify-success");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      const phoneNumber = localStorage.getItem("verificationPhone");
      
      const response = await fetch(`${API_BASE_URL}/api/otp/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to resend code");
      }

      toast({
        title: "Code resent!",
        description: "New verification code has been sent to your WhatsApp",
      });
      setCountdown(59);
      setCanResend(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend code",
        variant: "destructive",
      });
    }
  };

  const phoneNumber = localStorage.getItem("verificationPhone") || "";

  return (
    <div className="relative w-full max-w-[402px] mx-auto min-h-screen bg-white">
      <div className="px-4 pt-6 pb-8">
        {/* Back button */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setLocation("/whatsapp-verification")}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E5E7EB] text-[#3F4249] hover:text-[#3AC36C] hover:border-[#3AC36C] transition-colors"
          >
            <img src="/icon-back.png" alt="Back" className="w-4 h-4" />
          </button>
        </div>
        
        {/* WhatsApp icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 text-green-600 text-2xl">📱</div>
          </div>
        </div>
        
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold text-[#3F4249] font-['Poppins']">Verify code</h1>
          <p className="text-sm text-[#606268] font-['Poppins']">
            Enter six-digits verification code sent
          </p>
          <p className="text-sm text-[#606268] font-['Poppins']">
            to {phoneNumber}
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            data-testid="input-otp"
          >
            <InputOTPGroup className="gap-3">
              <InputOTPSlot index={0} className="w-14 h-14 text-xl rounded-xl border-2" />
              <InputOTPSlot index={1} className="w-14 h-14 text-xl rounded-xl border-2" />
              <InputOTPSlot index={2} className="w-14 h-14 text-xl rounded-xl border-2" />
              <InputOTPSlot index={3} className="w-14 h-14 text-xl rounded-xl border-2" />
              <InputOTPSlot index={4} className="w-14 h-14 text-xl rounded-xl border-2" />
              <InputOTPSlot index={5} className="w-14 h-14 text-xl rounded-xl border-2" />
            </InputOTPGroup>
          </InputOTP>

          <Button
            onClick={handleVerify}
            className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins']"
            disabled={isLoading || code.length !== 6}
            data-testid="button-verify"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-[#606268] font-['Poppins']">
              Haven't received the verification code?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleResend}
                disabled={!canResend}
                className="text-[#3AC36C] font-semibold font-['Poppins'] hover:text-[#3AC36C]/80 disabled:text-gray-400"
                data-testid="button-resend"
              >
                Resend
              </button>
              {!canResend && (
                <span className="text-sm text-[#606268] font-['Poppins']">{countdown}s</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#101010] rounded-full mb-2"></div>
    </div>
  );
}