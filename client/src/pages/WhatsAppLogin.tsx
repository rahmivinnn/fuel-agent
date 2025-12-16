import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WhatsAppOTPLogin from '@/components/WhatsAppOTPLogin';
import { MobileContainer } from '@/components/MobileContainer';

export default function WhatsAppLogin() {
  const [, setLocation] = useLocation();

  const handleLoginSuccess = (user: any) => {
    // Store user data and redirect to dashboard
    localStorage.setItem('driverId', user.phoneNumber);
    localStorage.setItem('driverPhone', user.phoneNumber);
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileContainer className="py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/login')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        <WhatsAppOTPLogin onLoginSuccess={handleLoginSuccess} />
      </MobileContainer>
    </div>
  );
}