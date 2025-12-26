import { useState } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown, MessageCircle, AlertCircle } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { useToast } from "@/hooks/use-toast";

export default function SupportHelp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [expandedFaq, setExpandedFaq] = useState<string | null>("delivery-request");

  const faqItems = [
    {
      id: "fuel-friend-app",
      question: "What is the Fuel Friend app?",
      answer: "Fuel Friend is an on-demand fuel delivery service that brings fuel directly to your location.",
      expanded: false,
    },
    {
      id: "delivery-request",
      question: "How do I accept a delivery request?",
      answer: "New orders will appear in the dashboard. You can accept or reject requests based on availability.",
      expanded: true,
    },
    {
      id: "profile-details",
      question: "Can I update my profile details?",
      answer: "Yes, you can update your profile details in the Settings section of the app.",
      expanded: false,
    },
    {
      id: "notifications",
      question: "How do I enable or disable notifications?",
      answer: "Go to Settings > Notifications to customize your notification preferences.",
      expanded: false,
    },
    {
      id: "payment-methods",
      question: "What payment Methods are accepted?",
      answer: "We accept credit cards, debit cards, PayPal, and digital wallet payments.",
      expanded: false,
    },
  ];

  const handleFaqToggle = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleContactSupport = (type: string) => {
    if (type === "chat") {
      setLocation("/live-chat-support");
    } else if (type === "report") {
      setLocation("/report-issue");
    }
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
          <h1 className="text-xl font-semibold text-gray-900">Support & help</h1>
        </div>

        <div className="py-6 space-y-8">
          {/* Description */}
          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Need help with Fuelfriendly? Find answers to common questions or contact our support team.
            </p>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-base font-medium text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-3">
              {faqItems.map((item) => {
                const isExpanded = expandedFaq === item.id;
                return (
                  <div key={item.id} className="border-b border-gray-100 pb-3">
                    <button
                      onClick={() => handleFaqToggle(item.id)}
                      className="w-full flex items-center justify-between py-3 text-left"
                    >
                      <span className="text-sm font-medium text-gray-900 pr-4">
                        {item.question}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="pb-2">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Support Section */}
          <div>
            <h2 className="text-base font-medium text-gray-900 mb-4">
              Contact Support
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={() => handleContactSupport("chat")}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  Live Chat Support
                </span>
              </button>
              
              <button
                onClick={() => handleContactSupport("report")}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <AlertCircle className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  Report an Issue
                </span>
              </button>
            </div>
          </div>
        </div>
      </MobileContainer>

      <BottomNav />
    </div>
  );
}