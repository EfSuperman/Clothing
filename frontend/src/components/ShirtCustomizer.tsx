"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import api from "@/lib/api";
import {
  OrbitControls,
  Center,
  useGLTF,
  Decal,
  Float,
  Sphere
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Image as ImageIcon, RotateCcw, Box, Check, Sparkles, Upload, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRef } from "react";
import { FormattedPrice } from "./FormattedPrice";

const COLORS = [
  { name: "Infinity Black", value: "#050505" },
  { name: "Visionary White", value: "#ffffff" },
  { name: "Brand Indigo", value: "#6366f1" },
  { name: "Rose Quartz", value: "#fda4af" },
  { name: "Emerald Glaze", value: "#10b981" },
  { name: "Amber Glow", value: "#f59e0b" },
];

const DEFAULT_DESIGNS = [
  { id: "none", name: "Clean", url: null },
  { id: "vision", name: "Vision Logo", url: "/vision_logo.png" },
];

class SceneErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { if (this.state.hasError) return this.props.fallback; return this.props.children; }
}

function DecalImage({ url, position, scale }: { url: string; position: [number, number, number]; scale: number }) {
  const texture = useLoader(THREE.TextureLoader, url);
  return <Decal position={position} rotation={[0, 0, 0]} scale={scale} map={texture} />;
}

function VisionaryCore({ color, decalUrl }: { color: string; decalUrl: string | null }) {
  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} />
        {decalUrl && (
          <SceneErrorBoundary key={decalUrl} fallback={null}>
            <Suspense fallback={null}>
              <DecalImage url={decalUrl} position={[0, 0, 0.45]} scale={0.4} />
            </Suspense>
          </SceneErrorBoundary>
        )}
      </Sphere>
    </Float>
  );
}

function Shirt({ color, decalUrl }: { color: string; decalUrl: string | null }) {
  const { nodes, materials } = useGLTF("/shirt_baked.glb") as any;

  useFrame((state, delta) => {
    if (materials.lambert1) materials.lambert1.color.lerp(new THREE.Color(color), 0.1);
  });

  const shirtGeometry = nodes.T_Shirt_male?.geometry || nodes.Object_4?.geometry || nodes.mesh_0?.geometry;

  return (
    <mesh castShadow geometry={shirtGeometry} material={materials.lambert1} dispose={null}>
      {decalUrl && (
        <SceneErrorBoundary key={decalUrl} fallback={null}>
          <Suspense fallback={null}>
            <DecalImage url={decalUrl} position={[0, 0.04, 0.15]} scale={0.15} />
          </Suspense>
        </SceneErrorBoundary>
      )}
    </mesh>
  );
}

