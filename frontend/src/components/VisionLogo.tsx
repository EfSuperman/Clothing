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
    >
      {/* Outer diamond shape */}
      <path
        d="M60 8 L108 60 L60 112 L12 60 Z"
        stroke="url(#outerStroke)"
        strokeWidth="2.5"
        fill="none"
        opacity="0.7"
      />
      {/* Inner V shape - the main mark */}
      <path
        d="M36 38 L60 88 L84 38"
        stroke="url(#vStroke)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Left diagonal of inner diamond */}
      <path
        d="M60 8 L36 38"
        stroke="url(#diagStroke1)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      {/* Right diagonal of inner diamond */}
      <path
        d="M60 8 L84 38"
        stroke="url(#diagStroke2)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      
      {/* Top glow point */}
      <circle cx="60" cy="8" r="4" fill="white" opacity="0.9" />
      <circle cx="60" cy="8" r="8" fill="white" opacity="0.15" />
      
      {/* Bottom glow point */}
      <circle cx="60" cy="88" r="3" fill="#a5b4fc" opacity="0.6" />
      <circle cx="60" cy="88" r="6" fill="#818cf8" opacity="0.1" />

      <defs>
        <linearGradient id="outerStroke" x1="12" y1="8" x2="108" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#e0e7ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="vStroke" x1="36" y1="38" x2="84" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#a5b4fc" />
        </linearGradient>
        <linearGradient id="diagStroke1" x1="60" y1="8" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="diagStroke2" x1="60" y1="8" x2="84" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.7" />
        </linearGradient>
      </defs>
    </svg>
  );
}
