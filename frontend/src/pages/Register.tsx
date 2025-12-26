import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle, Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationStep1Schema, registrationStep2Schema, type RegistrationStep1, type RegistrationStep2 } from "@/lib/schemas";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileContainer } from "@/components/MobileContainer";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<RegistrationStep1 | null>(null);
  const [step2Data, setStep2Data] = useState<RegistrationStep2 | null>(null);

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

  const onStep1Submit = (data: RegistrationStep1) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const onStep2Submit = (data: RegistrationStep2) => {
    setStep2Data(data);
    setCurrentStep(3);
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

      localStorage.setItem("customerId", result.data.customer.id);
      localStorage.setItem("customerEmail", result.data.customer.email);
      localStorage.setItem("customerName", result.data.customer.fullName);
      localStorage.setItem("verificationEmail", step1Data.email);
      localStorage.setItem("verificationPhone", step1Data.phoneNumber);
      
      toast({
        title: "Account created!",
        description: "Please verify your email to continue",
      });
      
      setLocation("/email-verification");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <MobileContainer className="flex-1 flex flex-col py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setLocation('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Join as Driver</h1>
            <p className="text-sm text-gray-600">Step {currentStep} of 3</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>

            <Form {...form1}>
              <form onSubmit={form1.handleSubmit(onStep1Submit)} className="flex-1 flex flex-col space-y-4">
                <FormField
                  control={form1.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Full Name" 
                          {...field} 
                          className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                          className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                          className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                            className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500 pr-12"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Password Strength Indicator */}
                {passwordValue && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${passwordChecks.length ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordChecks.length ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        8+ characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordChecks.upper ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordChecks.upper ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        Uppercase
                      </div>
                      <div className={`flex items-center gap-1 ${passwordChecks.number ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordChecks.number ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        Number
                      </div>
                      <div className={`flex items-center gap-1 ${passwordChecks.special ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordChecks.special ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        Special char
                      </div>
                    </div>
                  </div>
                )}
                
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
                            className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500 pr-12"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex-1" />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
                >
                  Continue
                </Button>
              </form>
            </Form>
          </motion.div>
        )}

        {/* Step 2: Driver Details */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Driver Details</h2>
              <p className="text-gray-600">Additional information required</p>
            </div>

            <Form {...form2}>
              <form onSubmit={form2.handleSubmit(onStep2Submit)} className="flex-1 flex flex-col space-y-4">
                <FormField
                  control={form2.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="ID Card Number" 
                          {...field} 
                          className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                          className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                          placeholder="Working Hours (e.g., 9:00AM-5:00PM)" 
                          {...field} 
                          className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500">
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
                
                <div className="flex-1" />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
                >
                  Continue
                </Button>
              </form>
            </Form>
          </motion.div>
        )}

        {/* Step 3: Summary */}
        {currentStep === 3 && step1Data && step2Data && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Review Details</h2>
              <p className="text-gray-600">Please confirm your information</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Name</span>
                <span className="font-medium">{step1Data.fullName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{step1Data.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium">{step1Data.phoneNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">ID Card</span>
                <span className="font-medium">{step2Data.brand}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Address</span>
                <span className="font-medium">{step2Data.color}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium">{step2Data.fuelType}</span>
              </div>
            </div>
            
            <div className="flex-1" />
            
            <div className="space-y-3">
              <Button
                onClick={handleCreateAccount}
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
              
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                Edit Details
              </Button>
            </div>
          </motion.div>
        )}

        {/* Sign In Link */}
        {currentStep === 1 && (
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-green-600 font-semibold hover:text-green-700">
                Sign In
              </Link>
            </p>
          </div>
        )}
      </MobileContainer>
    </div>
  );
}