import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { motion } from "framer-motion";
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
      const email = localStorage.getItem("verificationEmail") || localStorage.getItem("customerEmail");
      
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-code`, {
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
      
      const response = await fetch(`${API_BASE_URL}/api/auth/email-verification`, {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <MobileContainer className="flex-1 flex flex-col justify-center py-8">
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={() => setLocation("/login")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </motion.div>
        
        {/* Email Icon */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Enter Verification Code</h1>
          <p className="text-gray-600 leading-relaxed">
            We sent a 6-digit code to
          </p>
          <p className="text-green-600 font-medium">
            {email}
          </p>
        </motion.div>

        {/* OTP Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              data-testid="input-otp"
            >
              <InputOTPGroup className="gap-3">
                <InputOTPSlot index={0} className="w-14 h-14 text-xl rounded-xl border-2 border-gray-300 focus:border-green-500" />
                <InputOTPSlot index={1} className="w-14 h-14 text-xl rounded-xl border-2 border-gray-300 focus:border-green-500" />
                <InputOTPSlot index={2} className="w-14 h-14 text-xl rounded-xl border-2 border-gray-300 focus:border-green-500" />
                <InputOTPSlot index={3} className="w-14 h-14 text-xl rounded-xl border-2 border-gray-300 focus:border-green-500" />
                <InputOTPSlot index={4} className="w-14 h-14 text-xl rounded-xl border-2 border-gray-300 focus:border-green-500" />
                <InputOTPSlot index={5} className="w-14 h-14 text-xl rounded-xl border-2 border-gray-300 focus:border-green-500" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerify}
            className="w-full h-12 text-base font-semibold rounded-xl bg-green-500 hover:bg-green-600 text-white"
            disabled={isLoading || code.length !== 6}
            data-testid="button-verify"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Code
              </>
            )}
          </Button>

          {/* Resend Section */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={!canResend}
                className="text-green-600 p-0 h-auto font-semibold hover:text-green-700"
                data-testid="button-resend"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Resend Code
              </Button>
              {!canResend && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {countdown}s
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Verification Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check your spam/junk folder if you don't see the email</li>
                <li>• The code expires in 10 minutes</li>
                <li>• You can request a new code if needed</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </MobileContainer>
    </div>
  );
}
