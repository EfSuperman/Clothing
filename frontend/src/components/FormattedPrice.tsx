import { useCurrencyStore } from "@/store/currencyStore";
import { useEffect, useState } from "react";

interface FormattedPriceProps {
  amount: number;
  className?: string;
  showCurrency?: boolean;
  customSymbol?: string;
}

export const FormattedPrice = ({ amount, className, showCurrency = true, customSymbol }: FormattedPriceProps) => {
  const { currency, symbol, rate, loading, detectAndSetCurrency } = useCurrencyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initial detection if not set
    if (currency === 'PKR' && rate === 1 && !loading) {
      // detectAndSetCurrency(); // This will trigger detection on mount
    }
  }, []);

  if (!mounted) return null;

  if (customSymbol) {
    return <span className={className}>{customSymbol}{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
  }

  const convertedAmount = amount * rate;
  
  const formatted = currency === 'PKR' 
    ? `${symbol} ${Math.round(convertedAmount).toLocaleString()}`
    : `${symbol}${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <span className={className}>
      {formatted}
    </span>
  );
};
