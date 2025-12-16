import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

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
      const email = localStorage.getItem("verificationEmail") || localStorage.getItem("customerEmail");
      
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Invalid verification code");
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
      const email = localStorage.getItem("verificationEmail") || localStorage.getItem("customerEmail");
      
      const response = await fetch("/api/auth/email-verification", {
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

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="w-full max-w-sm mx-auto space-y-6 pt-16">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Verify code</h1>
          <p className="text-xs text-muted-foreground">
            Enter six-digits verification code sent to your email
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            data-testid="input-otp"
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className="w-12 h-12 text-lg rounded-lg" />
              <InputOTPSlot index={1} className="w-12 h-12 text-lg rounded-lg" />
              <InputOTPSlot index={2} className="w-12 h-12 text-lg rounded-lg" />
              <InputOTPSlot index={3} className="w-12 h-12 text-lg rounded-lg" />
              <InputOTPSlot index={4} className="w-12 h-12 text-lg rounded-lg" />
              <InputOTPSlot index={5} className="w-12 h-12 text-lg rounded-lg" />
            </InputOTPGroup>
          </InputOTP>

          <Button
            onClick={handleVerify}
            className="w-full h-10 text-sm font-semibold rounded-lg"
            disabled={isLoading || code.length !== 6}
            data-testid="button-verify"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Haven't received the verification code?
            </p>
            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={!canResend}
              className="text-primary p-0 h-auto font-semibold"
              data-testid="button-resend"
            >
              Resend
            </Button>
            {!canResend && (
              <p className="text-xs text-muted-foreground">{countdown}s</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
