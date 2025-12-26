import { useState } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, Eye, EyeOff, CheckCircle, X } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { useToast } from "@/hooks/use-toast";
import { apiCallWithAuth } from "@/lib/auth";

export default function ManagePassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "robinabc35@gmail.com",
    currentPassword: "",
    oldPassword: "robinabc35@gmail.com",
    newPassword: "",
    confirmPassword: ""
  });

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const customerId = localStorage.getItem("customerId") || "c1";
      const response = await apiCallWithAuth(`http://localhost:5000/api/customers/${customerId}/change-password`, {
        method: 'POST',
        body: JSON.stringify({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to change password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackToHome = () => {
    setShowSuccessModal(false);
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileContainer>
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/settings")}
            className="text-gray-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Manage Password</h1>
        </div>

        <div className="py-6 space-y-6">
          {/* Current Password Section */}
          <div>
            <h2 className="text-base font-medium text-gray-900 mb-4">Current Password</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="bg-gray-50 border-gray-200 rounded-full px-4 py-3 text-gray-700"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Password</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    className="border-gray-200 rounded-full px-4 py-3 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div>
            <h2 className="text-base font-medium text-gray-900 mb-4">Change Current Password</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Enter Old Password</label>
                <Input
                  type="email"
                  value={formData.oldPassword}
                  readOnly
                  className="bg-gray-50 border-gray-200 rounded-full px-4 py-3 text-gray-700"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Write New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    className="border-gray-200 rounded-full px-4 py-3 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="border-gray-200 rounded-full px-4 py-3 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handlePasswordChange}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full py-3 text-base font-medium"
          >
            Password Change
          </Button>
        </div>
      </MobileContainer>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl p-6">
          <div className="sr-only">
            <DialogTitle>Password Changed Successfully</DialogTitle>
            <DialogDescription>
              Your password has been changed successfully.
            </DialogDescription>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSuccessModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-4 -mt-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Your password has been
              </h2>
              <h2 className="text-lg font-semibold text-gray-900 -mt-1">
                Changed successfully
              </h2>
            </div>
            
            <Button 
              onClick={handleBackToHome}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full py-3 text-base font-medium mt-6"
            >
              Back To Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}