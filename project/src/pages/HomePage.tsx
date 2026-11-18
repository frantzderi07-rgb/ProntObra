import { useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Building2, GraduationCap, HardHat, ShieldCheck, Store, Users } from 'lucide-react';
import { useNav } from '@/lib/nav';
import type { ProfessionalWithStats } from '@/lib/types';
import ProfessionalCard from '@/components/ProfessionalCard';
import AuthModal from '@/components/AuthModal';

const audienceCards = [
  {
    title: 'Para Clientes',
    description: 'Encontre profissionais, compare experiências e solicite orçamentos com mais segurança.',
    action: 'Criar conta de cliente',
    icon: Users,
    variant: 'client',
  },
  {
    title: 'Para Empresas',
    description: 'Publique oportunidades e encontre mão de obra qualificada para sua obra.',
    action: 'Explorar vagas e obras',
    icon: Building2,
    variant: 'jobs',
  },
  {
    title: 'Para Aprender',
    description: 'Acesse guias, capacitações e conteúdos práticos para evoluir na construção.',
    action: 'Explorar conteúdos',
    icon: GraduationCap,
    variant: 'learn',
  },
] as const;

export default function HomePage({ professionals = [] }: { professionals?: ProfessionalWithStats[] }) {
  const { navigate } = useNav();
  const [authOpen, setAuthOpen] = useState(false);
  const highlightedProfessionals = (professionals.filter((professional) => professional.is_featured).length
    ? professionals.filter((professional) => professional.is_featured)
    : professionals).slice(0, 3);

  const goToAudience = (variant: typeof audienceCards[number]['variant']) => {
    if (variant === 'client') setAuthOpen(true);
    else navigate({ name: variant === 'jobs' ? 'jobs' : 'learn' });
  };

  return (
    <>
      <div className="overflow-hidden bg-[#fcfaf6] text-navy-900">
        <section className="relative isolate overflow-hidden bg-navy-950 text-white">
          <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-25" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=85')" }} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-900/65" />
          <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:min-h-[590px] lg:grid-cols-12 lg:px-8 lg:py-20">
            <div className="motion-safe:animate-slide-up lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-300">
                <HardHat size={15} /> Construção civil conectada
              </span>
              <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
                Quem entende de obra, encontra na <span className="text-orange-400">ProntObra.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
                Profissionais, oportunidades e conhecimento para sua próxima obra, em um só lugar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button type="button" onClick={() => navigate({ name: 'professionals' })} className="btn-primary">
                  <Users size={18} /> Encontrar Profissionais
                </button>
                <button type="button" onClick={() => navigate({ name: 'jobs' })} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/15">
                  <BriefcaseBusiness size={18} /> Ver Vagas e Obras
                </button>
                <button type="button" onClick={() => navigate({ name: 'partners' })} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/15">
                  <Store size={18} /> Lojas e Parceiros
                </button>
              </div>
            </div>
            <div className="hidden motion-safe:animate-fade-in lg:col-span-5 lg:block">
              <div className="relative mx-auto max-w-md">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85" alt="Casa pronta após uma obra" className="h-[390px] w-full rounded-3xl object-cover shadow-2xl" />
                <div className="absolute -bottom-5 -left-8 rounded-2xl border border-white/10 bg-white p-4 text-navy-900 shadow-xl">
                  <p className="font-display font-bold">Sua próxima obra começa aqui.</p>
                  <p className="mt-1 text-xs text-slate-500">Pessoas, oportunidades e conhecimento.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="motion-safe:animate-slide-up">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Uma plataforma para construir junto</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-navy-900 sm:text-4xl">Da primeira busca à entrega da obra.</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">A ProntObra aproxima quem precisa construir de profissionais, empresas e parceiros. Descubra perfis, conheça oportunidades e organize os próximos passos com recursos feitos para o dia a dia da construção.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <span className="rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-navy-800"><span className="block text-orange-600">01</span>Encontre</span>
              <span className="rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-navy-800"><span className="block text-orange-600">02</span>Conecte</span>
              <span className="rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-navy-800"><span className="block text-orange-600">03</span>Construa</span>
            </div>
          </div>
          <div className="relative motion-safe:animate-slide-up">
            <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1100&q=85" alt="Profissionais analisam um projeto de construção" loading="lazy" className="h-72 w-full rounded-3xl object-cover shadow-lg sm:h-96" />
            <div className="absolute -bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-white p-4 shadow-lg sm:left-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><ShieldCheck size={23} /></span>
              <span><strong className="block text-sm text-navy-900">Conexões com mais clareza</strong><span className="text-xs text-slate-500">Perfis, oportunidades e informações em um só lugar.</span></span>
            </div>
          </div>
        </section>

        {highlightedProfessionals.length > 0 && (
          <section className="bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-8" aria-labelledby="home-professionals-title">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Talentos em destaque</p>
                  <h2 id="home-professionals-title" className="mt-2 section-title">Profissionais que fazem acontecer.</h2>
                </div>
                <button type="button" onClick={() => navigate({ name: 'professionals' })} className="inline-flex items-center gap-2 self-start text-sm font-bold text-orange-700 transition hover:gap-3 sm:self-auto">
                  Ver todos os profissionais <ArrowRight size={17} />
                </button>
              </div>
              <div className="mt-6 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
                {highlightedProfessionals.map((professional, index) => (
                  <div key={professional.id} className="motion-safe:animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <ProfessionalCard professional={professional} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-white py-14 sm:py-16" aria-labelledby="audience-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Comece por aqui</p>
              <h2 id="audience-title" className="mt-2 section-title">O que você quer fazer hoje?</h2>
            </div>
            <div className="mt-8 grid items-stretch gap-5 md:grid-cols-3">
              {audienceCards.map(({ title, description, action, icon: Icon, variant }, index) => (
                <article key={title} className="group flex flex-col rounded-2xl border border-slate-200 bg-[#fcfaf6] p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-orange-300 hover:shadow-xl motion-safe:animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700 transition duration-300 group-hover:bg-orange-500 group-hover:text-white"><Icon size={24} /></span>
                  <h3 className="mt-5 font-display text-xl font-bold text-navy-900">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>
                  <button type="button" onClick={() => goToAudience(variant)} className="mt-6 inline-flex items-center gap-2 self-start text-sm font-bold text-orange-700 transition group-hover:gap-3">
                    {action}<ArrowRight size={17} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" defaultUserType="client" />
    </>
  );
}
