import { useCurrencyStore } from "@/store/currencyStore";
import { useEffect, useState } from "react";

interface FormattedPriceProps {
  amount: number;
  className?: string;
  showCurrency?: boolean;
}

export const FormattedPrice = ({ amount, className, showCurrency = true }: FormattedPriceProps) => {
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
