import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fuel, Truck, Clock, Shield, Star, Users, MapPin } from "lucide-react";
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

  const features = [
    { icon: Fuel, title: "Fuel Delivery", desc: "On-demand fuel delivery service", color: "bg-blue-100 text-blue-600" },
    { icon: Clock, title: "Fast Service", desc: "Average delivery in 15-30 minutes", color: "bg-green-100 text-green-600" },
    { icon: Shield, title: "Safe & Secure", desc: "Licensed drivers & secure payments", color: "bg-purple-100 text-purple-600" },
    { icon: Truck, title: "Flexible Schedule", desc: "Work on your own schedule", color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <MobileContainer className="text-center space-y-8">
          {/* Logo & Branding */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl" />
              <img 
                src="/logo.png" 
                alt="FuelFriendly" 
                className="relative w-32 h-32 mx-auto object-contain"
              />
            </div>
            <div>
              <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
                🚚 Join 500+ Active Drivers
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                Start Earning with
                <span className="text-green-600 block">FuelFriendly</span>
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Deliver fuel to customers and earn money on your own schedule
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4 w-full"
          >
            <Button 
              asChild 
              className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/login">
                🚀 Start Driving Today
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              className="w-full h-14 border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold rounded-2xl text-lg"
            >
              <Link href="/register">
                📝 Join as New Driver
              </Link>
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-green-50 to-blue-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline"
              className="w-full h-12 border-gray-300 text-gray-700 hover:bg-white font-semibold rounded-2xl bg-white/80 backdrop-blur-sm"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              <FcGoogle className="w-5 h-5 mr-3" />
              {isGoogleLoading ? "Connecting..." : "Google"}
            </Button>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose FuelFriendly?</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-green-600 mr-1" />
                  <div className="text-2xl font-bold text-green-600">500+</div>
                </div>
                <div className="text-xs text-gray-600">Active Drivers</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Truck className="w-5 h-5 text-blue-600 mr-1" />
                  <div className="text-2xl font-bold text-blue-600">10K+</div>
                </div>
                <div className="text-xs text-gray-600">Deliveries</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <div className="text-2xl font-bold text-yellow-600">4.8</div>
                </div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Available in 25+ cities nationwide</span>
              </div>
            </div>
          </motion.div>

          {/* Testimonial */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50"
          >
            <div className="flex items-center gap-1 mb-3 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 text-sm italic mb-3">
              "I've been driving with FuelFriendly for 6 months and love the flexibility. Great way to earn extra income!"
            </p>
            <p className="text-xs text-gray-500 font-medium">- Sarah M., Driver since 2023</p>
          </motion.div>
        </MobileContainer>
      </div>
    </div>
  );
}