import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Star, MapPin, LogOut, Loader2 } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { apiService } from "@/lib/api";

export default function MyProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    fullName: string;
    email: string;
    phoneNumber: string;
    about: string;
    location: string;
    services: string[];
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const customerId = localStorage.getItem('customerId');
        if (!customerId) {
          toast({
            title: "Error",
            description: "User not found. Please login again.",
            variant: "destructive"
          });
          setLocation('/login');
          return;
        }

        const response = await apiService.getCustomer(customerId);
        const customer = response.customer;
        
        setUserData({
          fullName: customer.fullName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          about: customer.about || 'Fuel Friend is a reliable on-demand fuel delivery service designed to provide convenience and efficiency to customers.',
          location: customer.location || 'Location not set',
          services: customer.services || ['Groceries delivery', 'Fuel refueling'],
          avatar: customer.avatar
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast({
          title: "Warning",
          description: "Failed to load profile data, using cached data",
          variant: "destructive"
        });
        // Fallback to localStorage data
        setUserData({
          fullName: localStorage.getItem('customerName') || localStorage.getItem('driverName') || 'Shah Hussain',
          email: localStorage.getItem('customerEmail') || 'user@example.com',
          phoneNumber: localStorage.getItem('userPhone') || '+1234567890',
          about: localStorage.getItem('userAbout') || 'Fuel Friend is a reliable on-demand fuel delivery service designed to provide convenience and efficiency to customers.',
          location: localStorage.getItem('userLocation') || 'Abc Tennessee',
          services: JSON.parse(localStorage.getItem('userServices') || '["Groceries delivery", "Fuel refueling"]')
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setLocation, toast]);
  
  // Get user data from storage (fallback)
  const driverName = localStorage.getItem("customerName") || 
                     localStorage.getItem("driverName") || 
                     "Shah Hussain";
  const driverEmail = localStorage.getItem("customerEmail") || "driver@fuelfriendly.com";

  const handleSignOut = () => {
    // Clear all user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userAbout');
    localStorage.removeItem('userLocation');
    localStorage.removeItem('userServices');
    
    toast({
      title: "Signed out successfully",
      description: "You have been logged out",
    });
    
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load profile data</p>
          <Button onClick={() => setLocation('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileContainer>
        {/* Header */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/edit-profile")}
            className="text-gray-600"
          >
            <Edit className="w-5 h-5" />
          </Button>
        </div>

        <div className="py-6 space-y-6">
          {/* Profile Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {driverName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{userData.fullName}</h2>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-700 font-medium">4.8</span>
              <span className="text-gray-500 text-sm">(128 reviews)</span>
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-900">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {userData.about}
            </p>
          </motion.div>

          {/* Location Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-900">My Location</h3>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-sm">{userData.location}</span>
            </div>
          </motion.div>

          {/* Services Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-900">My Services</h3>
            <div className="space-y-2">
              {userData.services.map((service: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 text-sm">{service}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sign Out Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4"
          >
            <Button
              onClick={handleSignOut}
              className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </MobileContainer>
      <BottomNav />
    </div>
  );
}