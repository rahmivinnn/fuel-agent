import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Camera, Edit, MapPin } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { apiService } from "@/lib/api";

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Initialize state with current user data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocationText] = useState("");
  const [services, setServices] = useState(["Groceries delivery", "Fuel refueling"]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Load user data on component mount
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
        
        const nameParts = customer.fullName.split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        setEmail(customer.email);
        setPhoneNumber(customer.phoneNumber);
        setAbout(customer.about || "Fuel Friend is a reliable on-demand fuel delivery service designed to provide convenience and efficiency to customers.");
        setLocationText(customer.location || "");
        setServices(customer.services || ["Groceries delivery", "Fuel refueling"]);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast({
          title: "Warning",
          description: "Failed to load profile data, using cached data",
          variant: "destructive"
        });
        
        // Fallback to localStorage data
        const fullName = localStorage.getItem("customerName") || 
                         localStorage.getItem("driverName") || 
                         "Robin Sharma";
        
        const nameParts = fullName.split(" ");
        setFirstName(nameParts[0] || "Robin");
        setLastName(nameParts.slice(1).join(" ") || "Sharma");
        setEmail(localStorage.getItem("customerEmail") || "");
        setPhoneNumber(localStorage.getItem("userPhone") || "");
        setAbout(localStorage.getItem("userAbout") || "Fuel Friend is a reliable on-demand fuel delivery service designed to provide convenience and efficiency to customers.");
        setLocationText(localStorage.getItem("userLocation") || "Abc Tennessee");
        
        const savedServices = localStorage.getItem("userServices");
        if (savedServices) {
          setServices(JSON.parse(savedServices));
        }
      } finally {
        setDataLoading(false);
      }
    };

    fetchUserData();
  }, [setLocation, toast]);

  const handleSaveChanges = async () => {
    // Validate inputs
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }

    if (about.trim().length < 10) {
      toast({
        title: "Validation Error",
        description: "About section must be at least 10 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const customerId = localStorage.getItem('customerId');
      if (!customerId) {
        throw new Error('User not found');
      }

      const newFullName = `${firstName.trim()} ${lastName.trim()}`;
      const updateData = {
        fullName: newFullName,
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        about: about.trim(),
        location: location.trim(),
        services: services
      };

      await apiService.updateCustomer(customerId, updateData);
      
      // Update localStorage as backup
      localStorage.setItem("customerName", newFullName);
      localStorage.setItem("driverName", newFullName);
      localStorage.setItem("customerEmail", email.trim());
      localStorage.setItem("userPhone", phoneNumber.trim());
      localStorage.setItem("userAbout", about.trim());
      localStorage.setItem("userLocation", location.trim());
      localStorage.setItem("userServices", JSON.stringify(services));
      
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = () => {
    const newService = prompt("Enter new service:");
    if (newService && newService.trim()) {
      setServices(prev => [...prev, newService.trim()]);
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadPhoto = () => {
    toast({
      title: "Upload Photo",
      description: "Photo upload feature coming soon",
    });
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          <p className="text-gray-600">Loading profile...</p>
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
          <h1 className="text-xl font-semibold text-gray-900">My profile</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600"
          >
            <Edit className="w-5 h-5" />
          </Button>
        </div>

        <div className="py-6 space-y-6">
          {/* Profile Photo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleUploadPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Upload a photo</p>
          </motion.div>

          {/* Name Fields */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                First Name
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12 rounded-full border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Last Name
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12 rounded-full border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="Last Name"
              />
            </div>
          </motion.div>

          {/* Email Field */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-full border-gray-300 focus:border-green-500 focus:ring-green-500"
              placeholder="Email address"
            />
          </motion.div>

          {/* Phone Field */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Phone Number
            </label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-12 rounded-full border-gray-300 focus:border-green-500 focus:ring-green-500"
              placeholder="Phone number"
            />
          </motion.div>

          {/* About Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">About</h3>
              <Edit className="w-4 h-4 text-gray-400" />
            </div>
            <Textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="min-h-[100px] rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
              placeholder="Tell us about yourself..."
            />
          </motion.div>

          {/* Location Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Location</h3>
              <Edit className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl">
              <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
              <Input
                value={location}
                onChange={(e) => setLocationText(e.target.value)}
                className="flex-1 border-none bg-transparent focus:ring-0 focus:border-none p-0 text-gray-700"
                placeholder="Enter your location"
              />
            </div>
          </motion.div>

          {/* Services Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My services</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddService}
                className="text-green-600 hover:text-green-700 p-1 h-auto"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 text-sm">{service}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveService(index)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 p-1 h-auto transition-opacity"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddService}
                className="w-full mt-2 border-dashed border-green-300 text-green-600 hover:bg-green-50"
              >
                + Add Service
              </Button>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-4"
          >
            <Button
              onClick={handleSaveChanges}
              disabled={isLoading}
              className="w-full h-12 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold rounded-full"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>
        </div>
      </MobileContainer>
      <BottomNav />
    </div>
  );
}