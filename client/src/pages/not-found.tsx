import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </div>

        <Button
          onClick={() => setLocation("/")}
          className="h-12 px-6 text-base font-semibold rounded-lg flex items-center gap-2"
          data-testid="button-go-home"
        >
          <Home className="w-5 h-5" />
          Go to Home
        </Button>
      </div>
    </div>
  );
}
