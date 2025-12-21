import { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';

interface EmailOTPLoginProps {
  onLoginSuccess: (user: any) => void;
  onBack?: () => void;
  prefilledEmail?: string; // For register flow
  isRegisterFlow?: boolean;
}

export default function EmailOTPLogin({ onLoginSuccess, onBack, prefilledEmail, isRegisterFlow = false }: EmailOTPLoginProps) {
  const [step, setStep] = useState<'email' | 'otp'>(prefilledEmail ? 'otp' : 'email');
  const [email, setEmail] = useState(prefilledEmail || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  // Auto-send OTP if email is prefilled (register flow)
  useEffect(() => {
    if (prefilledEmail && !loading) {
      sendOTP();
    }
  }, [prefilledEmail]);

  const sendOTP = async () => {
    const emailToUse = prefilledEmail || email;
    if (!emailToUse.trim()) {
      toast({ title: 'Error', description: 'Email is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = emailToUse.trim().toLowerCase();

      const response = await fetch('/api/otp/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
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

        toast({ title: 'Success', description: 'OTP sent to your email' });
      } else {
        const userMessage = data.error?.includes('not connected') 
          ? 'Email service is connecting. Please try again in a moment.'
          : 'Failed to send OTP. Please check your email and try again.';
          
        toast({ title: 'Unable to Send OTP', description: userMessage, variant: 'destructive' });
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
      const emailToUse = prefilledEmail || email;
      const normalizedEmail = emailToUse.trim().toLowerCase();

      const response = await fetch('/api/otp/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, otp: otp.trim() })
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess({ email: normalizedEmail, verified: true });
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
    <div className="min-h-screen bg-white flex flex-col px-6 py-8">
      {/* Back Button */}
      {onBack && (
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-600" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        {/* Email Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
          <Mail className="w-12 h-12 text-green-600" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Email Verification
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            {step === 'email'
              ? 'Enter your email address to receive verification code'
              : 'Enter your email address to receive verification code'
            }
          </p>
        </div>

        {step === 'email' ? (
          <div className="w-full space-y-6">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full h-14 rounded-full border-gray-300 px-6 bg-gray-50 text-center"
              disabled={loading}
            />

            <Button
              onClick={sendOTP}
              disabled={loading}
              className="w-full h-14 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold text-lg"
            >
              {loading ? 'Sending...' : 'Send Code'}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                className="text-gray-600 text-sm p-0 h-auto"
                onClick={() => {/* Handle try another way */}}
              >
                Try another way
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full h-14 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold text-lg"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <Button
                onClick={sendOTP}
                disabled={countdown > 0}
                variant="ghost"
                className="text-gray-600 text-sm p-0 h-auto"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
