import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@/lib/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { usePlatformGoogleAuth } from "@/hooks/usePlatformGoogleAuth";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { motion } from "framer-motion";
import EmailOTPLogin from "@/components/EmailOTPLogin";
import WhatsAppOTPLogin from "@/components/WhatsAppOTPLogin";
import { API_BASE_URL } from "@/lib/api";
import { auth } from "@/lib/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'email-otp' | 'whatsapp-otp'>('password');
  const { signInWithGoogle, loading: googleLoading } = usePlatformGoogleAuth();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Login response:', result); // Debug log

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Invalid credentials");
      }

      // Validate token exists
      if (!result.data?.token) {
        throw new Error("No token received from server");
      }

      // Store only token, user data will be fetched via useAuth hook
      localStorage.setItem("token", result.data.token);

      toast({
        title: "Success!",
        description: "Logged in successfully",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      localStorage.setItem("fuelFriendId", result.user?.id || "ff1");
      setLocation("/dashboard");
    }
  };

  const handleOTPLoginSuccess = (user: any) => {
    localStorage.setItem("token", "dummy_token");
    localStorage.setItem("fuelFriendId", user.id || "ff1");
    localStorage.setItem("fuelFriendEmail", user.email || user.phoneNumber);
    localStorage.setItem("fuelFriendName", user.name || "Driver");
    toast({
      title: "Success!",
      description: "Logged in successfully with OTP",
    });
    setLocation("/dashboard");
  };

  if (loginMethod === 'email-otp') {
    return (
      <div className="min-h-screen bg-background relative flex flex-col items-center justify-center">
        <MobileContainer className="relative z-10 py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full" 
              onClick={() => setLoginMethod('password')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>
          <EmailOTPLogin onLoginSuccess={handleOTPLoginSuccess} />
        </MobileContainer>
      </div>
    );
  }

  if (loginMethod === 'whatsapp-otp') {
    return (
      <div className="min-h-screen bg-background relative flex flex-col items-center justify-center">
        <MobileContainer className="relative z-10 py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full" 
              onClick={() => setLoginMethod('password')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>
          <WhatsAppOTPLogin onLoginSuccess={handleOTPLoginSuccess} />
        </MobileContainer>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[402px] mx-auto min-h-screen bg-white">
      {/* Main Content */}
      <div className="px-4 pt-6 pb-8">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-8">
          <button 
            onClick={() => setLocation('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E5E7EB] text-[#3F4249] hover:text-[#3AC36C] hover:border-[#3AC36C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="FuelFriendly" className="w-[105px] h-[60px]" />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#3F4249] font-['Poppins']">Sign In</h1>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="emailOrPhone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Email or phone number"
                      {...field}
                      className="w-full h-12 rounded-[30px] border border-black/50 px-4 font-['Poppins']"
                      data-testid="input-email-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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
                        data-testid="input-password"
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

            <div className="text-center">
              <Link href="/forgot-password" className="text-[#FF6B6B] text-sm font-['Poppins']">Forgotten Password</Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins'] mt-6"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>

            <div className="text-center py-4">
              <span className="text-black/50 font-['Poppins']">Or</span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-[30px] border border-black/50 bg-gray-100 text-gray-400 font-['Poppins'] cursor-not-allowed"
              disabled={true}
              data-testid="button-google"
            >
              <FcGoogle className="mr-3 h-5 w-5 opacity-50" />
              Continue with Google (Coming Soon)
            </Button>
          </form>
        </Form>

        {/* Sign Up Link */}
        <div className="text-center mt-5">
          <div className="flex items-center justify-center gap-4">
            <span className="text-black/50 font-['Poppins']">Don't have account?</span>
            <Link href="/register" className="text-[#3AC36C] font-semibold font-['Poppins'] underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#101010] rounded-full mb-2"></div>
    </div>
  );
}