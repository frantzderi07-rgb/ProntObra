import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface ProntObraMonogramIconProps {
  className?: string;
}

export function ProntObraMonogramIcon({ className = '' }: ProntObraMonogramIconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="8" fill="#0B2239" />
      <path d="M15 17V11H19V15" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 22L19 15L28 22" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 21V37M12 22H20A5 5 0 0 1 20 32H12" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29 19L35 22V28L30 31L27 29" stroke="#F97316" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 31L26.5 37L35.5 34.5" stroke="#F97316" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
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

  return (
    <div className={`group inline-flex max-w-full select-none items-center gap-2.5 py-1 ${className}`}>
      <ProntObraMonogramIcon className={`${iconSizes[size]} shrink-0 transition-transform duration-300 ease-out group-hover:scale-105`} />
      <div className="min-w-0">
        <div translate="no" className="notranslate flex items-baseline whitespace-nowrap leading-none">
          <span className={`${titleSizes[size]} font-extrabold tracking-tight text-[#0B2239]`}>
            Pront
          </span>
          <span className={`${titleSizes[size]} font-extrabold tracking-tight text-[#F97316]`}>
            Obra
          </span>
        </div>
        <span translate="no" className="notranslate mt-1 block text-left text-[8px] font-semibold leading-tight tracking-wide text-slate-700 sm:text-[10px]">
          Quem entende de obra, encontra na ProntObra.
        </span>
      </div>
    </div>
  );
}
