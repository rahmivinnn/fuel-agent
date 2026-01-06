import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Call() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: "Customer",
    phone: "+1234567890"
  });

  const { user: authData } = useAuthContext();
  const currentUser = authData?.fuelFriend;

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    setLocation("/my-orders");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 text-white">
      {/* Header */}
      <div className="p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/my-orders")}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold ml-3">Call</h1>
      </div>

      {/* Call Interface */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Customer Avatar */}
        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl font-bold">
            {customerInfo.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Customer Info */}
        <h2 className="text-2xl font-semibold mb-2">{customerInfo.name}</h2>
        <p className="text-white/80 mb-2">{customerInfo.phone}</p>

        {/* Call Status */}
        <div className="text-center mb-8">
          {isCallActive ? (
            <div>
              <p className="text-white/80 mb-2">Call in progress</p>
              <p className="text-xl font-mono">{formatDuration(callDuration)}</p>
            </div>
          ) : (
            <p className="text-white/80">Tap to call</p>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-6">
          {isCallActive && (
            <>
              {/* Mute Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full ${
                  isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>

              {/* Speaker Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSpeaker}
                className={`w-14 h-14 rounded-full ${
                  isSpeakerOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isSpeakerOn ? (
                  <Volume2 className="w-6 h-6" />
                ) : (
                  <VolumeX className="w-6 h-6" />
                )}
              </Button>
            </>
          )}

          {/* Call/End Call Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={isCallActive ? handleEndCall : handleStartCall}
            className={`w-16 h-16 rounded-full ${
              isCallActive 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-400 hover:bg-green-300'
            }`}
          >
            {isCallActive ? (
              <PhoneOff className="w-8 h-8" />
            ) : (
              <Phone className="w-8 h-8" />
            )}
          </Button>
        </div>

        {/* Call Info */}
        {isCallActive && (
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Order #{id || "DEMO123"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}