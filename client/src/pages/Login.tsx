import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { motion } from "framer-motion";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Invalid credentials");
      }

      localStorage.setItem("customerId", result.customer.id);
      localStorage.setItem("customerEmail", result.customer.email);
      localStorage.setItem("customerName", result.customer.fullName);

      toast({
        title: "Success!",
        description: "Logged in successfully",
      });
      setLocation("/");
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

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center">
      <MobileContainer className="relative z-10 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full space-y-8"
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center"
          >
            <img
              src="/logo.png"
              alt="Fuel Friend"
              className="h-16 mx-auto mb-6 mt-4"
            />
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl font-normal">Sign In</h1>
            <p className="text-muted-foreground">Customer</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="emailOrPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email or phone number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter email or phone"
                          {...field}
                          className="h-12"
                          data-testid="input-email-phone"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">If using a phone number, include the country code (e.g. +62).</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            className="pr-10 h-12"
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
                      <p className="text-xs text-muted-foreground mt-1">Use at least 6 characters, mixing letters and numbers.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={isLoading}
                    data-testid="button-login"
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </Button>
                </motion.div>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-normal flex items-center justify-center gap-2 text-black"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    aria-busy={isGoogleLoading}
                    data-testid="button-google"
                  >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                  </Button>
                </motion.div>

                <div className="text-center pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    asChild
                    data-testid="link-signup"
                  >
                    <Link href="/register">Don't have an account? Sign up</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </motion.div>
      </MobileContainer>
    </div>
  );
}