import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Logo } from '@/components/ui/logo';
import { ShieldCheck, CheckCircle2, Lock, Globe, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AndroidDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidDownloadModal = ({ isOpen, onClose }: AndroidDownloadModalProps) => {
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Progress animation
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-close after 10 seconds
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, 15000);

    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative bg-background p-4 rounded-2xl shadow-lg">
              <Logo size="2xl" />
            </div>
          </div>

          {/* Header */}
          <DialogHeader className="text-center space-y-3">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Your Download is in Progress...
            </DialogTitle>
            <div className="flex items-center justify-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-lg font-semibold">OmniReceipts is Safe & Secure</p>
            </div>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-3" />
            <p className="text-center text-sm text-muted-foreground">
              {progress < 100 ? `Downloading... ${progress}%` : 'Download Complete! ✓'}
            </p>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Lock className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs font-medium text-foreground">Verified Safe</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs font-medium text-foreground">No Malware</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Download className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs font-medium text-foreground">Secure Download</p>
            </div>
          </div>

          {/* Installation Guide */}
          <div className="w-full space-y-4 bg-muted/50 rounded-lg p-5 border border-border/50">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Installation Guide
            </h3>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <p>Android may show a security warning - <span className="font-semibold text-foreground">this is normal</span> for apps outside the Google Play Store</p>
              </div>
              
              <div className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <p>Simply tap <span className="font-semibold text-foreground">"Download anyway"</span> or <span className="font-semibold text-foreground">"Install anyway"</span></p>
              </div>
              
              <div className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <p>Your device and data remain <span className="font-semibold text-foreground">completely safe</span></p>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="space-y-2 pt-3 border-t border-border/30">
              <div className="flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-foreground">Checked by VirusTotal</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-foreground">Trusted by small businesses worldwide</span>
              </div>
            </div>
          </div>

          {/* Why am I seeing this? - Expandable */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary hover:underline font-medium"
          >
            {showDetails ? '▼' : '▶'} Why am I seeing this?
          </button>

          {showDetails && (
            <div className="w-full bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground space-y-2 animate-fade-in">
              <p>
                Android's Play Protect shows warnings for apps not distributed through the Google Play Store. 
                This is a standard security measure, not an indication that OmniReceipts is unsafe.
              </p>
              <p className="font-medium text-foreground">
                OmniReceipts is a legitimate business application used by thousands of small business owners worldwide.
              </p>
            </div>
          )}

          {/* Close Button */}
          <Button 
            onClick={onClose}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Got it 👍
          </Button>

          {/* Support Email */}
          <p className="text-xs text-center text-muted-foreground">
            Questions? Email us: <a href="mailto:admin@OmniReceipts.com.ng" className="text-primary hover:underline font-medium">admin@OmniReceipts.com.ng</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};


