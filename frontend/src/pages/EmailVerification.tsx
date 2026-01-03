import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
      const url = 'https://api.kelolahrd.life/api/auth/otp/email/send';
      
      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email: emailToUse })
      });
      
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Failed to send verification code");
      }

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
    <div className="relative w-full max-w-[402px] mx-auto min-h-screen bg-white">
      <div className="px-4 pt-6 pb-8">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-8">
          <button 
            onClick={() => setLocation('/register')}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E5E7EB] text-[#3F4249] hover:text-[#3AC36C] hover:border-[#3AC36C] transition-colors"
          >
            <img src="/Back.png" alt="Back" className="w-4 h-4" />
          </button>
        </div>

        {/* Email Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <img src="/inbox.png" alt="Email" className="w-10 h-10" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#3F4249] font-['Poppins'] mb-4">Email Verification</h1>
          <p className="text-sm text-[#606268] font-['Poppins']">
            Enter your email address to receive verification code
          </p>
        </div>

        {/* Email Input */}
        <div className="mb-6">
          <Input
            type="email"
            placeholder="Email address"
            value={email || registeredEmail}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 rounded-[30px] border border-black/50 px-4 font-['Poppins']"
            disabled={!!registeredEmail}
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