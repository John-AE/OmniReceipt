import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
  '2xl': 'h-14 w-14',
  '3xl': 'h-24 w-24'
};

export const Logo = ({ className, size = 'md' }: LogoProps) => {
  return (
    <img 
      src="/logo.svg" 
      alt="OmniReceipts Logo" 
      className={cn(sizeClasses[size], 'object-contain', className)}
    />
  );
};