export default function ShirtCustomizer() {
  const [currentColor, setCurrentColor] = useState(COLORS[1].value);
  const [selectedDesign, setSelectedDesign] = useState<string>("none");
  const [designs, setDesigns] = useState(DEFAULT_DESIGNS);
  const [isMobile, setIsMobile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [customDesign, setCustomDesign] = useState<File | null>(null);
  const [customDesignUrl, setCustomDesignUrl] = useState<string | null>(null);
  const [globalSettings, setGlobalSettings] = useState({ customizedShirtPrice: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchDecalsAndSettings = async () => {
      try {
        const [decalRes, settingsRes] = await Promise.all([
          api.get('/decals'),
          api.get('/settings')
        ]);

        const customDecals = decalRes.data.map((d: any) => ({
          id: d.id,
          name: d.name,
          url: d.imageUrl
        }));
        setDesigns([...DEFAULT_DESIGNS, ...customDecals]);
        setGlobalSettings({
          customizedShirtPrice: Number(settingsRes.data.customizedShirtPrice || 0)
        });
      } catch (error) {
        console.error("Failed to load decals or settings", error);
      }
    };
    fetchDecalsAndSettings();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomDesign(file);
      const url = URL.createObjectURL(file);
      setCustomDesignUrl(url);
      
      const newDesign = { id: "custom-user", name: "Your Design", url };
      setDesigns(prev => {
        const filtered = prev.filter(d => d.id !== "custom-user");
        return [newDesign, ...filtered];
      });
      setSelectedDesign("custom-user");
    }
  };

  const handleLockIn = async () => {
    setIsUploading(true);
    try {
      let finalDesignUrl = decalUrl;

      // If it's a custom user design, we might want to upload it to the server
      // But for now, as per user's request for "session based", we keep it local
      // or we can upload it if we want it to persist in the order.
      // Given the prompt "agr upload kr kay order krdy ga to hamary pass ajye ge",
      // we SHOULD upload it now to get a permanent URL for the cart.
      
      if (selectedDesign === "custom-user" && customDesign) {
        const formData = new FormData();
        formData.append("image", customDesign);
        formData.append("name", `Custom Design ${Date.now()}`);
        
        // Use the new public upload endpoint
        const res = await api.post("/decals/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        finalDesignUrl = res.data.imageUrl;
      }

      // Fetch a base product ID (e.g., the first T-Shirt)
      const { data: products } = await api.get("/products");
      const shirtProduct = products.find((p: any) => p.name.toLowerCase().includes("shirt")) || products[0];

      if (shirtProduct) {
        addItem({
          productId: shirtProduct.id,
          name: `Visionary Customized Shirt`, 
          price: globalSettings.customizedShirtPrice || shirtProduct.price,
          quantity: 1,
          imageURL: shirtProduct.imageURLs[0],
          customDesignUrl: finalDesignUrl || undefined
        });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      }
    } catch (error) {
      console.error("Failed to lock in selection", error);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const decalUrl = designs.find(d => d.id === selectedDesign)?.url || null;

  return (
    <section id="customizer" className="relative w-full min-h-[100dvh] bg-surface-950 flex flex-col md:flex-row pt-28 md:pt-20 overflow-x-hidden">
      <div className="flex-1 relative order-1 h-[40vh] md:h-auto min-h-[300px] px-8 md:px-0">
        <div className="absolute inset-0 z-0 pointer-events-none touch-none" style={{ touchAction: 'pan-y' }} />

        {/* Stationary Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-[20vw] md:text-[12vw] font-black text-white/[0.03] uppercase tracking-tighter leading-none"
          >
            VISION
          </motion.h1>
        </div>

        <Canvas
          shadows
          camera={{
            position: isMobile ? [0, 0, 1] : [0, 0, 2.5],
            fov: isMobile ? 35 : 25
          }}
          gl={{ preserveDrawingBuffer: true, alpha: true }}
          style={{ touchAction: 'pan-y' }}
        >
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Suspense fallback={<VisionaryCore color={currentColor} decalUrl={decalUrl} />}>
            <SceneErrorBoundary fallback={<VisionaryCore color={currentColor} decalUrl={decalUrl} />}>
              <Center><Shirt color={currentColor} decalUrl={decalUrl} /></Center>
            </SceneErrorBoundary>
          </Suspense>
          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom={isMobile ? false : true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            enableDamping
          />
        </Canvas>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 glass-dark rounded-full border border-white/5 pointer-events-none">
          <RotateCcw size={14} className="text-brand-indigo animate-spin-slow" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Drag to Explore 360°</span>
        </div>
      </div>

      <div className="w-full md:w-[500px] p-6 md:p-12 z-10 order-2 flex flex-col justify-center bg-surface-950/80 md:bg-surface-950 backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/5 pb-24 md:pb-12 h-auto md:max-h-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-8 md:space-y-12">
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-brand-indigo font-black text-xs uppercase tracking-[0.4em]">Studio Customizer</h3>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
              Visionary<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-rose to-brand-amber">Craftsmanship</span>
            </h2>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-6 gap-3">
              {COLORS.map((color) => (
                <button key={color.value} onClick={() => setCurrentColor(color.value)} className={`h-10 w-10 rounded-2xl border transition-all flex items-center justify-center ${currentColor === color.value ? "border-brand-indigo scale-110" : "border-white/5"}`} style={{ backgroundColor: color.value }}>
                  {currentColor === color.value && <Check size={14} className={color.value === "#ffffff" ? "text-black" : "text-white"} />}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl border border-dashed border-brand-indigo/30 bg-brand-indigo/5 text-brand-indigo hover:bg-brand-indigo/10 transition-all"
            >
              <Upload size={20} className="mb-2" />
              <span className="font-bold text-[10px] uppercase tracking-[0.2em]">Upload Own</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </button>

            {designs.map((design) => (
              <button key={design.id} onClick={() => setSelectedDesign(design.id)} className={`flex flex-col items-start p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl border transition-all ${selectedDesign === design.id ? "bg-brand-rose/10 border-brand-rose/50 text-white" : "bg-white/[0.02] border-white/5 text-slate-500 hover:bg-white/5"}`}>
                <span className="font-bold text-[10px] uppercase tracking-[0.2em] mb-2 truncate w-full text-left">{design.name}</span>
                <Sparkles size={10} className={selectedDesign === design.id ? "text-brand-rose" : "text-slate-700"} />
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.03] border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Price</span>
              <p className="text-white text-xs font-bold uppercase tracking-tight">Custom Studio Masterpiece</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white italic tracking-tighter leading-none">
                <FormattedPrice amount={globalSettings.customizedShirtPrice} />
              </p>
            </div>
          </div>

          <button 
            onClick={handleLockIn}
            disabled={isUploading}
            className={`w-full font-black py-5 rounded-[2rem] text-xs uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-2 ${
              isAdded 
                ? "bg-brand-cyan text-surface-950" 
                : "bg-white text-black hover:bg-brand-indigo hover:text-white"
            }`}
          >
            {isUploading ? "Processing..." : isAdded ? <><Check size={14} /> Added to Cart</> : <><Box size={14} /> Lock In Selection</>}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload("/shirt_baked.glb");
}
