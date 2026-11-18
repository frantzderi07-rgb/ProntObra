import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface ProntObraHouseIconProps {
  className?: string;
}

export function ProntObraHouseIcon({ className = '' }: ProntObraHouseIconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 22 72 A 44 44 0 0 1 98 66 L 94 64 A 40 40 0 0 0 26 70 Z" fill="#0F172A" />
      <path d="M 29 66 A 37 37 0 0 1 91 63 L 88 61 A 34 34 0 0 0 32 64 Z" fill="#F97316" />
      <path d="M 32 42 L 56 32 L 88 41 L 88 45 L 56 36 L 32 46 Z" fill="#0F172A" />
      <polygon points="36,44 56,37 56,60 36,62" fill="#0F172A" />
      <polygon points="41,47 51,44 51,54 41,56" fill="#93C5FD" />
      <line x1="46" y1="45.5" x2="46" y2="55" stroke="#0F172A" strokeWidth="1.5" />
      <polygon points="56,37 84,45 84,61 56,60" fill="#EA580C" />
      <polygon points="56,41 87,49 87,52 56,44" fill="#F97316" />
      <rect x="66" y="49" width="13" height="10" fill="#93C5FD" stroke="#0F172A" strokeWidth="1.5" />
      <line x1="72.5" y1="49" x2="72.5" y2="59" stroke="#0F172A" strokeWidth="1.5" />
      <polygon points="32,62 50,60 50,82 32,84" fill="#0F172A" />
      <polygon points="37,65 46,64 46,77 37,78" fill="#93C5FD" />
      <line x1="41.5" y1="64.5" x2="41.5" y2="77.5" stroke="#0F172A" strokeWidth="1.5" />
      <rect x="50" y="60" width="16" height="21" fill="#EA580C" />
      <rect x="55" y="65" width="7" height="15" fill="#FDBA74" stroke="#0F172A" strokeWidth="1.5" />
      <rect x="66" y="60" width="19" height="20" fill="#0F172A" />
      <rect x="70" y="64" width="11" height="10" fill="#93C5FD" />
      <line x1="75.5" y1="64" x2="75.5" y2="74" stroke="#0F172A" strokeWidth="1.5" />
      <path d="M 16 83 Q 48 68 106 83 Q 52 77 16 89 Z" fill="#F97316" />
      <path d="M 22 90 Q 56 108 94 87 Q 56 99 22 90 Z" fill="#0F172A" />
    </svg>
  );
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
  };

  return (
    <>
      <style>{`
        @import url('https://googleapis.com');

        /* Nome ProntObra piscando mais lento e suave (3r.5 segundos) */
        @keyframes blinkBrandSlow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.99);
          }
        }

        /* Slogan entrando da direita para a esquerda e repetindo continuamente */
        @keyframes slideRightToLeftLoop {
          0% {
            opacity: 0;
            transform: translateX(60px);
          }
          18% {
            opacity: 1;
            transform: translateX(0);
          }
          82% {
            opacity: 1;
            transform: translateX(0);
          }
          95% {
            opacity: 0;
            transform: translateX(-25px);
          }
          100% {
            opacity: 0;
            transform: translateX(60px);
          }
        }

        /* Entrada do ícone circular */
        @keyframes iconPop {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-logo-icon {
          animation: iconPop 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-brand-blink-slow {
          animation: blinkBrandSlow 4.5s ease-in-out infinite;
        }

        .animate-slogan-rtl-loop {
          animation: slideRightToLeftLoop 7s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
      `}</style>

      <div
        className={`group inline-flex items-center gap-3.5 select-none cursor-pointer overflow-hidden py-1 ${className}`}
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {/* Ícone Vetorial Circular com Casa Moderna */}
        <div className="animate-logo-icon relative flex-shrink-0">
          <ProntObraHouseIcon className={`${iconSizes[size]} transition-transform duration-300 ease-out group-hover:scale-105`} />
        </div>

        {/* Nome Piscando Lento e Slogan Repetindo da Direita para a Esquerda */}
        <div className="flex flex-col justify-center">
          <div translate="no" className="notranslate animate-brand-blink-slow flex items-baseline leading-none">
            <span
              className={`${titleSizes[size]} font-extrabold tracking-tight text-[#0F172A]`}
            >
              Pront
            </span>
            <span
              className={`${titleSizes[size]} font-extrabold tracking-tight text-[#F97316]`}
            >
              Obra
            </span>
          </div>

          <span translate="no" className="notranslate animate-slogan-rtl-loop mt-1.5 hidden text-[11px] sm:inline sm:text-xs font-semibold tracking-wide text-slate-700">
            Quem entende de obra, encontra na ProntObra
          </span>
        </div>
      </div>
    </>
  );
}