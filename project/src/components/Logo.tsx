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
      <rect width="48" height="48" rx="10" fill="#07193D" />
      <text x="7" y="34" fill="#FFFFFF" fontFamily="Arial, sans-serif" fontSize="27" fontWeight="800" letterSpacing="-3">P</text>
      <text x="22" y="34" fill="#D95D24" fontFamily="Arial, sans-serif" fontSize="27" fontWeight="800" letterSpacing="-3">O</text>
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
      <ProntObraMonogramIcon className={`brand-logo-mark ${iconSizes[size]} shrink-0`} />
      <div className="min-w-0">
        <div translate="no" className="notranslate flex items-baseline whitespace-nowrap leading-none">
          <span className={`brand-logo-word brand-logo-word--first ${titleSizes[size]} font-extrabold tracking-tight text-[#07193D]`}>
            Pront
          </span>
          <span className={`brand-logo-word brand-logo-word--second ${titleSizes[size]} font-extrabold tracking-tight text-[#D95D24]`}>
            Obra
          </span>
        </div>
        <span translate="no" className="brand-logo-slogan notranslate mt-1 block text-left text-[8px] font-semibold leading-tight tracking-wide text-slate-700 sm:text-[10px]">
          Quem entende de obra, encontra na ProntObra
        </span>
      </div>
    </div>
  );
}
