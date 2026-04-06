"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/store/currencyStore";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GlobalProviders({ children }: { children: React.ReactNode }) {
  const detectAndSetCurrency = useCurrencyStore((state) => state.detectAndSetCurrency);

  useEffect(() => {
    // Detect currency on first load
    detectAndSetCurrency();
  }, [detectAndSetCurrency]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
