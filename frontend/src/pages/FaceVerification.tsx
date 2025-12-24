import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Camera, CheckCircle, AlertCircle } from "lucide-react";
import { StepIndicator } from "@/components/StepIndicator";
import { useToast } from "@/hooks/use-toast";

type VerificationStep = "instructions" | "capture" | "processing" | "success" | "failed";

export default function FaceVerification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<VerificationStep>("instructions");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 300, height: 300 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCurrentStep("capture");
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageData);
      stopCamera();
      setCurrentStep("processing");

      // Simulate processing
      setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate for demo
        setCurrentStep(success ? "success" : "failed");
      }, 2000);
    }
  }, [stopCamera]);

  const retryCapture = () => {
    setCapturedImage(null);
    setCurrentStep("instructions");
  };

  const handleComplete = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="w-full max-w-md mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/register")}
          className="mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Face Verification</h1>
          <p className="text-muted-foreground text-sm">
            Complete your identity verification
          </p>
        </div>

        <StepIndicator 
          currentStep={currentStep === "success" ? 3 : currentStep === "processing" ? 2 : 1} 
          totalSteps={3} 
        />

        {currentStep === "instructions" && (
          <Card className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Take a Selfie</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Position your face in the center and make sure it's well lit
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Remove glasses and hat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Look directly at the camera</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Ensure good lighting</span>
              </div>
            </div>

            <Button onClick={startCamera} className="w-full h-12">
              Start Camera
            </Button>
          </Card>
        )}

        {currentStep === "capture" && (
          <Card className="p-4 space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded-lg bg-gray-100"
              />
              <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-primary" />
                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-primary" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-primary" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={retryCapture} className="flex-1">
                Cancel
              </Button>
              <Button onClick={capturePhoto} className="flex-1">
                Capture
              </Button>
            </div>
          </Card>
        )}

        {currentStep === "processing" && (
          <Card className="p-6 text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Processing...</h3>
            <p className="text-sm text-muted-foreground">
              Verifying your identity, please wait
            </p>
            {capturedImage && (
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-32 h-32 object-cover rounded-lg mx-auto"
              />
            )}
          </Card>
        )}

        {currentStep === "success" && (
          <Card className="p-6 text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-600">Verification Successful!</h3>
            <p className="text-sm text-muted-foreground">
              Your identity has been verified successfully
            </p>
            <Button onClick={handleComplete} className="w-full h-12">
              Continue to Dashboard
            </Button>
          </Card>
        )}

        {currentStep === "failed" && (
          <Card className="p-6 text-center space-y-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-600">Verification Failed</h3>
            <p className="text-sm text-muted-foreground">
              Unable to verify your identity. Please try again.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={retryCapture} className="flex-1">
                Try Again
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                Skip for Now
              </Button>
            </div>
          </Card>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}