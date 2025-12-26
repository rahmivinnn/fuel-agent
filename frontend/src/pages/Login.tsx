import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@/lib/schemas";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { usePlatformGoogleAuth } from "@/hooks/usePlatformGoogleAuth";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { motion } from "framer-motion";
import EmailOTPLogin from "@/components/EmailOTPLogin";
import WhatsAppOTPLogin from "@/components/WhatsAppOTPLogin";
import { apiService } from "@/lib/api";
import { auth } from "@/lib/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'email-otp' | 'whatsapp-otp'>('password');
  const [error, setError] = useState<string>("");
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
    setError("");
    try {
      const result = await apiService.login(data.emailOrPhone, data.password);
      
      // Store authentication data
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('customerId', result.customer.id);
      localStorage.setItem('customerName', result.customer.fullName);
      localStorage.setItem('customerEmail', result.customer.email);
      
      auth.setSession(result.customer, result.token);
      toast({
        title: "Welcome back!",
        description: "Logged in successfully",
      });
      setLocation("/dashboard");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      // Store additional driver info if needed
      localStorage.setItem("driverId", "ff1"); // Default driver ID
      setLocation("/dashboard");
    }
  };

  const handleOTPLoginSuccess = (user: any) => {
    localStorage.setItem("customerId", "c1");
    localStorage.setItem("customerEmail", user.email || user.phoneNumber);
    localStorage.setItem("customerName", user.name || "Driver");
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
    <div className="min-h-screen bg-white flex flex-col">
      <MobileContainer className="flex-1 flex flex-col justify-center py-8">
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <img src="/logo.png" alt="FuelFriendly" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue driving</p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
                        className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                          className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500 pr-12"
                          {...field}
                          data-testid="input-password"
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

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl mt-6"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-gray-300 hover:bg-gray-50 rounded-xl"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                data-testid="button-google"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <FcGoogle className="mr-3 h-5 w-5" />
                    Google
                  </>
                )}
              </Button>
            </form>
          </Form>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-green-600 font-semibold hover:text-green-700">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </MobileContainer>
    </div>
  );
}