import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'light';
}

interface ProntObraMonogramIconProps {
  className?: string;
}

export function ProntObraMonogramIcon({ className = '' }: ProntObraMonogramIconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="10" fill="#07193D" />
      <text x="7" y="34" fill="#FFFFFF" fontFamily="Arial, sans-serif" fontSize="27" fontWeight="800" letterSpacing="-3">P</text>
      <text x="22" y="34" fill="#D95D24" fontFamily="Arial, sans-serif" fontSize="27" fontWeight="800" letterSpacing="-3">O</text>
    </svg>
  );
}

export default function Logo({ className = '', size = 'md', tone = 'default' }: LogoProps) {
  const iconSizes = {
    sm: 'h-10 w-10',
    md: 'h-11 w-11',
    lg: 'h-14 w-14',
  };

  const titleSizes = {
    sm: 'text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };
  const titleColor = tone === 'light' ? 'text-white' : 'text-[#07193D]';
  const sloganColor = tone === 'light' ? 'text-white/85' : 'text-slate-700';

  return (
    <div className={`group inline-flex max-w-full select-none items-center gap-2.5 py-1 ${className}`}>
      <ProntObraMonogramIcon className={`${iconSizes[size]} shrink-0 transition-transform duration-300 ease-out group-hover:scale-105`} />
      <div className="min-w-0">
        <div translate="no" className="notranslate flex items-baseline whitespace-nowrap leading-none">
          <span className={`${titleSizes[size]} font-extrabold tracking-tight ${titleColor}`}>
            Pront
          </span>
          <span className={`${titleSizes[size]} font-extrabold tracking-tight text-[#D95D24]`}>
            Obra
          </span>
        </div>
        <span translate="no" className={`notranslate mt-1 block text-left text-[8px] font-semibold leading-tight tracking-wide sm:text-[10px] ${sloganColor}`}>
          Quem entende de obra, encontra na ProntObra
        </span>
      </div>
    </div>
  );
}
