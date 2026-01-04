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
import { AuthGuard } from "@/components/AuthGuard";

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
      console.log('🔄 Sending login request:', data.emailOrPhone);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('📦 Login response:', result);

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, result);
        throw new Error(result.error || result.message || "HTTP Error");
      }
      
      if (!result.success) {
        console.error('❌ API Error:', result);
        throw new Error(result.error || result.message || "API Error");
      }

      // Validate token exists
      if (!result.data?.token) {
        console.error('❌ No token in response:', result.data);
        throw new Error("No token received from server");
      }

      console.log('✅ Token received:', result.data.token.substring(0, 20) + '...');
      
      // Store only token, user data will be fetched via useAuth hook
      localStorage.setItem("token", result.data.token);
      
      console.log('💾 Token stored in localStorage');
      console.log('🔍 Verify storage:', localStorage.getItem("token")?.substring(0, 20) + '...');

      toast({
        title: "Success!",
        description: "Logged in successfully",
      });
      
      console.log('🚀 Redirecting to dashboard');
      setLocation("/dashboard");
    } catch (error) {
      console.error('💥 Login error:', error);
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
    <AuthGuard requireAuth={false}>
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
                    <div className="relative">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <path d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <Input
                        placeholder="Email or phone number"
                        {...field}
                        className="w-full h-12 rounded-[30px] border border-black/50 pl-12 pr-4 font-['Poppins']"
                        data-testid="input-email-phone"
                      />
                    </div>
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
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66846 7.05372 2.88706C7.83512 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66846 14.1667 4.72826 14.1667 5.83333V9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full h-12 rounded-[30px] border border-black/50 pl-12 pr-12 font-['Poppins']"
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
              className="w-full h-12 rounded-[30px] bg-gradient-to-r from-[#3AC36C] to-[#2A9D5F] hover:from-[#2A9D5F] hover:to-[#1E7A47] text-white font-semibold font-['Poppins'] mt-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
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
              className="w-full h-12 rounded-[30px] border-2 border-gray-300 bg-gray-50 text-gray-400 font-['Poppins'] cursor-not-allowed shadow-md"
              disabled={true}
              data-testid="button-google"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mr-3 opacity-50">
                <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC04"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              Continue with Google (Coming Soon)
            </Button>
          </form>
        </Form>

        {/* Sign Up Link */}
        <div className="text-center mt-5">
          <div className="flex items-center justify-center gap-4">
            <span className="text-black/50 font-['Poppins']">Don't have account?</span>
            <Link href="/register" className="flex items-center gap-2 text-[#3AC36C] font-semibold font-['Poppins'] hover:text-[#2A9D5F] transition-colors duration-300">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M14 15C14 11.134 11.866 8 8 8C4.13401 8 2 11.134 2 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#101010] rounded-full mb-2"></div>
    </div>
    </AuthGuard>
  );
}