"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  UploadCloud, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Plus,
  Check,
  Globe,
  Search,
  ChevronDown
} from "lucide-react";
import { COUNTRIES } from "@/utils/countries";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FormattedPrice } from "@/components/FormattedPrice";

interface Address {
  id: string;
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, token, user } = useAuthStore();
  const { rate, currency, symbol } = useCurrencyStore();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  
  // Structured Address State
  const [newAddress, setNewAddress] = useState({
    name: "Home",
    line1: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: ""
  });

  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);
  const filteredCountries = COUNTRIES.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const [deliveryMethod, setDeliveryMethod] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK_TRANSFER">("COD");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [globalSettings, setGlobalSettings] = useState({ taxRate: 0, deliveryFee: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAddressComplete = selectedAddressId !== "new" || (
    newAddress.name && 
    newAddress.line1 && 
    newAddress.city && 
    newAddress.state && 
    newAddress.zip && 
    newAddress.country &&
    newAddress.phone
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showCountryList && !(e.target as HTMLElement).closest('.country-dropdown-container')) {
        setShowCountryList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryList]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
    fetchGlobalSettings();
  }, [isAuthenticated, token]);

  const fetchGlobalSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      setGlobalSettings({
        taxRate: Number(data.taxRate),
        deliveryFee: Number(data.deliveryFee)
      });
    } catch (err) {
      console.error("Failed to fetch global settings", err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get("/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddressId(data[0].id);
      } else {
        setSelectedAddressId("new");
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    }
  };

  const subtotal = Number(getTotal() || 0);
  const tax = Number((subtotal * (Number(globalSettings.taxRate || 0) / 100)).toFixed(2));
  const shipping = Number(globalSettings.deliveryFee || 0);
  const total = Number((subtotal + tax + shipping).toFixed(2));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 px-4 text-center">
        <div className="h-24 w-24 glass rounded-[32px] flex items-center justify-center text-brand-indigo">
          <ShieldCheck size={48} strokeWidth={1} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">SECURE ACCESS REQUIRED.</h2>
          <p className="text-slate-500 font-medium">Please sign in to your account to proceed with secure checkout.</p>
        </div>
        <Link 
          href="/login?redirect=/checkout" 
          className="bg-white text-black px-10 py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
        >
          LOG IN TO CONTINUE
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 px-4 text-center">
        <h2 className="text-4xl font-black text-white uppercase tracking-tight">YOUR BAG IS EMPTY.</h2>
        <Link 
          href="/products" 
          className="text-brand-indigo font-bold uppercase tracking-widest hover:underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    const currentToken = useAuthStore.getState().token || token;
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      const { currency, symbol, rate } = useCurrencyStore.getState();

      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price * rate, // Convert to selected currency value
        customDesignUrl: item.customDesignUrl || null,
        name: item.name,
      }));

      formData.append("items", JSON.stringify(orderItems));
      formData.append("currency", currency);
      formData.append("currencySymbol", symbol);
      formData.append("rate", String(rate)); // Send conversion rate for backend calculation verification
      formData.append("paymentMethod", paymentMethod);
      
      formData.append("deliveryMethod", deliveryMethod);
      formData.append("shippingFee", String(shipping));
      formData.append("taxAmount", String(tax));
      formData.append("totalAmount", String(total));

      if (selectedAddressId === "new") {
        if (!newAddress.line1 || !newAddress.city) {
          setError("Please provide a complete shipping address.");
          setLoading(false);
          return;
        }
        // Append structured address fields
        formData.append("name", newAddress.name);
        formData.append("line1", newAddress.line1);
        formData.append("city", newAddress.city);
        formData.append("state", newAddress.state);
        formData.append("zip", newAddress.zip);
        formData.append("country", newAddress.country);
        formData.append("phone", newAddress.phone);
        formData.append("saveAddress", String(saveAddress));
      } else {
        if (!selectedAddressId) {
          setError("Please select an address.");
          setLoading(false);
          return;
        }
        formData.append("addressId", selectedAddressId);
      }

      if (paymentMethod === "BANK_TRANSFER") {
        if (!screenshot) {
          setError("Please upload your payment screenshot to verify the transfer.");
          setLoading(false);
          return;
        }
        formData.append("paymentScreenshot", screenshot);
      }

      // Failsafe token retrieval
      const localStorageData = typeof window !== 'undefined' ? localStorage.getItem('clothing-auth-storage') : null;
      let finalToken = currentToken;
      if (!finalToken && localStorageData) {
        try {
          const parsed = JSON.parse(localStorageData);
          finalToken = parsed.state?.token;
        } catch (e) {
          console.error("Error parsing auth storage", e);
        }
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${finalToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      clearCart();
      router.push("/order-success");
    } catch (err: any) {
      setError(err.message || "An error occurred while processing your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16">
          <Link href="/cart" className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest mb-6">
            <ChevronLeft size={14} /> Back to Bag
          </Link>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase">
            SECURE <span className="text-gradient">CHECKOUT.</span>
          </h1>
        </header>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-8 space-y-12">
            <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-12">
              {/* Shipping Section */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 glass rounded-xl flex items-center justify-center text-brand-indigo">
                    <Truck size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Shipping Information</h2>
                </div>
                
                <div className="glass-dark rounded-[32px] p-8 border border-white/5 space-y-8">
                  {/* Saved Addresses List */}
                  {addresses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`relative flex flex-col items-start p-6 rounded-2xl border transition-all text-left ${
                            selectedAddressId === addr.id 
                              ? "bg-brand-indigo/10 border-brand-indigo/50 text-white" 
                              : "bg-surface-950/50 border-white/5 text-slate-500 hover:border-white/10"
                          }`}
                        >
                          <span className="font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <MapPin size={12} /> {addr.name}
                          </span>
                          <span className="text-[10px] leading-relaxed opacity-80">
                            {addr.line1}, {addr.city}
                          </span>
                          {selectedAddressId === addr.id && <CheckCircle2 className="absolute top-4 right-4 text-brand-indigo" size={16} />}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSelectedAddressId("new")}
                        className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all text-center ${
                          selectedAddressId === "new" 
                            ? "bg-brand-indigo/10 border-brand-indigo/50 text-white" 
                            : "bg-surface-950/50 border-white/5 text-slate-500 border-dashed hover:border-white/20"
                        }`}
                      >
                        <Plus size={20} className="mb-2" />
                        <span className="font-bold text-[10px] uppercase tracking-widest">New Address</span>
                      </button>
                    </div>
                  )}

                  {/* Manual Entry or New Address */}
                  {(selectedAddressId === "new" || addresses.length === 0) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 pt-4 border-t border-white/5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Address Label</label>
                          <input
                            required
                            placeholder="Home, Office..."
                            className="w-full bg-surface-950/50 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-bold uppercase tracking-widest"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 relative country-dropdown-container">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Country</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                            <input
                              required
                              placeholder="Search country..."
                              className="w-full bg-surface-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-bold uppercase tracking-widest"
                              value={countrySearch || newAddress.country}
                              onFocus={() => setShowCountryList(true)}
                              onChange={(e) => {
                                setCountrySearch(e.target.value);
                                setShowCountryList(true);
                              }}
                            />
                            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 transition-transform ${showCountryList ? 'rotate-180' : ''}`} size={14} />
                          </div>

                          <AnimatePresence>
                            {showCountryList && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute z-50 left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto glass-dark border border-white/10 rounded-2xl p-2 custom-scrollbar shadow-2xl"
                              >
                                {filteredCountries.length > 0 ? (
                                  filteredCountries.map((country) => (
                                    <button
                                      key={country}
                                      type="button"
                                      onClick={() => {
                                        setNewAddress({...newAddress, country});
                                        setCountrySearch(country);
                                        setShowCountryList(false);
                                      }}
                                      className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:bg-brand-indigo/20 hover:text-white transition-all flex items-center justify-between group"
                                    >
                                      {country}
                                      {newAddress.country === country && <Check size={12} className="text-brand-indigo" />}
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">No results found</div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Street Address</label>
                        <input
                          required
                          placeholder="House number and street name..."
                          className="w-full bg-surface-950/50 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-medium"
                          value={newAddress.line1}
                          onChange={(e) => setNewAddress({...newAddress, line1: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">City</label>
                          <input
                            required
                            className="w-full bg-surface-950/50 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-medium"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">State</label>
                          <input
                            required
                            className="w-full bg-surface-950/50 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-medium"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 col-span-2 md:col-span-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Postal Code</label>
                          <input
                            required
                            className="w-full bg-surface-950/50 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-mono tracking-widest"
                            value={newAddress.zip}
                            onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Phone Number (For Delivery Contact)</label>
                        <input
                          required
                          type="tel"
                          placeholder="e.g. +92 300 1234567"
                          className="w-full bg-surface-950/50 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-bold tracking-widest"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                        />
                        <p className="text-[9px] text-slate-600 px-1 uppercase tracking-widest leading-relaxed">
                          We will only contact you if there is an issue with your delivery.
                        </p>
                      </div>

                      {isAuthenticated && (
                        <div className="flex items-center gap-3 px-1 pt-4 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => setSaveAddress(!saveAddress)}
                            className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                              saveAddress ? "bg-brand-indigo border-brand-indigo" : "bg-transparent border-white/20"
                            }`}
                          >
                            {saveAddress && <Check size={12} className="text-white" />}
                          </button>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer" onClick={() => setSaveAddress(!saveAddress)}>
                            Save this address for future acquisitions
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </section>

              {/* Delivery Section */}
              <section className={`space-y-8 transition-all duration-500 ${!isAddressComplete ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 glass rounded-xl flex items-center justify-center text-brand-indigo">
                      <Truck size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Delivery Choice</h2>
                  </div>
                  {!isAddressComplete && (
                    <span className="text-[10px] font-bold text-brand-rose uppercase tracking-widest flex items-center gap-2">
                       <AlertCircle size={12} /> Fill address to select
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("STANDARD")}
                    className={`relative flex flex-col items-start p-6 rounded-[24px] border transition-all text-left ${
                      deliveryMethod === "STANDARD" 
                        ? "bg-brand-indigo/10 border-brand-indigo/50 text-white" 
                        : "bg-surface-950/50 border-white/5 text-slate-500 hover:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between w-full mb-4">
                      <span className="font-bold text-xs uppercase tracking-[0.2em]">Standard</span>
                      <span className="text-xs font-black text-brand-indigo italic tracking-tighter">FREE</span>
                    </div>
                    <p className="text-[10px] opacity-60 leading-relaxed font-medium">3-5 Business Days. Reliable for your everyday essentials.</p>
                    {deliveryMethod === "STANDARD" && <CheckCircle2 className="absolute -top-2 -right-2 text-brand-indigo bg-surface-950 rounded-full" size={24} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("EXPRESS")}
                    className={`relative flex flex-col items-start p-6 rounded-[24px] border transition-all text-left ${
                      deliveryMethod === "EXPRESS" 
                        ? "bg-brand-indigo/10 border-brand-indigo/50 text-white" 
                        : "bg-surface-950/50 border-white/5 text-slate-500 hover:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between w-full mb-4">
                      <span className="font-bold text-xs uppercase tracking-[0.2em]">Express</span>
                      <span className="text-xs font-black text-brand-indigo italic tracking-tighter"><FormattedPrice amount={15} /></span>
                    </div>
                    <p className="text-[10px] opacity-60 leading-relaxed font-medium">1-2 Business Days. Priority handling for the visionary pace.</p>
                    {deliveryMethod === "EXPRESS" && <CheckCircle2 className="absolute -top-2 -right-2 text-brand-indigo bg-surface-950 rounded-full" size={24} />}
                  </button>
                </div>
              </section>

              {/* Payment Section */}
              <section className={`space-y-8 transition-all duration-500 ${!isAddressComplete ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 glass rounded-xl flex items-center justify-center text-brand-indigo">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Payment Method</h2>
                </div>

                <div className="glass-dark rounded-[32px] p-8 border border-white/5 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("COD")}
                      className={`relative flex flex-col items-start p-6 rounded-2xl border transition-all text-left group ${
                        paymentMethod === "COD" 
                          ? "bg-brand-indigo/10 border-brand-indigo/50 text-white" 
                          : "bg-surface-950/50 border-white/5 text-slate-500 hover:border-white/10"
                      }`}
                    >
                      <Banknote className="mb-4" size={24} />
                      <span className="font-bold text-sm uppercase tracking-widest mb-1">Cash on Delivery</span>
                      <span className="text-[10px] opacity-60 font-medium">Pay when your order arrives.</span>
                      {paymentMethod === "COD" && <CheckCircle2 className="absolute top-4 right-4 text-brand-indigo" size={20} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("BANK_TRANSFER")}
                      className={`relative flex flex-col items-start p-6 rounded-2xl border transition-all text-left group ${
                        paymentMethod === "BANK_TRANSFER" 
                          ? "bg-brand-indigo/10 border-brand-indigo/50 text-white" 
                          : "bg-surface-950/50 border-white/5 text-slate-500 hover:border-white/10"
                      }`}
                    >
                      <CreditCard className="mb-4" size={24} />
                      <span className="font-bold text-sm uppercase tracking-widest mb-1">Direct Bank Transfer</span>
                      <span className="text-[10px] opacity-60 font-medium">Instant verification via screenshot.</span>
                      {paymentMethod === "BANK_TRANSFER" && <CheckCircle2 className="absolute top-4 right-4 text-brand-indigo" size={20} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {paymentMethod === "BANK_TRANSFER" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-8 bg-surface-950/50 rounded-[24px] border border-white/5 space-y-8 mt-2">
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank Name</p>
                              <p className="text-sm font-bold text-white">ELITE LUXE BANK</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Number</p>
                              <p className="text-sm font-bold text-white tracking-widest">8829-1992-0012</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4 pt-4 border-t border-white/5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload Payment Proof</label>
                            <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-brand-indigo/30 transition-colors text-center cursor-pointer group">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <UploadCloud className="mx-auto mb-4 text-slate-600 group-hover:text-brand-indigo transition-colors" size={32} />
                              <p className="text-sm font-bold text-slate-400">
                                {screenshot ? screenshot.name : "Click or drag your screenshot here"}
                              </p>
                              <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">PNG, JPG up to 5MB</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 bg-brand-rose/10 border border-brand-rose/20 p-6 rounded-2xl text-brand-rose"
                >
                  <AlertCircle size={24} />
                  <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
                </motion.div>
              )}
            </form>
          </div>

          {/* Sidebar: Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="glass-dark rounded-[40px] p-10 border border-white/5 space-y-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">REVIEW ORDER</h2>
              
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, index) => (
                  <div key={`${item.productId}-${item.customDesignUrl || 'std'}-${index}`} className="flex justify-between items-center gap-4 py-4 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-surface-900 overflow-hidden border border-white/5">
                        <img src={item.imageURL} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[120px]">{item.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-white">
                      <FormattedPrice amount={item.price * item.quantity} />
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 uppercase font-bold tracking-widest">Subtotal</span>
                  <span className="text-white">
                    <FormattedPrice amount={subtotal} />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 uppercase font-bold tracking-widest">Tax ({globalSettings.taxRate}%)</span>
                  <span className="text-white">
                    <FormattedPrice amount={tax} />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 uppercase font-bold tracking-widest">Shipping</span>
                  <span className="text-white">
                    {shipping === 0 ? "FREE" : <FormattedPrice amount={shipping} />}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t border-white/10">
                  <span className="text-lg font-bold text-white uppercase tracking-tighter">Total Amount</span>
                  <span className="text-3xl font-black text-brand-indigo">
                    <FormattedPrice amount={total} />
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className={`w-full py-6 rounded-[20px] font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 overflow-hidden ${
                  loading 
                    ? "bg-surface-800 text-slate-500" 
                    : "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
                } disabled:cursor-not-allowed shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]`}
              >
                {loading ? "PROCESSING..." : "COMPLETE PURCHASE"}
              </button>

              <div className="flex items-center justify-center gap-4 text-slate-600 opacity-50">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
