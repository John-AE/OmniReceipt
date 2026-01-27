import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference || !user) {
        setStatus('failed');
        return;
      }
    
      try {
        // Call our secure edge function for payment verification
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { reference }
        });

        if (error) {
          throw new Error(error.message || 'Verification failed');
        }

        if (data?.status && data?.data?.verified) {
          setStatus('success');
          toast({
            title: "Payment Successful!",
            description: `Welcome to the ${data.data.planType} plan!`,
          });
          
          // Immediately refresh the profile to get updated subscription info
          await refreshProfile();
    
          setTimeout(() => {
            navigate('/profile');
          }, 2000);
        } else {
          throw new Error(data?.error || 'Payment not successful');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
        toast({
          title: "Verification Failed",
          description: error instanceof Error ? error.message : 'Payment verification failed',
          variant: "destructive",
        });
      }
    };

    verifyPayment();
  }, [searchParams, user, navigate, refreshProfile]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6 text-center">
            {status === 'verifying' && (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <h2 className="text-xl font-semibold">Verifying Payment...</h2>
                <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <h2 className="text-xl font-semibold text-green-600">Payment Successful!</h2>
                <p className="text-muted-foreground">Your subscription has been activated. Redirecting to profile...</p>
              </div>
            )}
            
            {status === 'failed' && (
              <div className="space-y-4">
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold text-red-600">Payment Verification Failed</h2>
                <p className="text-muted-foreground">Please contact support if you believe this is an error.</p>
                <Button onClick={() => navigate('/profile')}>Return to Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default PaymentCallback;



