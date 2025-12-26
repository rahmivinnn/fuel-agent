import { useState } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, Camera, X, CheckCircle } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { useToast } from "@/hooks/use-toast";

export default function ReportIssue() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    attachments: [] as File[],
  });
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const categories = [
    "App Technical Problem",
    "GPS & Location Issues",
    "Payment Issue",
    "Safety & Security Concerns",
    "Other",
  ];

  const handleDescriptionChange = (value: string) => {
    if (value.length <= 500) {
      setFormData(prev => ({ ...prev, description: value }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && formData.attachments.length < 3) {
      const newFiles = Array.from(files).slice(0, 3 - formData.attachments.length);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.category || !formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a category and provide a description",
        variant: "destructive",
      });
      return;
    }

    if (formData.description.length < 10) {
      toast({
        title: "Description Too Short",
        description: "Please provide at least 10 characters in the description",
        variant: "destructive",
      });
      return;
    }

    // Show success modal instead of toast
    setShowSuccessModal(true);
  };

  const handleGoToHome = () => {
    setShowSuccessModal(false);
    setLocation("/dashboard");
  };

  const handleSubmitAnother = () => {
    setShowSuccessModal(false);
    // Reset form
    setFormData({
      category: "",
      description: "",
      attachments: [],
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileContainer>
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/support-help")}
            className="text-gray-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Report an Issue</h1>
        </div>

        <div className="py-6 space-y-6">
          {/* Description */}
          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Please provide details about the issue you're experiencing. Our support team will review and respond as soon as possible.
            </p>
          </div>

          {/* Issue Category */}
          <div>
            <label className="text-base font-medium text-gray-900 mb-3 block">
              Issue Category
            </label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-full h-12 rounded-full border-gray-300 px-4">
                <SelectValue placeholder="Select a Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="text-base font-medium text-gray-900 mb-3 block">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Please describe the issue in details..."
              className="min-h-[120px] resize-none border-gray-300 rounded-lg p-4"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {formData.description.length}/500 characters (minimum 10)
              </span>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="text-base font-medium text-gray-900 mb-3 block">
              Attachments (Optional)
            </label>
            
            <div className="space-y-3">
              {/* Uploaded Files and Upload Button */}
              <div className="flex gap-3 flex-wrap">
                {/* Show uploaded images */}
                {formData.attachments.map((file, index) => {
                  const imageUrl = URL.createObjectURL(file);
                  return (
                    <div key={index} className="relative">
                      <div className="w-20 h-20 rounded-lg overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
                
                {/* Upload Button - only show if less than 3 attachments */}
                {formData.attachments.length < 3 && (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                      <Camera className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Add</span>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                You can add up to 3 photos
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full py-3 text-base font-medium"
          >
            Submit Report
          </Button>
        </div>
      </MobileContainer>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl p-8">
          <div className="sr-only">
            <DialogTitle>Report Submitted Successfully</DialogTitle>
            <DialogDescription>
              Your report has been submitted and our team will review it.
            </DialogDescription>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Report Submitted Successfully!
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Thank you for reporting the issue. Our team will review your report and get back to you as soon as possible.
              </p>
            </div>
            
            <div className="w-full space-y-3">
              <Button 
                onClick={handleSubmitAnother}
                variant="outline"
                className="w-full rounded-full py-3 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Submit another report
              </Button>
              
              <Button 
                onClick={handleGoToHome}
                className="w-full bg-transparent hover:bg-transparent text-green-600 hover:text-green-700 py-3 text-base font-medium shadow-none"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}