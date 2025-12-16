import { useState } from 'react';
import { MessageCircle, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppOTPLoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function WhatsAppOTPLogin({ onLoginSuccess }: WhatsAppOTPLoginProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const formatPhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('08')) {
      return '+62' + digits.substring(1);
    }
    return digits.startsWith('62') ? '+' + digits : phone;
  };

  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      toast({ title: 'Error', description: 'Phone number is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const response = await fetch('/api/otp/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone })
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        setCountdown(60);
        
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        toast({ title: 'Success', description: 'OTP sent to your WhatsApp' });
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to send OTP', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast({ title: 'Error', description: 'Enter 6-digit OTP code', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const response = await fetch('/api/otp/whatsapp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone, otp: otp.trim() })
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        toast({ title: 'Error', description: data.error || 'Invalid OTP', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          WhatsApp Login
        </h1>
        <p className="text-muted-foreground text-sm">
          {step === 'phone' 
            ? 'Enter your WhatsApp number to receive OTP'
            : 'Enter the 6-digit code sent to your WhatsApp'
          }
        </p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+62812345678 or 08123456789"
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <Button
            onClick={sendOTP}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send OTP via WhatsApp'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">OTP Code</label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-10 h-10" />
                  <InputOTPSlot index={1} className="w-10 h-10" />
                  <InputOTPSlot index={2} className="w-10 h-10" />
                  <InputOTPSlot index={3} className="w-10 h-10" />
                  <InputOTPSlot index={4} className="w-10 h-10" />
                  <InputOTPSlot index={5} className="w-10 h-10" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setStep('phone')}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="flex-1"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </div>

          <div className="text-center">
            <Button
              onClick={sendOTP}
              disabled={countdown > 0}
              variant="ghost"
              className="text-sm"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}