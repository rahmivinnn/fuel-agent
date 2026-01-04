import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Fuel } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MobileContainer } from "@/components/MobileContainer";
import { motion } from "framer-motion";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      toast({ title: "Google Sign-In", description: "Starting sign-in..." });
      await new Promise((r) => setTimeout(r, 800));
      toast({ title: "Success", description: "Signed in with Google." });
      setLocation("/dashboard");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <img 
        src="/Rectangle.png" 
        alt="" 
        className="absolute -top-20 left-0 w-full h-auto object-cover z-0 rotate-180"
      />
      <img 
        src="/Rectangle.png" 
        alt="" 
        className="absolute -bottom-20 left-0 w-full h-auto object-cover z-0"
      />
      <img 
        src="/hexagon.png" 
        alt="" 
        className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-64 h-64 object-contain z-5 opacity-20"
      />
      
      <MobileContainer className="flex flex-col items-center justify-center min-h-screen py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full space-y-6"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center text-center space-y-2"
          >
            <motion.img 
              src="/logo.png" 
              alt="Logo" 
              className="w-48 h-48 object-contain"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-4"
          >
            <Button 
              asChild 
              className="w-full h-12 text-base font-normal bg-gradient-to-r from-[#3AC36C] to-[#2A9D5F] hover:from-[#2A9D5F] hover:to-[#1E7A47] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              data-testid="button-login"
            >
              <Link href="/login" className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 2L10 2C11.1046 2 12 2.89543 12 4V12C12 13.1046 11.1046 14 10 14H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9 8H2M2 8L4 6M2 8L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Log In
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              className="w-full h-12 text-base font-normal border-2 border-[#3AC36C] text-[#3AC36C] hover:bg-[#3AC36C] hover:text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
              data-testid="button-signup"
            >
              <Link href="/register" className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M14 15C14 11.134 11.866 8 8 8C4.13401 8 2 11.134 2 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Sign up
              </Link>
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">Or</span>
              </div>
            </div>

            <Button 
              variant="outline"
              className="w-full h-12 text-base font-normal flex items-center justify-center gap-2 text-foreground border-2 border-gray-300 hover:border-[#4285F4] hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              aria-busy={isGoogleLoading}
              data-testid="button-google-signin"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mr-2">
                <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC04"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              {isGoogleLoading ? "Connecting..." : "Continue with Google"}
            </Button>
          </motion.div>
        </motion.div>
      </MobileContainer>
    </div>
  );
}