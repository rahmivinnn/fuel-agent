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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Email Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M6.66667 13.3333L20 23.3333L33.3333 13.3333M6.66667 30H33.3333C35.1743 30 36.6667 28.5076 36.6667 26.6667V13.3333C36.6667 11.4924 35.1743 10 33.3333 10H6.66667C4.82572 10 3.33333 11.4924 3.33333 13.3333V26.6667C3.33333 28.5076 4.82572 30 6.66667 30Z" stroke="#3AC36C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
          <div className="relative">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <path d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <Input
              type="email"
              placeholder="Email address"
              value={email || registeredEmail}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-[30px] border border-black/50 pl-12 pr-4 font-['Poppins']"
              disabled={!!registeredEmail}
            />
          </div>
        </div>

        {/* Send Code Button */}
        <Button
          onClick={handleSendCode}
          className="w-full h-12 rounded-[30px] bg-gradient-to-r from-[#3AC36C] to-[#2A9D5F] hover:from-[#2A9D5F] hover:to-[#1E7A47] text-white font-semibold font-['Poppins'] mb-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          disabled={isLoading}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2">
            <path d="M14.6667 2L7.33333 9.33333L4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isLoading ? "Sending..." : "Send Code"}
        </Button>

        {/* Try Another Way */}
        <div className="text-center">
          <button
            onClick={handleTryAnotherWay}
            className="flex items-center justify-center gap-2 mx-auto text-[#3F4249] font-['Poppins'] hover:text-[#3AC36C] transition-colors duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1V3M8 13V15M15 8H13M3 8H1M12.364 12.364L10.95 10.95M5.05 5.05L3.636 3.636M12.364 3.636L10.95 5.05M5.05 10.95L3.636 12.364" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Try another way
          </button>
        </div>
      </div>
    </div>
  );
}