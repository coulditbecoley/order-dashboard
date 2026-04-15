import React, { useState } from 'react';

// A custom logo that can fallback to a PNG if provided.
// If a public/logo.png exists, it will be loaded; on error, it falls back to the inline SVG.
export default function Logo({ size = 40 }: { size?: number }) {
  const w = size;
  const h = size;
  const [usePng, setUsePng] = useState(true);

  const onError = () => setUsePng(false);
  if (usePng) {
    return (
      <img src="/logo.png" alt="Kobra Dashboard logo" width={w} height={h} onError={onError} style={{ width: w, height: h }} />
    );
  }
  return (
    <svg width={w} height={h} viewBox="0 0 64 64" role="img" aria-label="Kobra Dashboard logo" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00e676"/>
          <stop offset="100%" stopColor="#00695c"/>
        </linearGradient>
      </defs>
      {/* shield/background */}
      <path d="M32 6 L60 14 L52 58 L12 58 L4 14 Z" fill="url(#logoGrad)" opacity="0.95"/>
      {/* cobra-inspired arc */}
      <path d="M18 22 C 28 28, 36 28, 46 22" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* cobra head shape */}
      <path d="M34 18 C 34 14, 42 12, 46 16 C 44 20, 40 20, 36 22" fill="white" opacity="0.9"/>
      {/* subtle K bar */}
      <path d="M22 38 L38 38" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      <text x="50" y="56" fill="white" fontSize="6" fontFamily="Arial" textAnchor="end" opacity="0.0">K</text>
    </svg>
  );
}
