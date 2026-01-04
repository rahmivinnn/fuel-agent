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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* WhatsApp Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 3.33333C11.16 3.33333 4 10.4933 4 19.3333C4 22.4 4.86667 25.2667 6.36667 27.7333L4 36L12.5333 33.7333C14.9333 35.1333 17.7333 35.9333 20.6667 35.9333C29.5067 35.9333 36.6667 28.7733 36.6667 19.9333C36.6667 15.7333 35.0667 11.8 32.2 9.06667C29.3333 6.33333 25.3333 4.73333 21.1333 4.73333C20.7333 4.73333 20.3667 4.73333 20 4.73333V3.33333Z" fill="#25D366"/>
              <path d="M20 6.66667C28.84 6.66667 36 13.8267 36 22.6667C36 31.5067 28.84 38.6667 20 38.6667C17.3333 38.6667 14.8 37.9333 12.6 36.6667L6.66667 38.6667L8.66667 32.7333C7.2 30.4 6.33333 27.6667 6.33333 24.6667C6.33333 15.8267 13.4933 8.66667 22.3333 8.66667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
          <div className="relative">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <path d="M18.3333 14.1V16.6C18.3342 16.8321 18.2866 17.0618 18.1936 17.2745C18.1006 17.4871 17.9644 17.678 17.7933 17.8349C17.6222 17.9917 17.4204 18.1112 17.2005 18.1856C16.9806 18.26 16.7475 18.2876 16.5167 18.2667C13.9523 17.988 11.4891 17.1118 9.32499 15.7083C7.31151 14.4288 5.60445 12.7218 4.32499 10.7083C2.91663 8.53435 2.04019 6.05908 1.76666 3.48333C1.74583 3.25309 1.77321 3.02063 1.84707 2.80106C1.92092 2.58148 2.03963 2.37999 2.19584 2.20888C2.35205 2.03777 2.54224 1.90108 2.75421 1.80763C2.96618 1.71417 3.19544 1.66608 3.42666 1.66667H5.92666C6.32435 1.66267 6.71139 1.79146 7.02248 2.02834C7.33358 2.26521 7.54471 2.59695 7.61999 2.975C7.7611 3.72502 7.9947 4.45669 8.31666 5.15833C8.42335 5.39991 8.46073 5.66815 8.42483 5.93224C8.38893 6.19634 8.28085 6.44361 8.10832 6.64167L6.94166 7.80833C8.06847 9.91383 9.75283 11.5982 11.8583 12.725L13.025 11.5583C13.223 11.3858 13.4703 11.2777 13.7344 11.2418C13.9985 11.2059 14.2667 11.2433 14.5083 11.35C15.21 11.672 15.9417 11.9056 16.6917 12.0467C17.0737 12.1228 17.4098 12.3375 17.6495 12.6531C17.8892 12.9687 18.0158 13.3626 18.0083 13.7642" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <Input
              type="tel"
              placeholder="Phone number"
              value={phoneNumber || registeredPhone}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full h-12 rounded-[30px] border border-black/50 pl-12 pr-4 font-['Poppins']"
              disabled={!!registeredPhone}
            />
          </div>
        </div>

        {/* Send Code Button */}
        <Button
          onClick={handleSendCode}
          className="w-full h-12 rounded-[30px] bg-gradient-to-r from-[#25D366] to-[#1DA851] hover:from-[#1DA851] hover:to-[#128C3A] text-white font-semibold font-['Poppins'] mb-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
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