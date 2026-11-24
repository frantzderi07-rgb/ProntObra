import { useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Building2, GraduationCap, HardHat, Search, ShieldCheck, Store, Users } from 'lucide-react';
import { useNav } from '@/lib/nav';
import { SPECIALTIES, type ProfessionalWithStats, type UserType } from '@/lib/types';
import ProfessionalCard from '@/components/ProfessionalCard';
import AuthModal from '@/components/AuthModal';
import CitySelectorSpMs from '@/components/CitySelectorSpMs';
import PageHero from '@/components/PageHero';

const audienceCards = [
  {
    title: 'Para Profissionais',
    description: 'Cadastre seu perfil gratuitamente e receba oportunidades da sua região. ',
    action: 'Criar perfil grátis',
    icon: HardHat,
    variant: 'professional',
  },
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
  const [authUserType, setAuthUserType] = useState<UserType>('client');
  const [searchSpecialty, setSearchSpecialty] = useState('all');
  const [searchCity, setSearchCity] = useState('');
  const highlightedProfessionals = (professionals.filter((professional) => professional.is_featured).length
    ? professionals.filter((professional) => professional.is_featured)
    : professionals).slice(0, 3);

  const goToAudience = (variant: typeof audienceCards[number]['variant']) => {
    if (variant === 'client' || variant === 'professional') {
      setAuthUserType(variant);
      setAuthOpen(true);
    } else {
      navigate({ name: variant === 'jobs' ? 'jobs' : 'learn' });
    }
  };
  const searchProfessionals = (event: React.FormEvent) => {
    event.preventDefault();
    navigate({ name: 'professionals', specialty: searchSpecialty, city: searchCity || undefined });
  };

  return (
    <>
      <div className="overflow-hidden bg-[#F7F5F0] text-stone-900">
        <PageHero
          showBreadcrumb={false}
          eyebrow="Construção civil conectada"
          icon={HardHat}
          title="Sua obra do início ao fim, com quem realmente entende."
          description="Encontre profissionais, oportunidades e conhecimento para transformar seus planos em uma obra bem-feita."
          actions={(
            <form onSubmit={searchProfessionals} className="rounded-2xl border border-stone-200 bg-stone-50 p-3 shadow-inner">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-end">
                <label className="block text-xs font-semibold text-stone-600">
                  Especialidade
                  <select value={searchSpecialty} onChange={(event) => setSearchSpecialty(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="all">Todas</option>
                    {SPECIALTIES.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-stone-600">
                  Cidade
                  <CitySelectorSpMs value={searchCity} onChange={setSearchCity} placeholder="Digite sua cidade" />
                </label>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C24E1B]">
                  <Search size={17} /> Buscar
                </button>
              </div>
            </form>
          )}
          visual={<img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85" alt="Casa pronta após uma obra" className="h-[300px] w-full object-cover sm:h-[390px]" />}
          floatingBadges={(
            <>
              <span className="absolute left-0 top-8 inline-flex items-center gap-2 rounded-xl border border-stone-100 bg-white/95 px-3 py-2 text-xs font-semibold text-stone-900 shadow-md sm:left-2 sm:top-10 sm:px-4 sm:text-sm">
                <ShieldCheck size={17} className="text-blue-600" /> Perfis Verificados
              </span>
              <span className="absolute right-0 top-20 inline-flex items-center gap-2 rounded-xl border border-stone-100 bg-white/95 px-3 py-2 text-xs font-semibold text-stone-900 shadow-md sm:right-2 sm:top-24 sm:px-4 sm:text-sm">
                <BriefcaseBusiness size={17} className="text-blue-600" /> Vagas e Obras Ativas
              </span>
              <span className="absolute bottom-7 left-0 inline-flex items-center gap-2 rounded-xl border border-stone-100 bg-white/95 px-3 py-2 text-xs font-semibold text-stone-900 shadow-md sm:bottom-10 sm:left-2 sm:px-4 sm:text-sm">
                <Store size={17} className="text-blue-600" /> Lojas Parceiras
              </span>
            </>
          )}
        />

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

        <section className="py-14 sm:py-16" aria-labelledby="audience-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Comece por aqui</p>
              <h2 id="audience-title" className="mt-2 section-title">O que você quer fazer hoje?</h2>
            </div>
            <div className="mt-8 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {audienceCards.map(({ title, description, action, icon: Icon, variant }, index) => (
                <article key={title} className="group flex flex-col rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg motion-safe:animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition duration-300 group-hover:bg-[#0B2863] group-hover:text-white"><Icon size={24} /></span>
                  <h3 className="mt-5 font-display text-xl font-bold text-stone-900">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>
                  <button type="button" onClick={() => goToAudience(variant)} className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-[#D95D24] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#C24E1B]">
                    {action}<ArrowRight size={17} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" defaultUserType={authUserType} />
    </>
  );
}
