import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supportedCurrencies } from '@/utils/currencyConfig';

interface PhoneInputSectionedProps {
  value?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  label?: string;
  required?: boolean;
  className?: string;
  currency?: string;
}

export const PhoneInputSectioned: React.FC<PhoneInputSectionedProps> = ({
  value = '',
  onChange,
  onValidationChange,
  label,
  required = false,
  className = '',
  currency = 'NGN'
}) => {
  const [countryCode, setCountryCode] = useState(() => {
    const defaultCurrency = supportedCurrencies.find(c => c.code === currency) || supportedCurrencies[0];
    return `+${defaultCurrency.dialingCode}`;
  });
  const [firstPart, setFirstPart] = useState('');
  const [secondPart, setSecondPart] = useState('');
  const [thirdPart, setThirdPart] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  // Store callbacks in refs to avoid infinite re-renders
  const onChangeRef = useRef(onChange);
  const onValidationChangeRef = useRef(onValidationChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  // Validation check - exactly 10 digits (3 + 3 + 4)
  const isValid = firstPart.length === 3 && secondPart.length === 3 && thirdPart.length === 4;
  const showError = isTouched && !isValid && (firstPart || secondPart || thirdPart);

  // Notify parent of validation state
  useEffect(() => {
    onValidationChangeRef.current?.(isValid);
  }, [isValid]);

  // Update country code when currency changes
  useEffect(() => {
    const selectedCurrency = supportedCurrencies.find(c => c.code === currency) || supportedCurrencies[0];
    setCountryCode(`+${selectedCurrency.dialingCode}`);
  }, [currency]);

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(`+${value}`);
  };

  // Parse initial value
  useEffect(() => {
    if (value) {
      // Remove spaces and parse the phone number
      const cleanValue = value.replace(/\s+/g, '');
      // Find and extract country code from supported currencies
      const supportedDialingCodes = supportedCurrencies.map(c => c.dialingCode);
      let parsedCountryCode = countryCode;
      let remaining = cleanValue.slice(1); // Remove initial +
      
      for (const code of supportedDialingCodes) {
        if (cleanValue.startsWith(`+${code}`)) {
          parsedCountryCode = `+${code}`;
          remaining = cleanValue.slice(code.length + 1);
          setCountryCode(parsedCountryCode);
          break;
        }
      }
      
      if (remaining.length >= 6) {
        setFirstPart(remaining.slice(0, 3));
        setSecondPart(remaining.slice(3, 6));
        setThirdPart(remaining.slice(6));
      }
    }
  }, [value]);

  // Update parent when any part changes
  useEffect(() => {
    if (firstPart || secondPart || thirdPart) {
      const fullNumber = `${countryCode}${firstPart}${secondPart}${thirdPart}`;
      console.log('Phone input generating:', fullNumber); // Debug log
      onChangeRef.current?.(fullNumber);
    } else {
      onChangeRef.current?.(''); // Clear when empty
    }
  }, [countryCode, firstPart, secondPart, thirdPart]);

  const handleFirstPartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setFirstPart(value);
    setIsTouched(true);
    
    // Auto-focus next input when complete
    if (value.length === 3) {
      const nextInput = e.target.parentElement?.nextElementSibling?.querySelector('input');
      nextInput?.focus();
    }
  };

  const handleSecondPartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setSecondPart(value);
    setIsTouched(true);
    
    if (value.length === 3) {
      const nextInput = e.target.parentElement?.nextElementSibling?.querySelector('input');
      nextInput?.focus();
    }
  };

  const handleThirdPartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setThirdPart(value);
    setIsTouched(true);
  };

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium text-foreground mb-2 block">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="flex items-center space-x-2">
        <div className="w-24">
          <Select value={countryCode.slice(1)} onValueChange={handleCountryCodeChange}>
            <SelectTrigger className="h-12 text-center font-mono">
              <SelectValue placeholder="+234" />
            </SelectTrigger>
            <SelectContent>
              {supportedCurrencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.dialingCode}>
                  +{currency.dialingCode} ({currency.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <span className="text-muted-foreground">-</span>
        
        <div className="w-16">
          <Input
            type="tel"
            value={firstPart}
            onChange={handleFirstPartChange}
            placeholder="XXX"
            maxLength={3}
            className={`h-12 text-center font-mono ${showError && firstPart.length < 3 ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
        </div>
        
        <span className="text-muted-foreground">-</span>
        
        <div className="w-16">
          <Input
            type="tel"
            value={secondPart}
            onChange={handleSecondPartChange}
            placeholder="XXX"
            maxLength={3}
            className={`h-12 text-center font-mono ${showError && secondPart.length < 3 ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
        </div>
        
        <span className="text-muted-foreground">-</span>
        
        <div className="w-20">
          <Input
            type="tel"
            value={thirdPart}
            onChange={handleThirdPartChange}
            placeholder="XXXX"
            maxLength={4}
            className={`h-12 text-center font-mono ${showError && thirdPart.length < 4 ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
        </div>
      </div>
      
      {/* Validation message */}
      {showError && (
        <p className="text-xs text-destructive mt-1">
          Please enter all 10 digits of your phone number
        </p>
      )}
    </div>
  );
};


