import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle, Car } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationStep1Schema, registrationStep2Schema, type RegistrationStep1, type RegistrationStep2 } from "@/lib/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StepIndicator } from "@/components/StepIndicator";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { MobileContainer } from "@/components/MobileContainer";
import EmailOTPLogin from "@/components/EmailOTPLogin";
import WhatsAppOTPLogin from "@/components/WhatsAppOTPLogin";
import { Check } from "lucide-react";

import { apiClient } from "@/lib/api";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<RegistrationStep1 | null>(null);
  const [step2Data, setStep2Data] = useState<RegistrationStep2 | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'whatsapp' | null>(null);
  const [preferredPayment, setPreferredPayment] = useState<string>("");

  const form1 = useForm<RegistrationStep1>({
    resolver: zodResolver(registrationStep1Schema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordValue = form1.watch("password");
  const passwordChecks = {
    length: (passwordValue?.length ?? 0) >= 8,
    upper: /[A-Z]/.test(passwordValue ?? ""),
    number: /\d/.test(passwordValue ?? ""),
    special: /[^A-Za-z0-9]/.test(passwordValue ?? ""),
  };
  
  const form2 = useForm<RegistrationStep2>({
    resolver: zodResolver(registrationStep2Schema),
    defaultValues: {
      brand: "",
      color: "",
      licenseNumber: "",
      fuelType: "",
    },
  });

  // Reset form2 when entering step 2
  const onStep1Submit = (data: RegistrationStep1) => {
    setStep1Data(data);
    // Don't reset form2, let it keep existing data
    setCurrentStep(2);
  };

  const onStep2Submit = (data: RegistrationStep2) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  // Populate forms when going back
  const handleEditDetails = () => {
    // Populate form1 with step1Data
    if (step1Data) {
      form1.reset(step1Data);
    }
    // Populate form2 with step2Data if it exists
    if (step2Data) {
      form2.reset(step2Data);
    }
    setCurrentStep(1);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      toast({ title: "Google Sign-In", description: "Starting sign-in..." });
      await new Promise((r) => setTimeout(r, 800));
      toast({ title: "Success", description: "Signed in with Google." });
      setLocation("/dashboard");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!step1Data || !step2Data) return;

    setIsLoading(true);
    try {
      const response = await apiClient.fetch("/api/auth/register/complete", {
        method: "POST",
        body: JSON.stringify({ step1: step1Data, step2: step2Data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // Store user data for dashboard
      localStorage.setItem("customerId", result.customer.id);
      localStorage.setItem("customerEmail", result.customer.email);
      localStorage.setItem("customerName", result.customer.fullName);

      toast({
        title: "Success!",
        description: "Account created successfully",
      });

      // Store email and phone for verification
      localStorage.setItem("verificationEmail", step1Data.email);
      localStorage.setItem("verificationPhone", step1Data.phoneNumber);
      
      // Redirect to email verification page
      setLocation("/email-verification");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    toast({
      title: "Verified!",
      description: "Account verified successfully",
    });
    setLocation("/dashboard");
  };

  return (
    <div className="relative w-full max-w-[402px] mx-auto min-h-screen bg-white">
      {/* Main Content */}
      <div className="px-4 pt-6 pb-8">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-8">
          <button 
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setLocation('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E5E7EB] text-[#3F4249] hover:text-[#3AC36C] hover:border-[#3AC36C] transition-colors"
          >
            {currentStep === 1 ? (
              <ArrowLeft className="w-4 h-4" />
            ) : (
              <img src="/icon-back.png" alt="Back" className="w-4 h-4" />
            )}
          </button>
          {currentStep === 1 && (
            <span className="text-sm text-[#3F4249] font-['Poppins']">Back</span>
          )}
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="FuelFriendly" className="w-[105px] h-[60px]" />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#3F4249] font-['Poppins']">Registration</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12 relative">
          <div className="flex items-center">
            {/* Step 1 */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              currentStep > 1 ? 'bg-[#3AC36C]' : currentStep === 1 ? 'bg-white border-2 border-[#3AC36C]' : 'bg-white border-2 border-[#606268]'
            }`}>
              {currentStep > 1 ? (
                <Check className="w-4 h-4 text-white stroke-[2.5]" />
              ) : (
                <span className={`text-base font-semibold ${
                  currentStep === 1 ? 'text-[#3AC36C]' : 'text-[#606268]'
                }`}>1</span>
              )}
            </div>
            
            {/* Dots between 1 and 2 */}
            <div className="flex items-center gap-1 mx-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                currentStep > 1 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 1 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 1 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 1 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 1 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 1 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 1 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 1 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 1 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-1.5 h-1.5 rounded-full ${
                currentStep > 1 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
            </div>
            
            {/* Step 2 */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              currentStep > 2 ? 'bg-[#3AC36C]' : currentStep === 2 ? 'bg-white border-2 border-[#3AC36C]' : 'bg-white border-2 border-[#606268]'
            }`}>
              {currentStep > 2 ? (
                <Check className="w-4 h-4 text-white stroke-[2.5]" />
              ) : (
                <span className={`text-base font-semibold ${
                  currentStep === 2 ? 'text-[#3AC36C]' : 'text-[#606268]'
                }`}>2</span>
              )}
            </div>
            
            {/* Dots between 2 and 3 */}
            <div className="flex items-center gap-1 mx-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                currentStep > 2 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 2 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 2 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 2 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 2 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 2 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 2 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 2 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-0.5 h-0.5 rounded-full ${
                currentStep > 2 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
              <div className={`w-1.5 h-1.5 rounded-full ${
                currentStep > 2 ? 'bg-[#3AC36C]' : 'bg-[#606268]'
              }`}></div>
            </div>
            
            {/* Step 3 */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-white border-2 border-[#3AC36C]' : 'bg-white border-2 border-[#606268]'
            }`}>
              <span className={`text-base font-semibold ${
                currentStep >= 3 ? 'text-[#3AC36C]' : 'text-[#606268]'
              }`}>3</span>
            </div>
          </div>
          
          {/* Car Icon */}
          <div className={`absolute -bottom-6 ${
            currentStep === 1 ? 'left-0' : currentStep === 2 ? 'left-1/2 -translate-x-1/2' : 'right-0'
          }`}>
            <img src="/Vector.png" alt="car" className="w-[43px] h-[14px]" />
          </div>
        </div>

        {/* Forms */}
        {currentStep === 1 && (
          <Form {...form1}>
            <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4">
              <FormField
                control={form1.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Full Name" 
                        {...field} 
                        className="w-full h-12 rounded-[30px] border border-black/50 px-4 font-['Poppins']"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form1.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Email address" 
                        {...field} 
                        className="w-full h-12 rounded-[30px] border border-black/50 px-4 font-['Poppins']"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form1.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Phone Number" 
                        {...field} 
                        className="w-full h-12 rounded-[30px] border border-black/50 px-4 font-['Poppins']"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form1.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="w-full h-12 rounded-[30px] border border-black/50 px-4 pr-12 font-['Poppins']"
                          {...field}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#606268]"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form1.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          className="w-full h-12 rounded-[30px] border border-black/50 px-4 pr-12 font-['Poppins']"
                          {...field}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#606268]"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                        >
                          {showConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins'] mt-6"
              >
                Next
              </Button>
            </form>
          </Form>
        )}
        
        {currentStep === 2 && (
          <Form {...form2}>
            <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-4">
              <FormField
                control={form2.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="ID Card Number" 
                        {...field} 
                        className="w-full h-12 rounded-[30px] border border-black/50 px-4 font-['Poppins']"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form2.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Address" 
                        {...field} 
                        className="w-full h-12 rounded-[30px] border border-black/50 px-4 font-['Poppins']"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form2.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Working hour" 
                        {...field} 
                        className="w-full h-12 rounded-[30px] border border-black/50 px-4 font-['Poppins']"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form2.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        setPreferredPayment(value);
                      }} value={field.value}>
                        <SelectTrigger className="w-full h-12 rounded-[30px] border border-black/50 px-4 font-['Poppins']">
                          <SelectValue placeholder="Preferred Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="button"
                variant="ghost"
                className="w-full h-12 rounded-[30px] border-2 border-dashed border-[#3AC36C] text-[#3AC36C] bg-white hover:bg-green-50 font-['Poppins']"
                onClick={() => {
                  // Add secondary contact functionality
                  toast({
                    title: "Feature Coming Soon",
                    description: "Secondary contact number feature will be available soon",
                  });
                }}
              >
                + Add Secondary Contact Number
              </Button>
              
              <Button 
                type="submit" 
                className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins'] mt-6"
              >
                Next
              </Button>
            </form>
          </Form>
        ) }
        
        {currentStep === 3 && step1Data && step2Data && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-dotted border-gray-300">
                  <span className="text-gray-800 font-bold font-['Poppins']">Name</span>
                  <span className="text-gray-600 font-normal font-['Poppins']">{step1Data.fullName}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-dotted border-gray-300">
                  <span className="text-gray-800 font-bold font-['Poppins']">Email Address</span>
                  <span className="text-gray-600 font-normal font-['Poppins']">{step1Data.email}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-dotted border-gray-300">
                  <span className="text-gray-800 font-bold font-['Poppins']">Phone No.</span>
                  <span className="text-gray-600 font-normal font-['Poppins']">{step1Data.phoneNumber}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-dotted border-gray-300">
                  <span className="text-gray-800 font-bold font-['Poppins']">Password</span>
                  <span className="text-gray-600 font-normal font-['Poppins']">abc123</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-dotted border-gray-300">
                  <span className="text-gray-800 font-bold font-['Poppins']">ID Card Number</span>
                  <span className="text-gray-600 font-normal font-['Poppins']">{step2Data.brand || '1234 5678 910'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-dotted border-gray-300">
                  <span className="text-gray-800 font-bold font-['Poppins']">Address</span>
                  <span className="text-gray-600 font-normal font-['Poppins']">{step2Data.color || 'Abc def ghi'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-dotted border-gray-300">
                  <span className="text-gray-800 font-bold font-['Poppins']">Working hours</span>
                  <span className="text-gray-600 font-normal font-['Poppins']">{step2Data.licenseNumber || '9:00AM-5:00PM'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-dotted border-gray-300">
                  <span className="text-gray-800 font-bold font-['Poppins']">Bank Name</span>
                  <span className="text-gray-600 font-normal font-['Poppins']">{step2Data.fuelType || 'National Bank'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-dotted border-gray-300">
                  <span className="text-gray-800 font-bold font-['Poppins']">Account Holder</span>
                  <span className="text-gray-600 font-normal font-['Poppins']">{step1Data.fullName}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-dotted border-gray-300">
                  <span className="text-gray-800 font-bold font-['Poppins']">Account No</span>
                  <span className="text-gray-600 font-normal font-['Poppins']">1234 5678 9013</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-800 font-bold font-['Poppins']">Mobile Wallet</span>
                  <span className="text-gray-600 font-normal font-['Poppins']">{preferredPayment || 'Not selected'}</span>
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleCreateAccount}
                className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins']"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              
              <Button
                onClick={() => setCurrentStep(1)}
                variant="ghost"
                className="w-full text-[#3AC36C] font-semibold font-['Poppins'] hover:bg-green-50"
              >
                Edit Details
              </Button>
            </div>
          </div>
        )}

        {/* Sign In Link */}
        {currentStep === 1 && (
          <div className="text-center mt-5">
            <div className="flex items-center justify-center gap-4">
              <span className="text-black/50 font-['Poppins']">Already have account?</span>
              <Link href="/login" className="text-[#3AC36C] font-semibold font-['Poppins'] underline">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#101010] rounded-full mb-2"></div>
    </div>
  );
}