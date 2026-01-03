import { ArrowLeft, Edit, MapPin, Star, LogOut, Shield, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ViewProfile() {
  const [, setLocation] = useLocation();
  
  const { data: authData, isLoading } = useAuth();
  const currentUser = authData?.fuelFriend; // Use fuelFriend directly
  
  // Debug logs
  console.log('🔍 MyProfile Debug:', {
    authData,
    currentUser,
    isIdentityVerified: currentUser?.isIdentityVerified,
    verificationStatus: currentUser?.verificationStatus,
    profilePhoto: currentUser?.profilePhoto
  });
  
  // Use data from auth API
  const customerName = currentUser?.fullName || 'FuelFriend';
  const userAbout = currentUser?.about || 'Fuel Friend is a reliable on-demand fuel delivery service designed to provide convenience and efficiency to customers.';
  const userLocation = currentUser?.location || 'Location not set';
  const userServices = ['Fuel delivery', 'Emergency refueling'];
  const rating = parseFloat(currentUser?.rating || '0') || 4.8;
  const reviewCount = currentUser?.totalReviews || 0;
  const isVerified = currentUser?.isIdentityVerified || false;
  const verificationStatus = currentUser?.verificationStatus || 'pending';
  const profilePhoto = currentUser?.profilePhoto; // Cloudinary URL from face biometric

  const handleBack = () => {
    setLocation('/dashboard');
  };

  const handleKYCVerification = () => {
    setLocation('/kyc-verification');
  };

  const handleSignOut = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Navigate to home page
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
          <button onClick={handleBack} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">My Profile</h1>
          <button onClick={() => setLocation('/edit-profile')} className="p-2">
            <Edit className="w-6 h-6" />
          </button>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Profile Section Skeleton */}
          <div className="text-center">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>

          {/* About Section Skeleton */}
          <div>
            <Skeleton className="h-6 w-16 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Location Section Skeleton */}
          <div>
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Services Section Skeleton */}
          <div>
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
        <button onClick={handleBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">My Profile</h1>
        <button onClick={() => setLocation('/edit-profile')} className="p-2">
          <Edit className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Section */}
        <div className="text-center">
          {profilePhoto && isVerified ? (
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-green-500">
              <img 
                src={profilePhoto} 
                alt={customerName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center hidden">
                <span className="text-white text-2xl font-bold">
                  {customerName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {customerName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{customerName}</h2>
          <div className="flex items-center justify-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-600">{rating} ({reviewCount} reviews)</span>
            {isVerified && (
              <CheckCircle className="w-4 h-4 text-green-600 ml-2" title="Verified" />
            )}
          </div>
        </div>

        {/* Verification Status Section */}
        <div className="bg-white rounded-xl p-4 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Verification Status</h3>
          
          {isVerified ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Identity Verified</p>
                <p className="text-sm text-green-600">Your account is fully verified</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Shield className="w-6 h-6 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium text-orange-800">Identity Not Verified</p>
                  <p className="text-sm text-orange-600">
                    Complete face verification to unlock all features
                  </p>
                </div>
              </div>
              
              <Button
                onClick={handleKYCVerification}
                className="w-full bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold"
              >
                <Shield className="w-4 h-4 mr-2" />
                Complete Face Verification
              </Button>
            </div>
          )}
        </div>

        {/* About Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-gray-600 leading-relaxed">{userAbout}</p>
        </div>

        {/* Location Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">My Location</h3>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">{userLocation}</span>
          </div>
        </div>

        {/* Services Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">My services</h3>
          <ul className="space-y-2">
            {userServices.map((service: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">{service}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full bg-red-500 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 mt-8"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}