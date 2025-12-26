import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { MobileContainer } from "@/components/MobileContainer";

export default function VerifySuccess() {
  const [, setLocation] = useLocation();

  // Auto redirect after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/dashboard");
    }, 3000);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <MobileContainer className="text-center space-y-8">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative"
        >
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto relative">
            <CheckCircle className="w-16 h-16 text-green-600" />
            {/* Sparkle effects */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <Sparkles className="w-6 h-6 text-green-400 absolute -top-2 left-1/2 -translate-x-1/2" />
              <Sparkles className="w-4 h-4 text-green-300 absolute top-4 -right-2" />
              <Sparkles className="w-5 h-5 text-green-500 absolute -bottom-1 -left-3" />
            </motion.div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-bold text-gray-900">Verification Successful!</h1>
          <p className="text-gray-600 text-lg">
            Your email has been verified successfully. Welcome to FuelFriendly!
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="space-y-3"
        >
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">You're all set!</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ Start accepting fuel delivery orders</li>
              <li>✓ Earn money with flexible schedule</li>
              <li>✓ Access to driver dashboard and tools</li>
            </ul>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="space-y-4"
        >
          <Button
            onClick={() => setLocation("/dashboard")}
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full"
          >
            Start Driving
          </Button>
          
          <p className="text-sm text-gray-500">
            Redirecting automatically in 3 seconds...
          </p>
        </motion.div>
      </MobileContainer>
    </div>
  );
}