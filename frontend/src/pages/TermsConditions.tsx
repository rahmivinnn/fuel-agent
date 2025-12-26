import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";

export default function TermsConditions() {
  const [, setLocation] = useLocation();

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
          <h1 className="text-xl font-semibold text-gray-900">Terms & Conditions</h1>
        </div>

        <div className="py-6 space-y-6">
          {/* Last Update */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Last Update 10 June 2024</p>
          </div>

          {/* Terms Content */}
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            
            {/* 1. Introduction */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                Welcome to FuelFriendly. These Terms and Conditions govern your use of the FuelFriend mobile application and website (collectively, the "Service").
              </p>
            </div>

            {/* 2. Definitions */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">2. Definitions</h2>
              <p className="mb-2">
                Fuel Friend refers to our delivery partners who deliver fuel and other items to users.
              </p>
              <p>
                User refers to individuals who access or use our Service.
              </p>
            </div>

            {/* 3. Use of Service */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">3. Use of Service</h2>
              <p>
                FuelFriend provides a platform connecting users with fuel delivery services and convenience store items. We do not own, sell, or distribute fuel ourselves.
              </p>
            </div>

            {/* 4. Payments and Fees */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">4. Payments and Fees</h2>
              <p>
                All payments are processed securely through our payment providers. By providing payment information, you represent that you are authorized to use the payment method.
              </p>
            </div>

            {/* 5. Delivery Services */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">5. Delivery Services</h2>
              <p>
                Delivery times are estimates and may vary based on traffic, weather conditions, and other factors beyond our control.
              </p>
            </div>

            {/* 6. Contact Us */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">6. Contact Us</h2>
              <p className="mb-2">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="space-y-1">
                <p>support@fuelfriendly.com</p>
                <p>FuelFriendly, Inc.</p>
                <p>123 Delivery Lane</p>
                <p>San Francisco, CA 94107</p>
              </div>
            </div>

          </div>
        </div>
      </MobileContainer>

      <BottomNav />
    </div>
  );
}