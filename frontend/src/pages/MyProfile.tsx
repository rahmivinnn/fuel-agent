import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit, Star, MapPin, Camera, Loader2 } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

export default function MyProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    about: "",
    location: "",
    services: [] as string[],
    avatar: ""
  });

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
        
        const [firstName, ...lastNameParts] = customer.fullName.split(' ');
        const lastName = lastNameParts.join(' ');
        
        setUserData({
          firstName: firstName || '',
          lastName: lastName || '',
          fullName: customer.fullName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          about: customer.about || 'Fuel Friend is a reliable on-demand fuel delivery service designed to provide convenience and efficiency to customers. Whether you\'re stranded on the road or simply looking to avoid the hassle of gas stations, our trusted Fuel Friends ensure that you get quality fuel delivered right to your location.',
          location: customer.location || 'Abc Tennessee',
          services: customer.services || ['Groceries delivery', 'Fuel refueling'],
          avatar: customer.avatar || ''
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Fallback to localStorage data
        const storedName = localStorage.getItem('customerName') || 'Shah Hussain';
        const [firstName, ...lastNameParts] = storedName.split(' ');
        const lastName = lastNameParts.join(' ');
        
        setUserData({
          firstName: firstName || '',
          lastName: lastName || '',
          fullName: storedName,
          email: localStorage.getItem('customerEmail') || 'user@example.com',
          phoneNumber: localStorage.getItem('userPhone') || '+1234567890',
          about: 'Fuel Friend is a reliable on-demand fuel delivery service designed to provide convenience and efficiency to customers. Whether you\'re stranded on the road or simply looking to avoid the hassle of gas stations, our trusted Fuel Friends ensure that you get quality fuel delivered right to your location.',
          location: 'Abc Tennessee',
          services: ['Groceries delivery', 'Fuel refueling'],
          avatar: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setLocation, toast]);

  const handleSave = async () => {
    setSaving(true);
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

      const updatedData = {
        ...userData,
        fullName: `${userData.firstName} ${userData.lastName}`.trim()
      };

      await apiService.updateCustomer(customerId, updatedData);
      
      // Update localStorage
      localStorage.setItem('customerName', updatedData.fullName);
      localStorage.setItem('userAbout', updatedData.about);
      localStorage.setItem('userLocation', updatedData.location);
      localStorage.setItem('userServices', JSON.stringify(updatedData.services));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully",
      });
      
      setLocation('/dashboard');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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
            className="text-gray-600"
          >
            <Edit className="w-5 h-5" />
          </Button>
        </div>

        <div className="py-6 space-y-6">
          {/* Profile Photo Section */}
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600">
                {userData.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                    {userData.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                Upload a Photo
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{userData.fullName}</h2>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-700 font-medium">4.8</span>
              <span className="text-gray-500 text-sm">(128 reviews)</span>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <Input
                value={userData.firstName}
                onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                className="rounded-full border-gray-300"
                placeholder="Robin Sharma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <Input
                value={userData.lastName}
                onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                className="rounded-full border-gray-300"
                placeholder="Robin Sharma"
              />
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">About</h3>
              <Edit className="w-4 h-4 text-gray-400" />
            </div>
            <Textarea
              value={userData.about}
              onChange={(e) => setUserData({...userData, about: e.target.value})}
              className="min-h-[100px] border-gray-300 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Location Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Location</h3>
              <Edit className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-red-500" />
              <Input
                value={userData.location}
                onChange={(e) => setUserData({...userData, location: e.target.value})}
                className="border-none p-0 text-sm bg-transparent focus:ring-0"
                placeholder="Enter your location"
              />
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My services</h3>
              <Edit className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              {userData.services.map((service: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 text-sm">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </MobileContainer>
      <BottomNav />
    </div>
  );
}