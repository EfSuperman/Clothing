"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/store/currencyStore";

export default function GlobalProviders({ children }: { children: React.ReactNode }) {
  const detectAndSetCurrency = useCurrencyStore((state) => state.detectAndSetCurrency);

  useEffect(() => {
    // Detect currency on first load
    detectAndSetCurrency();
  }, [detectAndSetCurrency]);

  return <>{children}</>;
}
