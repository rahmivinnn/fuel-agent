import { ArrowLeft, Edit, MapPin, Star, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewProfile() {
  const [, setLocation] = useLocation();
  
  const { data: authData, isLoading } = useAuth();
  const currentUser = authData?.customer;
  
  // Use data from auth API
  const customerName = currentUser?.fullName || 'FuelFriend';
  const userAbout = currentUser?.about || 'Fuel Friend is a reliable on-demand fuel delivery service designed to provide convenience and efficiency to customers.';
  const userLocation = currentUser?.location || 'Location not set';
  const userServices = ['Fuel delivery', 'Emergency refueling'];
  const rating = parseFloat(currentUser?.rating || '0') || 4.8;
  const reviewCount = currentUser?.totalReviews || 0;

  const handleBack = () => {
    setLocation('/dashboard');
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
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {customerName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{customerName}</h2>
          <div className="flex items-center justify-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-600">{rating} ({reviewCount} reviews)</span>
          </div>
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