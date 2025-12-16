import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailVerificationSchema, type EmailVerification } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

export default function EmailVerification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmailVerification>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: EmailVerification) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send verification code");
      }

      localStorage.setItem("verificationEmail", data.email);

      toast({
        title: "Code sent!",
        description: "Verification code has been sent to your email",
      });
      setLocation("/verify-code");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="w-full max-w-sm mx-auto space-y-6 pt-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/login")}
            data-testid="button-back-email"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 flex justify-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="w-9" />
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Email Verification</h1>
          <p className="text-xs text-muted-foreground">
            Enter your email address to receive verification code
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Email address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className="h-10 text-sm"
                      data-testid="input-email-verification"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold"
              disabled={isLoading}
              data-testid="button-send-code"
            >
              {isLoading ? "Sending..." : "Send Code"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-primary text-sm"
              onClick={() => setLocation("/login")}
              data-testid="button-try-another-way"
            >
              Try another way
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
