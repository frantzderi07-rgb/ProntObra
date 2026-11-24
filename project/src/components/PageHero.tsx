import type { ReactNode } from 'react';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { useNav } from '@/lib/nav';

interface PageHeroProps {
  pageLabel?: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
  visual?: ReactNode;
  floatingBadges?: ReactNode;
  showBreadcrumb?: boolean;
}

export default function PageHero({
  pageLabel,
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  visual,
  floatingBadges,
  showBreadcrumb = true,
}: PageHeroProps) {
  const { navigate } = useNav();

  return (
    <section className="bg-[#F7F5F0] px-4 pb-8 pt-5 sm:px-6 sm:pb-12 lg:px-8">
      {showBreadcrumb && pageLabel && (
        <nav aria-label="Caminho de navegação" className="mx-auto mb-5 flex max-w-7xl items-center gap-2 text-xs">
          <button type="button" onClick={() => navigate({ name: 'home' })} className="inline-flex items-center gap-1 font-semibold text-stone-600 transition hover:text-[#D95D24]">
            <ArrowLeft size={14} /> Voltar
          </button>
          <span aria-hidden="true" className="text-stone-300">|</span>
          <button type="button" onClick={() => navigate({ name: 'home' })} className="font-medium text-stone-500 transition hover:text-[#D95D24]">Início</button>
          <span aria-hidden="true" className="text-stone-300">›</span>
          <span aria-current="page" className="font-semibold text-stone-800">{pageLabel}</span>
        </nav>
      )}
      <div className={`mx-auto grid max-w-7xl items-center gap-8 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8 md:p-12 ${visual ? 'lg:grid-cols-2 lg:gap-14' : ''}`}>
        <div className="motion-safe:animate-slide-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            <Icon size={16} /> {eyebrow}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-stone-900 md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">{description}</p>
          {actions && <div className="mt-7">{actions}</div>}
        </div>
        {visual && (
          <div className="relative mx-auto w-full max-w-xl px-2 py-3 motion-safe:animate-slide-up sm:px-4">
            <div aria-hidden="true" className="absolute -inset-2 rounded-[2rem] bg-blue-600/15 blur-2xl" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(90deg, transparent 49.8%, #3B82F6 50%, transparent 50.2%), linear-gradient(0deg, transparent 49.8%, #3B82F6 50%, transparent 50.2%)', backgroundSize: '36px 36px' }} />
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-blue-400/40 shadow-[0_18px_50px_-20px_rgba(29,78,216,0.65)]">{visual}</div>
            {floatingBadges}
          </div>
        )}
      </div>
    </section>
  );
}
