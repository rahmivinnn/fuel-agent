import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Send, Loader2 } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

export default function EmailVerification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get email from localStorage (from registration)
  const registeredEmail = localStorage.getItem("verificationEmail") || "";

  const handleSendCode = async () => {
    const emailToUse = email || registeredEmail;
    
    if (!emailToUse) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/email-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send verification code");
      }

      // Store email for verification page
      localStorage.setItem("verificationEmail", emailToUse);
      
      toast({
        title: "Code sent!",
        description: "Verification code has been sent to your email",
      });
      
      setLocation("/verify-code");
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
    setLocation("/whatsapp-verification");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
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
            onClick={() => setLocation('/register')}
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
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Check Your Email</h1>
          <p className="text-gray-600 leading-relaxed">
            We'll send a verification code to your email address to confirm your account
          </p>
        </motion.div>

        {/* Email Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email || registeredEmail}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={!!registeredEmail}
            />
            {registeredEmail && (
              <p className="text-xs text-gray-500 mt-2">
                Using email from registration
              </p>
            )}
          </div>

          {/* Send Code Button */}
          <Button
            onClick={handleSendCode}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Code...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Verification Code
              </>
            )}
          </Button>

          {/* Try Another Way */}
          <div className="text-center">
            <button
              onClick={handleTryAnotherWay}
              className="text-blue-600 font-medium hover:text-blue-700 underline"
            >
              Try WhatsApp verification instead
            </button>
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
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• We'll send a 6-digit code to your email</li>
                <li>• Enter the code to verify your account</li>
                <li>• Start earning with FuelFriendly!</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </MobileContainer>
    </div>
  );
}