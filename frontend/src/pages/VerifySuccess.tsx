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
            <img src="/Back.png" alt="Back" className="w-4 h-4" />
          </button>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <img src="/checklist-screen.png" alt="Success" className="w-10 h-10" />
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

        {/* Go to Home Button */}
        <Button
          onClick={handleGoToHome}
          className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins'] mb-12"
        >
          Go to Home
        </Button>

        {/* Phone Illustration */}
        <div className="flex justify-center">
          <img src="/screen-success.png" alt="Success Screen" className="w-48 h-auto" />
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#101010] rounded-full mb-2"></div>
    </div>
  );
}
