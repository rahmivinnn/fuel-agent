import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, CheckCircle, AlertCircle, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import * as faceapi from 'face-api.js';

export default function KYCVerification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'camera' | 'processing' | 'success' | 'failed'>('idle');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  // Assign stream when camera view mounts
  useEffect(() => {
    if (verificationStatus === 'camera' && streamRef.current && videoRef.current) {
      console.log('🔗 Assigning stream on mount');
      videoRef.current.srcObject = streamRef.current;
      
      videoRef.current.onloadedmetadata = () => {
        console.log('✅ Video metadata loaded on mount');
        videoRef.current?.play().catch(e => console.error('Play error on mount:', e));
      };
    }
  }, [verificationStatus]);

  const loadModels = async () => {
    try {
      const modelUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl)
      ]);
      setModelsLoaded(true);
    } catch (error) {
      console.error('Error loading face-api models:', error);
      toast({
        title: "Model Loading Error",
        description: "Failed to load face recognition models",
        variant: "destructive",
      });
    }
  };

  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      console.log('✅ Got media stream:', stream);
      console.log('📹 Video tracks:', stream.getVideoTracks());
      
      streamRef.current = stream;
      setVerificationStatus('camera');
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current && stream) {
          console.log('🔗 Assigning stream to video element');
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadedmetadata = () => {
            console.log('✅ Video metadata loaded');
            videoRef.current?.play().catch(e => console.error('Play error:', e));
          };
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Camera error:', error);
      toast({
        title: "Camera Error",
        description: `Camera access failed: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) {
      toast({
        title: "Not Ready",
        description: "Camera or models not ready",
        variant: "destructive",
      });
      return;
    }

    // Debug localStorage
    console.log('💾 All localStorage data:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        console.log(`  ${key}: ${localStorage.getItem(key)}`);
      }
    }

    setIsLoading(true);
    setVerificationStatus('processing');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context not available');
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // Detect face and get descriptor
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setVerificationStatus('failed');
        toast({
          title: "No Face Detected",
          description: "Please ensure your face is clearly visible and well-lit",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const faceImage = canvas.toDataURL('image/jpeg', 0.8);
      const faceDescriptor = Array.from(detection.descriptor);
      const confidence = detection.detection.score;

      console.log('Face detected with confidence:', confidence);
      console.log('Face descriptor length:', faceDescriptor.length);

      // Save to backend
      await saveFaceBiometric(faceDescriptor, faceImage, confidence);
      
      stopCamera();
      setVerificationStatus('success');
      
      toast({
        title: "Success!",
        description: "Face verification completed successfully",
      });
      
      // Invalidate auth cache to refresh user data
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      
    } catch (error) {
      console.error('Face capture error:', error);
      setVerificationStatus('failed');
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to process face data",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const saveFaceBiometric = async (faceDescriptor: number[], faceImage: string, confidence: number) => {
    // Try multiple token sources
    const token = localStorage.getItem("token") || 
                  localStorage.getItem("tempJwtToken") || 
                  localStorage.getItem("authToken");
    
    const fuelFriendId = localStorage.getItem("tempFuelFriendId") || 
                         localStorage.getItem("userId") ||
                         localStorage.getItem("fuelFriendId");
    
    console.log('🔐 Auth data check:', { 
      hasToken: !!token, 
      hasFuelFriendId: !!fuelFriendId,
      tokenSource: token ? 'found' : 'missing',
      fuelFriendIdSource: fuelFriendId ? 'found' : 'missing'
    });
    
    console.log('🔄 Saving face biometric:', { fuelFriendId, descriptorLength: faceDescriptor.length, confidence });
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    if (!fuelFriendId) {
      throw new Error('No fuel friend ID found. Please complete registration.');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/face/save-biometric`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        fuelFriendId,
        faceDescriptor,
        faceImage,
        confidence
      }),
    });
    
    const result = await response.json();
    console.log('📤 Face biometric API response:', result);
    
    if (!response.ok) {
      throw new Error(result.error || result.message || 'Failed to save biometric data');
    }
    
    return result;
  };

  const handleSkipForNow = () => {
    const jwtToken = localStorage.getItem("tempJwtToken");
    
    if (jwtToken) {
      localStorage.setItem("token", jwtToken);
      
      localStorage.removeItem("tempJwtToken");
      localStorage.removeItem("tempFuelFriendId");
      localStorage.removeItem("tempFuelFriendEmail");
      localStorage.removeItem("tempFuelFriendName");
      localStorage.removeItem("verificationEmail");
      localStorage.removeItem("pendingRegistration");
      
      toast({
        title: "Welcome!",
        description: "You can complete verification later in settings",
      });
      
      setLocation("/dashboard");
    } else {
      setLocation("/register");
    }
  };

  const handleContinue = () => {
    if (verificationStatus === 'success') {
      handleSkipForNow();
    } else if (verificationStatus === 'idle') {
      if (!modelsLoaded) {
        toast({
          title: "Please Wait",
          description: "Face recognition models are still loading",
        });
        return;
      }
      startCamera();
    }
  };

  return (
    <div className="relative w-full max-w-[402px] mx-auto min-h-screen bg-white">
      <div className="px-4 pt-6 pb-8">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setLocation("/verify-success")}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E5E7EB] text-[#3F4249] hover:text-[#3AC36C] hover:border-[#3AC36C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-[#3F4249] font-['Poppins']">Back</span>
        </div>

        {/* Camera View */}
        {verificationStatus === 'camera' && (
          <div className="mb-8">
            <div className="relative bg-black rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
                onLoadedData={() => console.log('✅ Video loaded data')}
                onCanPlay={() => console.log('✅ Video can play')}
                onPlay={() => console.log('✅ Video started playing')}
                onError={(e) => console.error('❌ Video element error:', e)}
              />
              <div className="absolute inset-4 border-2 border-[#3AC36C] rounded-full pointer-events-none">
                <div className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-[#3AC36C] rounded-tl-lg" />
                <div className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-[#3AC36C] rounded-tr-lg" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-[#3AC36C] rounded-bl-lg" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-[#3AC36C] rounded-br-lg" />
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            {verificationStatus === 'success' ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : verificationStatus === 'failed' ? (
              <AlertCircle className="w-10 h-10 text-red-600" />
            ) : verificationStatus === 'camera' ? (
              <Camera className="w-10 h-10 text-blue-600" />
            ) : (
              <Shield className="w-10 h-10 text-blue-600" />
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3F4249] font-['Poppins'] mb-4">
            {verificationStatus === 'success' ? 'Verification Complete!' :
             verificationStatus === 'failed' ? 'Verification Failed' :
             verificationStatus === 'processing' ? 'Processing Face...' :
             verificationStatus === 'camera' ? 'Position Your Face' :
             'Face Verification'}
          </h1>
          <p className="text-sm text-[#606268] font-['Poppins'] leading-relaxed">
            {verificationStatus === 'success' ? 
              'Your face has been successfully registered for biometric authentication.' :
             verificationStatus === 'failed' ? 
              'We couldn\'t detect your face clearly. Please try again in good lighting.' :
             verificationStatus === 'processing' ? 
              'Please wait while we process your face data...' :
             verificationStatus === 'camera' ? 
              'Position your face in the center circle and ensure good lighting.' :
              'Complete face verification to secure your account with biometric authentication.'}
          </p>
        </div>

        {/* Benefits List */}
        {verificationStatus === 'idle' && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-[#3F4249] font-['Poppins'] mb-4">Benefits of face verification:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#3AC36C] rounded-full"></div>
                <span className="text-sm text-[#606268] font-['Poppins']">Secure biometric login</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#3AC36C] rounded-full"></div>
                <span className="text-sm text-[#606268] font-['Poppins']">Enhanced account security</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#3AC36C] rounded-full"></div>
                <span className="text-sm text-[#606268] font-['Poppins']">Quick identity verification</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#3AC36C] rounded-full"></div>
                <span className="text-sm text-[#606268] font-['Poppins']">Verified driver badge</span>
              </li>
            </ul>
          </div>
        )}

        {/* Processing Animation */}
        {verificationStatus === 'processing' && (
          <div className="flex justify-center mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3AC36C]"></div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          {verificationStatus === 'idle' && (
            <>
              <Button
                onClick={handleContinue}
                className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins']"
                disabled={isLoading || !modelsLoaded}
              >
                {!modelsLoaded ? "Loading Models..." : "Start Face Verification"}
              </Button>
              
              <Button
                onClick={handleSkipForNow}
                variant="ghost"
                className="w-full text-[#606268] font-semibold font-['Poppins'] hover:bg-gray-50"
              >
                Skip for now
              </Button>
            </>
          )}
          
          {verificationStatus === 'camera' && (
            <>
              <Button
                onClick={captureFace}
                className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins']"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Capture Face"}
              </Button>
              
              <Button
                onClick={() => {
                  stopCamera();
                  setVerificationStatus('idle');
                }}
                variant="ghost"
                className="w-full text-[#606268] font-semibold font-['Poppins'] hover:bg-gray-50"
              >
                Cancel
              </Button>
            </>
          )}
          
          {verificationStatus === 'processing' && (
            <Button
              disabled
              className="w-full h-12 rounded-[30px] bg-gray-300 text-gray-500 font-semibold font-['Poppins']"
            >
              Processing...
            </Button>
          )}
          
          {verificationStatus === 'success' && (
            <Button
              onClick={handleContinue}
              className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins']"
            >
              Continue to Dashboard
            </Button>
          )}
          
          {verificationStatus === 'failed' && (
            <>
              <Button
                onClick={() => setVerificationStatus('idle')}
                className="w-full h-12 rounded-[30px] bg-[#3AC36C] hover:bg-[#3AC36C]/90 text-white font-semibold font-['Poppins']"
              >
                Try Again
              </Button>
              
              <Button
                onClick={handleSkipForNow}
                variant="ghost"
                className="w-full text-[#606268] font-semibold font-['Poppins'] hover:bg-gray-50"
              >
                Skip for now
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}