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
      <MobileContainer className="flex flex-col items-center justify-center min-h-screen py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full space-y-8"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <motion.img 
              src="/logo.png" 
              alt="Logo" 
              className="w-24 h-24 object-contain"
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
              className="w-full h-12 text-base font-normal transition-all duration-300"
              data-testid="button-login"
            >
              <Link href="/login">Log In</Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              className="w-full h-12 text-base font-normal transition-all duration-300"
              data-testid="button-signup"
            >
              <Link href="/register">Sign up</Link>
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
              className="w-full h-12 text-base font-normal flex items-center justify-center gap-2 text-black transition-all duration-300"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              aria-busy={isGoogleLoading}
              data-testid="button-google-signin"
            >
              <FcGoogle className="w-5 h-5 mr-2" />
              {isGoogleLoading ? "Connecting..." : "Continue with Google"}
            </Button>
          </motion.div>
        </motion.div>
      </MobileContainer>
    </div>
  );
}