import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";

// Veriff integration
declare global {
  interface Window {
    createVeriffFrame: any;
  }
}

export default function KYCVerification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    // Load Veriff SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.veriff.me/sdk/js/1.4.0/veriff.min.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const updateKYCStatus = async (isVerified: boolean, status: string) => {
    try {
      const token = localStorage.getItem("tempJwtToken") || localStorage.getItem("token");
      const fuelFriendId = localStorage.getItem("tempFuelFriendId");
      
      if (!token || !fuelFriendId) return;
      
      const response = await fetch(`${API_BASE_URL}/api/fuel-friends/${fuelFriendId}/kyc-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          isIdentityVerified: isVerified,
          verificationStatus: status
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update KYC status');
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
    }
  };

  const handleStartVerification = async () => {
    setIsLoading(true);
    setVerificationStatus('processing');
    
    try {
      // Get Veriff session from backend
      const token = localStorage.getItem("tempJwtToken") || localStorage.getItem("token");
      const fuelFriendId = localStorage.getItem("tempFuelFriendId");
      
      const sessionResponse = await fetch(`${API_BASE_URL}/api/veriff/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ fuelFriendId }),
      });
      
      const sessionData = await sessionResponse.json();
      
      if (sessionResponse.ok && sessionData.success && window.createVeriffFrame) {
        // Real Veriff integration with actual session
        const veriff = window.createVeriffFrame({
          url: sessionData.data.sessionUrl,
          onEvent: function(msg: string) {
            console.log('Veriff event:', msg);
            if (msg === 'FINISHED') {
              updateKYCStatus(true, 'verified');
              setVerificationStatus('success');
              toast({
                title: "Verification Successful!",
                description: "Your identity has been verified successfully",
              });
            } else if (msg === 'CANCELED') {
              updateKYCStatus(false, 'canceled');
              setVerificationStatus('failed');
              toast({
                title: "Verification Canceled",
                description: "Verification was canceled",
                variant: "destructive",
              });
            }
            setIsLoading(false);
          }
        });
        veriff.mount('#veriff-root');
      } else {
        // Show error instead of fallback simulation
        setVerificationStatus('failed');
        toast({
          title: "Service Unavailable",
          description: "Verification service is currently unavailable. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      await updateKYCStatus(false, 'failed');
      setVerificationStatus('failed');
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSkipForNow = () => {
    const jwtToken = localStorage.getItem("tempJwtToken");
    
    if (jwtToken) {
      localStorage.setItem("token", jwtToken);
      
      localStorage.removeItem("tempJwtToken");
      localStorage.removeItem("tempFuelFriendId");
      localStorage.removeItem("tempFuelFriendEmail");
      localStorage.removeItem("tempFuelFriendName");
      localStorage.removeItem("verificationEmail");
      localStorage.removeItem("pendingRegistration");
      
      toast({
        title: "Welcome!",
        description: "You can complete verification later in settings",
      });
      
      setLocation("/dashboard");
    } else {
      setLocation("/register");
    }
  };

  const handleContinue = () => {
    if (verificationStatus === 'success') {
      handleSkipForNow();
    } else {
      handleStartVerification();
    }
  };

  return (
    <div className="relative w-full max-w-[402px] mx-auto min-h-screen bg-white">
      <div className="px-4 pt-6 pb-8">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setLocation("/verify-success")}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E5E7EB] text-[#3F4249] hover:text-[#3AC36C] hover:border-[#3AC36C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-[#3F4249] font-['Poppins']">Back</span>
        </div>

        {/* Veriff Container */}
        <div id="veriff-root" className="mb-8"></div>

        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            {verificationStatus === 'success' ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : verificationStatus === 'failed' ? (
              <AlertCircle className="w-10 h-10 text-red-600" />
            ) : (
              <Shield className="w-10 h-10 text-blue-600" />
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3F4249] font-['Poppins'] mb-4">
            {verificationStatus === 'success' ? 'Verification Complete!' :
             verificationStatus === 'failed' ? 'Verification Failed' :
             verificationStatus === 'processing' ? 'Verifying Identity...' :
             'Identity Verification'}
          </h1>
          <p className="text-sm text-[#606268] font-['Poppins'] leading-relaxed">
            {verificationStatus === 'success' ? 
              'Your identity has been successfully verified. You can now access all features.' :
             verificationStatus === 'failed' ? 
              'We couldn\'t verify your identity. Please try again or contact support.' :
             verificationStatus === 'processing' ? 
              'Please wait while we verify your documents...' :
              'Complete your identity verification to unlock all features and build trust with customers. This process is secure and takes just a few minutes.'}
          </p>
        </div>

        {/* Benefits List */}
        {verificationStatus === 'idle' && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-[#3F4249] font-['Poppins'] mb-4">Benefits of verification:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#3AC36C] rounded-full"></div>
                <span className="text-sm text-[#606268] font-['Poppins']">Higher customer trust</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#3AC36C] rounded-full"></div>
                <span className="text-sm text-[#606268] font-['Poppins']">Access to premium orders</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#3AC36C] rounded-full"></div>
                <span className="text-sm text-[#606268] font-['Poppins']">Faster payment processing</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#3AC36C] rounded-full"></div>
                <span className="text-sm text-[#606268] font-['Poppins']">Verified badge on profile</span>
              </li>
            </ul>
          </div>
        )}

        {/* Processing Animation */}
        {verificationStatus === 'processing' && (
          <div className="flex justify-center mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3AC36C]"></div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          {verificationStatus === 'idle' && (
            <>
              <Button
                onClick={handleStartVerification}
                className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins']"
                disabled={isLoading}
              >
                {isLoading ? "Starting Verification..." : "Start Verification"}
              </Button>
              
              <Button
                onClick={handleSkipForNow}
                variant="ghost"
                className="w-full text-[#606268] font-semibold font-['Poppins'] hover:bg-gray-50"
              >
                Skip for now
              </Button>
            </>
          )}
          
          {verificationStatus === 'processing' && (
            <Button
              disabled
              className="w-full h-12 rounded-[30px] bg-gray-300 text-gray-500 font-semibold font-['Poppins']"
            >
              Processing...
            </Button>
          )}
          
          {verificationStatus === 'success' && (
            <Button
              onClick={handleContinue}
              className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins']"
            >
              Continue to Dashboard
            </Button>
          )}
          
          {verificationStatus === 'failed' && (
            <>
              <Button
                onClick={handleStartVerification}
                className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins']"
              >
                Try Again
              </Button>
              
              <Button
                onClick={handleSkipForNow}
                variant="ghost"
                className="w-full text-[#606268] font-semibold font-['Poppins'] hover:bg-gray-50"
              >
                Skip for now
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#101010] rounded-full mb-2"></div>
    </div>
  );
}