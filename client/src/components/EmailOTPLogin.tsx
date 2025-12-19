import { useState, useEffect, useRef } from 'react';
import { Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';

interface EmailOTPLoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function EmailOTPLogin({ onLoginSuccess }: EmailOTPLoginProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const hasSentRef = useRef(false);

  const sendOTP = async () => {
    if (!email.trim()) {
      toast({ title: 'Error', description: 'Email is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Add to Resend contacts first
      await fetch('/api/resend/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          firstName: normalizedEmail.split('@')[0],
          lastName: ''
        })
      });

      // Small delay to ensure contact is added
      await new Promise(resolve => setTimeout(resolve, 500));

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
      const normalizedEmail = email.trim().toLowerCase();

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
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Email Login
        </h1>
        <p className="text-muted-foreground text-sm">
          {step === 'email'
            ? 'Enter your email to receive OTP'
            : 'Enter the 6-digit code sent to your email'
          }
        </p>
      </div>

      {step === 'email' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
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
            {loading ? 'Sending...' : 'Send OTP via Email'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">OTP Code</label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-10 h-10" /><InputOTPSlot index={1} className="w-10 h-10" /><InputOTPSlot index={2} className="w-10 h-10" /><InputOTPSlot index={3} className="w-10 h-10" /><InputOTPSlot index={4} className="w-10 h-10" /><InputOTPSlot index={5} className="w-10 h-10" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setStep('email')}
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
