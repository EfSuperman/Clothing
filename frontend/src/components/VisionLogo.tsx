"use client";

export default function VisionLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: "drop-shadow(0 0 8px rgba(129, 140, 248, 0.5)) drop-shadow(0 0 20px rgba(99, 102, 241, 0.3))" }}
    >
      {/* Outer diamond shape - thicker, brighter */}
      <path
        d="M60 6 L112 60 L60 114 L8 60 Z"
        stroke="url(#outerStroke)"
        strokeWidth="3.5"
        fill="none"
      />
      {/* Inner V shape - bold and bright */}
      <path
        d="M34 36 L60 92 L86 36"
        stroke="url(#vStroke)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#vGlow)"
      />
      {/* Left diagonal of inner frame */}
      <path
        d="M60 6 L34 36"
        stroke="url(#diagStroke)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        filter="url(#lineGlow)"
      />
      {/* Right diagonal of inner frame */}
      <path
        d="M60 6 L86 36"
        stroke="url(#diagStroke)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        filter="url(#lineGlow)"
      />
      
      {/* Top glow point - bright shine */}
      <circle cx="60" cy="6" r="5" fill="white" opacity="1" filter="url(#pointGlow)" />
      <circle cx="60" cy="6" r="10" fill="white" opacity="0.15" />
      
      {/* Bottom V point glow */}
      <circle cx="60" cy="92" r="3" fill="#c7d2fe" opacity="0.7" filter="url(#pointGlow)" />
      
      {/* Corner accents */}
      <circle cx="8" cy="60" r="2" fill="#a5b4fc" opacity="0.5" />
      <circle cx="112" cy="60" r="2" fill="#a5b4fc" opacity="0.5" />

      <defs>
        {/* Glow filters */}
        <filter id="vGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="lineGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="pointGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradients */}
        <linearGradient id="outerStroke" x1="8" y1="6" x2="112" y2="114" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="vStroke" x1="34" y1="36" x2="86" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
        <linearGradient id="diagStroke" x1="60" y1="6" x2="60" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
