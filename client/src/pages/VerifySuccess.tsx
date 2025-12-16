import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function VerifySuccess() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Email verified Successfully!
            </h1>
            <p className="text-sm text-muted-foreground">
              Your account is ready to use.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setLocation("/dashboard")}
          className="w-full h-12 text-base font-semibold"
          data-testid="button-go-home"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}
