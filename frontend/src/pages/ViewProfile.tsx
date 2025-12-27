import { ArrowLeft, Edit, MapPin, Star, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function ViewProfile() {
  const [, setLocation] = useLocation();
  
  // Get user data from localStorage
  const customerName = localStorage.getItem('customerName') || 'Shah Hussain';
  const userAbout = localStorage.getItem('userAbout') || 'Fuel Friend is a reliable on-demand fuel delivery service designed to provide convenience and efficiency to customers. Whether you\'re stranded on the road or simply looking to avoid the hassle of gas stations, our trusted Fuel Friends ensure that you get quality fuel delivered right to your location.';
  const userLocation = localStorage.getItem('userLocation') || 'Abc Tennessee';
  const userServices = JSON.parse(localStorage.getItem('userServices') || '["Groceries delivery", "Fuel refueling"]');

  const handleBack = () => {
    setLocation('/dashboard');
  };

  const handleSignOut = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Navigate to home page
    setLocation('/');
  };

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
            <span className="text-gray-600">4.8 (128 reviews)</span>
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