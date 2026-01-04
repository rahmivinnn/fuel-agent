import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function VerifySuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleGoToHome = () => {
    // Get JWT token from registration response
    const jwtToken = localStorage.getItem("tempJwtToken");
    
    if (jwtToken) {
      // Store only token, user data will be fetched via useAuth hook
      localStorage.setItem("token", jwtToken);
      
      // Clear all temporary data
      localStorage.removeItem("tempJwtToken");
      localStorage.removeItem("tempFuelFriendId");
      localStorage.removeItem("tempFuelFriendEmail");
      localStorage.removeItem("tempFuelFriendName");
      localStorage.removeItem("verificationEmail");
      localStorage.removeItem("verificationPhone");
      localStorage.removeItem("pendingRegistration");
      
      console.log('✅ Registration completed, token saved');
      
      toast({
        title: "Welcome!",
        description: "Your account is now active and ready to use",
      });
      
      setLocation("/dashboard");
    } else {
      console.error('❌ No token found from registration');
      
      toast({
        title: "Error",
        description: "Registration incomplete. Please try again.",
        variant: "destructive",
      });
      
      setLocation("/register");
    }
  };

  return (
    <div className="relative w-full max-w-[402px] mx-auto min-h-screen bg-white">
      <div className="px-4 pt-6 pb-8">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setLocation("/verify-code")}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E5E7EB] text-[#3F4249] hover:text-[#3AC36C] hover:border-[#3AC36C] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="#3AC36C"/>
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3F4249] font-['Poppins'] mb-4">
            Email verified Successfully!
          </h1>
          <p className="text-sm text-[#606268] font-['Poppins']">
            Your account is ready to use.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 mb-8">
          <Button
            onClick={handleGoToHome}
            className="w-full h-12 rounded-[30px] bg-gradient-to-r from-[#3AC36C] to-[#2A9D5F] hover:from-[#2A9D5F] hover:to-[#1E7A47] text-white font-semibold font-['Poppins'] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2">
              <path d="M2 8L8 2L14 8M8 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go to Home
          </Button>
          
          <Button
            onClick={() => setLocation("/kyc-verification")}
            variant="outline"
            className="w-full h-12 rounded-[30px] border-2 border-[#3AC36C] text-[#3AC36C] bg-white hover:bg-green-50 font-semibold font-['Poppins'] shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2">
              <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M14 15C14 11.134 11.866 8 8 8C4.13401 8 2 11.134 2 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 4L12 6L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Complete Identity Verification
          </Button>
        </div>

        {/* Phone Illustration */}
        <div className="flex justify-center">
          <img src="/screen-success.png" alt="Success Screen" className="w-48 h-auto" />
        </div>
      </div>
    </div>
  );
}
