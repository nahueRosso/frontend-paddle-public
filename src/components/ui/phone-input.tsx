"use client";

import * as React from "react";
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from "libphonenumber-js";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PhoneCountry = {
  code: CountryCode;
  name: string;
  dial: string;
  flag: string;
};

const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "UY", name: "Uruguay", dial: "+598", flag: "🇺🇾" },
  { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
  { code: "BR", name: "Brasil", dial: "+55", flag: "🇧🇷" },
  { code: "PY", name: "Paraguay", dial: "+595", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", dial: "+591", flag: "🇧🇴" },
  { code: "PE", name: "Perú", dial: "+51", flag: "🇵🇪" },
  { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { code: "VE", name: "Venezuela", dial: "+58", flag: "🇻🇪" },
  { code: "EC", name: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { code: "MX", name: "México", dial: "+52", flag: "🇲🇽" },
  { code: "ES", name: "España", dial: "+34", flag: "🇪🇸" },
  { code: "US", name: "EE.UU.", dial: "+1", flag: "🇺🇸" },
];

function parseValue(value: string): { countryCode: CountryCode; national: string } {
  const defaultResult = { countryCode: "AR" as CountryCode, national: "" };
  if (!value) return defaultResult;
  try {
    const parsed = parsePhoneNumber(value);
    if (parsed?.country) {
      return {
        countryCode: parsed.country as CountryCode,
        national: parsed.nationalNumber,
      };
    }
  } catch {
    // fall through
  }
  return defaultResult;
}

type PhoneInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
};

export function PhoneInput({
  value = "",
  onChange,
  onBlur,
  error,
  disabled,
  className,
  inputClassName,
  placeholder,
}: PhoneInputProps) {
  const parsed = React.useMemo(() => parseValue(value), [value]);
  const [countryCode, setCountryCode] = React.useState<CountryCode>(parsed.countryCode);
  const [national, setNational] = React.useState(parsed.national);
  const internalRef = React.useRef(false);

  React.useEffect(() => {
    if (internalRef.current) {
      internalRef.current = false;
      return;
    }
    const p = parseValue(value);
    setCountryCode(p.countryCode);
    setNational(p.national);
  }, [value]);

  const selectedCountry = PHONE_COUNTRIES.find((c) => c.code === countryCode) ?? PHONE_COUNTRIES[0];

  const emit = (code: CountryCode, nat: string) => {
    if (!onChange) return;
    const country = PHONE_COUNTRIES.find((c) => c.code === code) ?? PHONE_COUNTRIES[0];
    let digits = nat.replace(/\D/g, "");
    if (code === "AR" && digits.length === 10 && !digits.startsWith("9")) {
      digits = "9" + digits;
    }
    internalRef.current = true;
    onChange(digits ? `${country.dial}${digits}` : "");
  };

  const handleCountryChange = (code: string) => {
    const c = code as CountryCode;
    setCountryCode(c);
    emit(c, national);
  };

  const handleNationalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setNational(digits);
    emit(countryCode, digits);
  };

  const isValid = value ? isValidPhoneNumber(value) : null;

  return (
    <div className={cn("flex w-full gap-0", className)}>
      <Select
        value={countryCode}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "h-9 shrink-0 rounded-r-none border-r-0 border-white/10 bg-[#0A0B0D] px-2 text-sm text-[#E4E5E7] focus:z-10",
            error && "border-destructive",
          )}
          aria-label="Seleccionar país"
        >
          <SelectValue>
            <span className="flex items-center gap-1.5">
              <span className="text-base leading-none">{selectedCountry.flag}</span>
              <span className="text-[#9CA3AF]">{selectedCountry.dial}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {PHONE_COUNTRIES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span className="text-base">{country.flag}</span>
                <span className="text-[#E4E5E7]">{country.name}</span>
                <span className="text-[#6B7280]">{country.dial}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1">
        <input
          type="tel"
          inputMode="numeric"
          value={national}
          onChange={handleNationalChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder ?? "Ej: 91122334455"}
          aria-invalid={error}
          className={cn(
            "h-9 w-full rounded-l-none rounded-md border border-white/10 bg-[#0A0B0D] px-3 py-1 text-sm text-[#E4E5E7] shadow-xs transition-[color,box-shadow] outline-none",
            "placeholder:text-[#6B7280]",
            "focus-visible:border-[#D6FF3D]/50 focus-visible:ring-[#D6FF3D]/20 focus-visible:ring-[3px]",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            inputClassName,
          )}
        />
        {value && isValid !== null && (
          <span
            className={cn(
              "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium",
              isValid ? "text-emerald-500" : "text-destructive",
            )}
          >
            {isValid ? "✓" : "✗"}
          </span>
        )}
      </div>
    </div>
  );
}
