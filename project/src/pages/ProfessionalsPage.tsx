import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, HardHat, MapPin, ShieldCheck, Sparkles, Star, Users, X, Zap } from 'lucide-react';
import { BRAZIL_STATES, SPECIALTIES } from '@/lib/types';
import type { ProfessionalWithStats } from '@/lib/types';
import { fetchProfessionals } from '@/lib/queries';
import { useNav } from '@/lib/nav';
import ProfessionalCard from '@/components/ProfessionalCard';
import CitySelectorSpMs from '@/components/CitySelectorSpMs';
import ProfessionalVisibilitySection from '@/components/ProfessionalVisibilitySection';
import AuthModal from '@/components/AuthModal';

interface ProfessionalsPageProps {
  initialSpecialty?: string;
  initialCity?: string;
}

const specialtyPills = [
  { label: 'Todos', value: 'all' },
  { label: 'Pedreiro', value: 'Pedreiro' },
  { label: 'Eletricista', value: 'Eletricista' },
  { label: 'Encanador', value: 'Encanador' },
  { label: 'Pintor', value: 'Pintor' },
  { label: 'Engenheiro', value: 'Engenheiro' },
];

export default function ProfessionalsPage({ initialSpecialty = 'all', initialCity = 'all' }: ProfessionalsPageProps) {
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [city, setCity] = useState(initialCity === 'all' ? '' : initialCity);
  const [state, setState] = useState('');
  const [availability, setAvailability] = useState('');
  const [certification, setCertification] = useState('');
  const [professionals, setProfessionals] = useState<ProfessionalWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [planStep, setPlanStep] = useState<1 | 2 | 3>(1);
  const filtersRef = useRef<HTMLElement | null>(null);
  const { navigate } = useNav();

  useEffect(() => {
    setSpecialty(initialSpecialty);
    setCity(initialCity === 'all' ? '' : initialCity);
  }, [initialSpecialty, initialCity]);

  useEffect(() => {
    setLoading(true);
    fetchProfessionals({ specialty, city: city || 'all', state })
      .then(setProfessionals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [specialty, city, state]);

  const activeFilters = (specialty !== 'all' ? 1 : 0) + (city ? 1 : 0) + (state ? 1 : 0) + (availability ? 1 : 0) + (certification ? 1 : 0);
  const clearFilters = () => {
    setSpecialty('all');
    setCity('');
    setState('');
    setAvailability('');
    setCertification('');
  };
  const openPlans = (initialStep: 1 | 2 = 1) => {
    setPlanStep(initialStep);
    setPlansOpen(true);
  };
  const filteredProfessionals = professionals.filter((professional) =>
    (!availability || (availability === 'available' ? professional.is_available !== false : professional.is_available === false))
    && (!certification || (certification === 'certified' ? !!professional.certifications?.length : !professional.certifications?.length)),
  );
  const featuredProfessionals = filteredProfessionals.filter((professional) => professional.is_featured).slice(0, 3);
  const communityTalents = featuredProfessionals.length ? featuredProfessionals : filteredProfessionals.slice(0, 3);
  const communityTalentIds = new Set(communityTalents.map((professional) => professional.id));
  const otherProfessionals = filteredProfessionals.filter((professional) => !communityTalentIds.has(professional.id));

  return (
    <div className="min-h-screen bg-[#fcfaf6] animate-fade-in">
      <section className="overflow-hidden bg-[#f8f5ef]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-16">
          <div className="motion-safe:animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-800">
              <Sparkles size={16} /> Conexões que constroem
            </span>
            <h1 className="mt-5 max-w-xl font-display text-4xl font-extrabold leading-tight text-navy-950 sm:text-5xl">
              Profissionais para sua obra
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Encontre talentos da construção na sua região, compare perfis e fale diretamente com quem transforma projetos em realidade.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="btn-outline justify-center !border-slate-300 !text-navy-900 hover:!border-orange-400"
              >
                <MapPin size={17} /> Encontrar na minha cidade
              </button>
              <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary justify-center !bg-[#F97316] hover:!bg-orange-600">
                Sou Profissional: Cadastrar Grátis <ArrowRight size={17} />
              </button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-green-700" /> Perfis e avaliações em um só lugar</span>
              <span className="inline-flex items-center gap-2"><Zap size={17} className="text-orange-600" /> Contato direto</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl motion-safe:animate-slide-up">
            <img
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85"
              alt="Profissionais trabalhando em uma obra moderna"
              className="h-[300px] w-full rounded-[2rem] object-cover shadow-2xl sm:h-[390px]"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = 'https://images.unsplash.com/photo-1673865641469-34498379d8af?auto=format&fit=crop&w=1200&q=85';
              }}
            />
            <div className="absolute -left-2 top-5 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 px-3 py-2.5 text-sm font-semibold text-navy-900 shadow-lg motion-safe:animate-pulse sm:-left-5 sm:top-10 sm:px-4">
              <BadgeCheck size={19} className="text-green-600" /> Perfis Verificados
            </div>
            <div className="absolute -bottom-4 right-3 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 px-3 py-2.5 text-sm font-semibold text-navy-900 shadow-lg motion-safe:animate-pulse sm:-right-4 sm:bottom-8 sm:px-4">
              <Zap size={18} className="text-orange-500" /> Contato Direto
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1C1917] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-xl bg-orange-500/15 p-2.5 text-[#F97316]"><BriefcaseBusiness size={22} /></span>
            <div>
              <p className="font-display text-lg font-bold leading-snug sm:text-xl">
                Obras e empresas buscando profissionais agora!
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/70">
                Aumente sua visibilidade e receba solicitações de orçamento.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => navigate({ name: 'jobs' })} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400 hover:bg-white/5">
              Ver Vagas Abertas <ArrowRight size={16} />
            </button>
            <button type="button" onClick={() => openPlans(2)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
              Ativar Destaque VIP <Star size={16} fill="currentColor" />
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        {(loading || communityTalents.length > 0) && (
          <section aria-labelledby="community-talents-title" className="mb-10">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Conheça quem faz acontecer</p>
                <h2 id="community-talents-title" className="mt-1 section-title">Talentos da Comunidade</h2>
              </div>
              <p className="text-sm text-slate-500">Perfis com especialidades, avaliações e selos quando disponíveis.</p>
            </div>
            {loading ? (
              <div className="grid gap-5 md:grid-cols-3">
                {[1, 2, 3].map((item) => <div key={item} className="card h-64 animate-pulse bg-white" />)}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-3">
                {communityTalents.map((person, index) => (
                  <div key={person.id} className="motion-safe:animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <ProfessionalCard professional={person} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section ref={filtersRef} aria-labelledby="professional-filters-title" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-900/5 sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Encontre o profissional ideal</p>
              <h2 id="professional-filters-title" className="mt-1 font-display text-xl font-bold text-navy-900">Filtre por especialidade e região</h2>
            </div>
            <p className="text-sm text-slate-500">Refine a busca para encontrar quem atende sua obra.</p>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Especialidades populares</p>
            <div className="flex flex-wrap gap-2">
              {specialtyPills.map((pill) => (
                <button
                  type="button"
                  key={pill.value}
                  onClick={() => setSpecialty(pill.value)}
                  aria-pressed={specialty === pill.value}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 ${specialty === pill.value ? 'border-orange-500 bg-orange-500 text-white hover:!bg-orange-600' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="block text-xs font-semibold text-slate-600">
              Especialidade
              <select value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="input-field mt-1 w-full text-sm">
                <option value="all">Todas as especialidades</option>
                {SPECIALTIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Estado
              <select value={state} onChange={(event) => { setState(event.target.value); setCity(''); }} className="input-field mt-1 w-full text-sm">
                <option value="">Todos os estados</option>
                {BRAZIL_STATES.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Cidade
              <CitySelectorSpMs value={city} onChange={setCity} stateFilter={state} placeholder="Todas as cidades" />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Disponibilidade
              <select value={availability} onChange={(event) => setAvailability(event.target.value)} className="input-field mt-1 w-full text-sm">
                <option value="">Qualquer agenda</option>
                <option value="available">Disponível agora / agenda livre</option>
                <option value="busy">Agenda ocupada</option>
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Certificação
              <select value={certification} onChange={(event) => setCertification(event.target.value)} className="input-field mt-1 w-full text-sm">
                <option value="">Qualquer certificação</option>
                <option value="certified">Certificados</option>
                <option value="uncertified">Sem certificação</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">{activeFilters ? `${activeFilters} filtro(s) aplicado(s)` : 'Mostrando profissionais de todas as especialidades'}</p>
            {activeFilters > 0 && (
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-navy-900">
                <X size={16} /> Limpar filtros
              </button>
            )}
          </div>
        </section>

        <section aria-label="Resultados de profissionais" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {loading ? 'Buscando profissionais...' : `${filteredProfessionals.length} profissional(is) encontrado(s)`}
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="card h-80 animate-pulse overflow-hidden">
                  <div className="h-40 bg-gray-200" />
                  <div className="p-4">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
                    <div className="mt-4 h-3 w-full rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProfessionals.length === 0 ? (
            <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
              <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto]">
                <div>
                  <span className="inline-flex rounded-2xl bg-orange-50 p-3 text-orange-600"><HardHat size={27} /></span>
                  <h3 className="mt-4 font-display text-2xl font-bold text-navy-900">Novos talentos chegando na sua região!</h3>
                  <p className="mt-2 max-w-2xl leading-relaxed text-slate-600">
                    Ainda não há profissionais cadastrados com esses filtros exatos, mas você pode explorar outras especialidades ou cadastrar seu perfil agora mesmo para aparecer aqui.
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={clearFilters} className="btn-outline justify-center">Limpar filtros</button>
                    <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary justify-center !bg-[#F97316] hover:!bg-orange-600">
                      Cadastrar meu perfil profissional <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
                <div className="relative hidden h-48 w-52 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 md:flex">
                  <Users size={68} strokeWidth={1.3} className="text-orange-300" />
                  <span className="absolute right-4 top-4 rounded-full bg-white p-2 text-green-600 shadow"><BadgeCheck size={21} /></span>
                  <span className="absolute bottom-4 left-4 rounded-full bg-white p-2 text-orange-500 shadow"><Star size={19} fill="currentColor" /></span>
                </div>
              </div>
            </div>
          ) : otherProfessionals.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Todos os perfis desta busca estão na vitrine de talentos acima.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherProfessionals.map((person, index) => (
                <div key={person.id} className="motion-safe:animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
                  <ProfessionalCard professional={person} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <ProfessionalVisibilitySection
        plansOpen={plansOpen}
        step={planStep}
        onOpenPlans={openPlans}
        onStepChange={setPlanStep}
        onClosePlans={() => setPlansOpen(false)}
        onSignupRequest={() => setAuthOpen(true)}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" defaultUserType="professional" />
    </div>
  );
}
