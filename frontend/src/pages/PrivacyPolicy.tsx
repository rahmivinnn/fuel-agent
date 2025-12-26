import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";

export default function PrivacyPolicy() {
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
          <h1 className="text-xl font-semibold text-gray-900">Privacy Policy</h1>
        </div>

        <div className="py-6 space-y-6">
          {/* Last Update */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Last Update 10 June 2024</p>
          </div>

          {/* Privacy Policy Content */}
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            
            {/* 1. Introduction */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                FuelFriendly ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "Service").
              </p>
            </div>

            {/* 2. Information We Collect */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <p className="mb-3 font-medium">Personal Information</p>
              <ul className="space-y-1 ml-4">
                <li>• Name</li>
                <li>• Email address</li>
                <li>• Phone number</li>
                <li>• ID Card Number</li>
                <li>• Payment information</li>
                <li>• Location data</li>
              </ul>
            </div>

            {/* 3. How We Use Your Information */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">
                We use the collected information for various purposes, including to:
              </p>
              <ul className="space-y-1 ml-4">
                <li>• Provide and maintain our Service</li>
                <li>• Process and complete transactions</li>
                <li>• Send you order confirmations and updates</li>
                <li>• Provide customer support</li>
                <li>• Gather analysis to improve our Service</li>
                <li>• Monitor the usage of our Service</li>
                <li>• Detect, prevent, and address technical issues</li>
              </ul>
            </div>

            {/* 4. Data Security */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">4. Data Security</h2>
              <p className="mb-3">
                The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure.
              </p>
              <p>
                We implement appropriate security measures to protect your personal information, including encryption of sensitive data and secure payment processing.
              </p>
            </div>

            {/* 5. Changes to This Privacy Policy */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">5. Changes to This Privacy Policy</h2>
              <p className="mb-3">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
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