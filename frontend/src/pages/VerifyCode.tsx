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

      // If OTP is valid, create fuel friend account in database
      const pendingRegistration = localStorage.getItem("pendingRegistration");
      if (pendingRegistration) {
        const registrationData = JSON.parse(pendingRegistration);
        
        // Prepare fuel friend registration data
        const fuelFriendData = {
          email: email,
          otp: code,
          fullName: registrationData.step1.fullName,
          phoneNumber: registrationData.step1.phoneNumber,
          password: registrationData.step1.password,
          location: registrationData.step2.color || "Jakarta", // Using address field
          deliveryFee: 5000 // Default delivery fee
        };
        
        const registerResponse = await fetch(`${API_BASE_URL}/api/fuel-friends/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fuelFriendData),
        });

        const registerResult = await registerResponse.json();

        if (!registerResponse.ok || !registerResult.success) {
          throw new Error(registerResult.error || registerResult.message || "Registration failed");
        }

        console.log('Fuel friend registration result:', registerResult);

        // Store fuel friend data and JWT token temporarily for success screen
        const responseData = registerResult.data || registerResult;
        const token = responseData.token;
        const fuelFriend = responseData.fuelFriend;
        
        if (token && fuelFriend) {
          localStorage.setItem("tempFuelFriendId", fuelFriend.id);
          localStorage.setItem("tempFuelFriendEmail", fuelFriend.email);
          localStorage.setItem("tempFuelFriendName", fuelFriend.fullName);
          localStorage.setItem("tempJwtToken", token);
          console.log('✅ Token and fuel friend data saved to localStorage');
        } else {
          console.error('No fuel friend data or token in response:', registerResult);
          console.log('Response structure:', { hasData: !!registerResult.data, hasToken: !!responseData.token, hasFuelFriend: !!responseData.fuelFriend });
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="w-full max-w-sm mx-auto space-y-8 pt-8 flex-1 flex flex-col justify-center">
        {/* Email icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M6.66667 13.3333L20 23.3333L33.3333 13.3333M6.66667 30H33.3333C35.1743 30 36.6667 28.5076 36.6667 26.6667V13.3333C36.6667 11.4924 35.1743 10 33.3333 10H6.66667C4.82572 10 3.33333 11.4924 3.33333 13.3333V26.6667C3.33333 28.5076 4.82572 30 6.66667 30Z" stroke="#3AC36C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="20" r="3" fill="#3AC36C"/>
            </svg>
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
            className="w-full h-12 text-base font-semibold rounded-[30px] bg-gradient-to-r from-[#3AC36C] to-[#2A9D5F] hover:from-[#2A9D5F] hover:to-[#1E7A47] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            disabled={isLoading || code.length !== 6}
            data-testid="button-verify"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2">
              <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
                className="text-[#3AC36C] p-0 h-auto font-semibold hover:text-[#2A9D5F] transition-colors duration-300 flex items-center gap-1"
                data-testid="button-resend"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7C1 10.866 4.13401 14 8 14C11.866 14 15 10.866 15 7C15 3.13401 11.866 0 8 0C5.49 0 3.27 1.51 2.32 3.68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M1 3V7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
