import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PasscodeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const PasscodeInput: React.FC<PasscodeInputProps> = ({
  value = '',
  onChange,
  label,
  required = false,
  className = ''
}) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Parse initial value
  useEffect(() => {
    if (value && value.length <= 4) {
      const newDigits = value.split('').concat(['', '', '', '']).slice(0, 4);
      setDigits(newDigits);
    }
  }, [value]);

  // Update parent when digits change
  useEffect(() => {
    const passcode = digits.join('');
    if (passcode !== value) {
      onChange?.(passcode);
    }
  }, [digits, onChange, value]);

  const handleDigitChange = (index: number, newValue: string) => {
    // Only allow single digits
    const digit = newValue.replace(/\D/g, '').slice(-1);
    
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-focus next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newDigits = paste.split('').concat(['', '', '', '']).slice(0, 4);
    setDigits(newDigits);
    
    // Focus the next empty input or last input
    const nextEmptyIndex = newDigits.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 3;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium text-foreground mb-2 block">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="flex items-center justify-center space-x-3">
        {digits.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => inputRefs.current[index] = el}
            type="tel"
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            maxLength={1}
            className="w-12 h-12 text-center text-lg font-mono border-2 focus:border-primary"
            inputMode="numeric"
          />
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Enter your 4-digit passcode
      </p>
    </div>
  );
};

