import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationStep1Schema, registrationStep2Schema, type RegistrationStep1, type RegistrationStep2 } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StepIndicator } from "@/components/StepIndicator";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { MobileContainer } from "@/components/MobileContainer";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
    // Store E.164 phone number directly from the phone input
    setStep1Data(data);
    setCurrentStep(2);
  };

  const onStep2Submit = (data: RegistrationStep2) => {
    setStep2Data(data);
    setCurrentStep(3);
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
      const response = await fetch("/api/auth/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step1: step1Data, step2: step2Data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      toast({
        title: "Success!",
        description: "Account created successfully",
      });

      // Navigate to email verification
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

  const handleEditDetails = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileContainer className="space-y-8 py-8">
        {/* Back Button */}
        {currentStep === 1 && (
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        )}

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Registration</h1>
          <StepIndicator currentStep={currentStep} totalSteps={3} />
        </div>

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <Form {...form1}>
            <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-6">
              <FormField
                control={form1.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} data-testid="input-fullname" />
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
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} data-testid="input-email" />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <PhoneInput
                           country={"id"}
                           enableSearch
                           value={(field.value || "").replace(/^\+/, "")}
                           onChange={(value) => field.onChange(value ? "+" + value : "")}
                           inputProps={{ name: field.name, "data-testid": "input-phone", required: true }}
                           placeholder="Enter phone number"
                           containerClass="w-full"
                           inputClass="w-full h-9 rounded-full border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                         />
                      </div>
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          className="pr-10"
                          {...field}
                          data-testid="input-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <div className="mt-2 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        {passwordChecks.length ? (
                          <CheckCircle2 className="text-green-600" size={16} />
                        ) : (
                          <XCircle className="text-red-500" size={16} />
                        )}
                        <span>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.upper ? (
                          <CheckCircle2 className="text-green-600" size={16} />
                        ) : (
                          <XCircle className="text-red-500" size={16} />
                        )}
                        <span>Includes an uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.number ? (
                          <CheckCircle2 className="text-green-600" size={16} />
                        ) : (
                          <XCircle className="text-red-500" size={16} />
                        )}
                        <span>Includes a number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.special ? (
                          <CheckCircle2 className="text-green-600" size={16} />
                        ) : (
                          <XCircle className="text-red-500" size={16} />
                        )}
                        <span>Includes a symbol (e.g. !@#$)</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form1.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          className="pr-10"
                          {...field}
                          data-testid="input-confirm-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" data-testid="button-next-step1">
                Next
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2 text-black"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                aria-busy={isGoogleLoading}
                data-testid="button-google-signup"
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                {isGoogleLoading ? "Connecting..." : "Continue with Google"}
              </Button>
            </form>
          </Form>
        )}

        {/* Step 2: Vehicle Details */}
        {currentStep === 2 && (
          <Form {...form2}>
            <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6">
              <FormField
                control={form2.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Honda, Toyota" {...field} data-testid="input-brand" />
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
                    <FormLabel>Vehicle Color</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Red, Blue" {...field} data-testid="input-color" />
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
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ABC-1234" {...field} data-testid="input-license" />
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
                    <FormLabel>Fuel type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-fuel-type">
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => toast({ title: "Vehicle Management", description: "Vehicle management is available." })}
                data-testid="button-add-vehicle"
              >
                Add Vehicle
              </Button>

              <Button type="submit" className="w-full" data-testid="button-next-step2">
                Next
              </Button>
            </form>
          </Form>
        )}

        {/* Step 3: Summary */}
        {currentStep === 3 && step1Data && step2Data && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium" data-testid="text-summary-name">{step1Data.fullName}</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Email Address</span>
                <span className="font-medium" data-testid="text-summary-email">{step1Data.email}</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Phone No.</span>
                <span className="font-medium" data-testid="text-summary-phone">{step1Data.phoneNumber}</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Password</span>
                <span className="font-medium">*********</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Vehicle Brand</span>
                <span className="font-medium" data-testid="text-summary-brand">{step2Data.brand}</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Vehicle color</span>
                <span className="font-medium" data-testid="text-summary-color">{step2Data.color}</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">License Number</span>
                <span className="font-medium" data-testid="text-summary-license">{step2Data.licenseNumber}</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Fuel Type</span>
                <span className="font-medium" data-testid="text-summary-fuel">{step2Data.fuelType}</span>
              </div>
            </div>

            <Button
              onClick={handleCreateAccount}
              className="w-full"
              disabled={isLoading}
              data-testid="button-create-account"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <Button
              onClick={handleEditDetails}
              variant="outline"
              className="w-full"
              data-testid="button-edit-details"
            >
              Edit Details
            </Button>
          </div>
        )}
      </MobileContainer>
    </div>
  );
}