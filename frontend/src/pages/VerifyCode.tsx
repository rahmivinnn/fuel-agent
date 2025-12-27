import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function VerifyCode() {
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
      const email = localStorage.getItem("verificationEmail");
      
      // First verify OTP
      const verifyResponse = await fetch(`${API_BASE_URL}/api/otp/email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyResult.success) {
        throw new Error(verifyResult.error || verifyResult.message || "Invalid verification code");
      }

      console.log('OTP verification successful:', verifyResult);

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

        if (!registerResponse.ok || !registerResult.success) {
          throw new Error(registerResult.error || registerResult.message || "Registration failed");
        }

        console.log('Registration result:', registerResult);

        // Store customer data temporarily for success screen
        if (registerResult.customer) {
          localStorage.setItem("tempCustomerId", registerResult.customer.id);
          localStorage.setItem("tempCustomerEmail", registerResult.customer.email);
          localStorage.setItem("tempCustomerName", registerResult.customer.fullName);
        } else {
          console.error('No customer data in response:', registerResult);
        }
        
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
      const email = localStorage.getItem("verificationEmail");
      
      const response = await fetch(`${API_BASE_URL}/api/otp/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to resend code");
      }

      toast({
        title: "Code resent!",
        description: "New verification code has been sent",
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

  const email = localStorage.getItem("verificationEmail") || localStorage.getItem("customerEmail") || "lorem@gmail.com";

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      {/* Back button */}
      <div className="w-full max-w-sm mx-auto pt-4">
        <button
          onClick={() => setLocation("/login")}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E5E7EB] text-[#3F4249] hover:text-[#3AC36C] hover:border-[#3AC36C] transition-colors"
        >
          <img src="/icon-back.png" alt="Back" className="w-4 h-4" />
        </button>
      </div>
      
      <div className="w-full max-w-sm mx-auto space-y-8 pt-8 flex-1 flex flex-col justify-center">
        {/* Email icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <img src="/inbox1.png" alt="Inbox" className="w-10 h-10" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Verify code</h1>
          <p className="text-sm text-muted-foreground">
            Enter four-digits verification code sent
          </p>
          <p className="text-sm text-muted-foreground">
            to {email}
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
            className="w-full h-12 text-base font-semibold rounded-xl bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading || code.length !== 6}
            data-testid="button-verify"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Haven't received the verification code?
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={!canResend}
                className="text-green-600 p-0 h-auto font-semibold hover:text-green-700"
                data-testid="button-resend"
              >
                Resend
              </Button>
              {!canResend && (
                <span className="text-sm text-muted-foreground">{countdown}s</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
