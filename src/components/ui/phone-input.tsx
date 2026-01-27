import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supportedCurrencies } from '@/utils/currencyConfig';

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  currency?: string;
}

export const PhoneInput = ({ value = '', onChange, label, required, className, currency = 'NGN' }: PhoneInputProps) => {
  const [countryCode, setCountryCode] = useState(() => {
    const defaultCurrency = supportedCurrencies.find(c => c.code === currency) || supportedCurrencies[0];
    return defaultCurrency.dialingCode;
  });
  const [networkCode, setNetworkCode] = useState('');
  const [firstPart, setFirstPart] = useState('');
  const [lastPart, setLastPart] = useState('');

  // Store onChange in a ref to avoid infinite re-renders
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Parse existing value when component mounts or value changes
  useEffect(() => {
    if (value && value !== `+${countryCode}${networkCode}${firstPart}${lastPart}`) {
      const cleanNumber = value.replace(/\D/g, '');
      if (cleanNumber.startsWith('234') && cleanNumber.length >= 4) {
        setCountryCode('234');
        const remaining = cleanNumber.slice(3);
        if (remaining.length >= 3) {
          setNetworkCode(remaining.slice(0, 3));
          if (remaining.length >= 6) {
            setFirstPart(remaining.slice(3, 6));
            if (remaining.length >= 10) {
              setLastPart(remaining.slice(6, 10));
            }
          }
        }
      }
    }
  }, [value]);

  // Update parent component when any part changes
  useEffect(() => {
    const fullNumber = `+${countryCode}${networkCode}${firstPart}${lastPart}`;
    if (onChangeRef.current && (networkCode || firstPart || lastPart)) {
      onChangeRef.current(fullNumber);
    }
  }, [countryCode, networkCode, firstPart, lastPart]);

  const handleNetworkCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setNetworkCode(value);
  };

  const handleFirstPartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setFirstPart(value);
  };

  const handleLastPartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setLastPart(value);
  };

  // Update country code when currency changes
  useEffect(() => {
    const selectedCurrency = supportedCurrencies.find(c => c.code === currency) || supportedCurrencies[0];
    setCountryCode(selectedCurrency.dialingCode);
  }, [currency]);

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <div className="flex-shrink-0">
          <Select value={countryCode} onValueChange={handleCountryCodeChange}>
            <SelectTrigger className="w-20 text-center">
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
        
        {/* Network Code */}
        <div className="flex-shrink-0">
          <Input
            value={networkCode}
            onChange={handleNetworkCodeChange}
            className="w-16 text-center"
            placeholder="803"
            maxLength={3}
          />
        </div>
        
        {/* First 3 digits */}
        <div className="flex-shrink-0">
          <Input
            value={firstPart}
            onChange={handleFirstPartChange}
            className="w-16 text-center"
            placeholder="123"
            maxLength={3}
          />
        </div>
        
        {/* Last 4 digits */}
        <div className="flex-shrink-0">
          <Input
            value={lastPart}
            onChange={handleLastPartChange}
            className="w-20 text-center"
            placeholder="4567"
            maxLength={4}
          />
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Format: +{countryCode} XXX XXX XXXX
      </div>
    </div>
  );
};

