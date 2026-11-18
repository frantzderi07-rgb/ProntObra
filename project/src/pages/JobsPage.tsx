import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Briefcase, CheckCircle2, HardHat, MessageCircle, Store, X } from 'lucide-react';
import { useNav } from '@/lib/nav';
import { BRAZIL_STATES, SPECIALTIES } from '@/lib/types';
import type { Job } from '@/lib/types';
import { fetchJobs } from '@/lib/queries';
import { whatsappAssistantNumber } from '@/lib/supabase';
import JobCard from '@/components/JobCard';
import CitySelectorSpMs from '@/components/CitySelectorSpMs';

const opportunityModels = [
  {
    title: 'Reforma Residencial Completa',
    specialty: 'Reforma Geral',
    detail: 'Pintura, acabamento e revisão de instalações em residência.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Instalação Elétrica Comercial',
    specialty: 'Eletricista',
    detail: 'Adequação de iluminação e pontos elétricos para espaço comercial.',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80',
  },
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length < 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function JobsPage({ initialSpecialty = 'all', initialCity = 'all' }: { initialSpecialty?: string; initialCity?: string }) {
  const { navigate } = useNav();
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [city, setCity] = useState(initialCity === 'all' ? '' : initialCity);
  const [state, setState] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertPhone, setAlertPhone] = useState('');
  const [alertError, setAlertError] = useState('');
  const [alertUrl, setAlertUrl] = useState('');
  const filtersRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setSpecialty(initialSpecialty);
    setCity(initialCity === 'all' ? '' : initialCity);
  }, [initialSpecialty, initialCity]);

  useEffect(() => {
    setLoading(true);
    fetchJobs({ specialty, city: city || 'all', state })
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [specialty, city, state]);

  const activeFilters = (specialty !== 'all' ? 1 : 0) + (city ? 1 : 0) + (state ? 1 : 0);
  const clearFilters = () => { setSpecialty('all'); setCity(''); setState(''); };
  const submitJobAlert = (event: React.FormEvent) => {
    event.preventDefault();
    setAlertError('');
    setAlertUrl('');
    if (alertPhone.replace(/\D/g, '').length !== 11) {
      setAlertError('Informe um WhatsApp com DDD e 11 dígitos.');
      return;
    }
    if (!city.trim()) {
      setAlertError('Selecione uma cidade nos filtros para personalizar seu alerta.');
      return;
    }
    const number = whatsappAssistantNumber.replace(/\D/g, '');
    if (!number) {
      setAlertError('O canal de alertas via WhatsApp está temporariamente indisponível.');
      return;
    }
    const message = `Olá! Quero receber alertas de novas oportunidades da ProntObra.\nMeu WhatsApp: ${alertPhone}\nCidade de interesse: ${city}`;
    setAlertUrl(`https://wa.me/${number}?text=${encodeURIComponent(message)}`);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf6] animate-fade-in">
      <section className="overflow-hidden bg-[#f8f5ef]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-16">
          <div className="motion-safe:animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-bold tracking-wide text-orange-800">
              <Briefcase size={16} /> OPORTUNIDADES NA CONSTRUÇÃO
            </span>
            <h1 className="mt-5 max-w-xl font-display text-4xl font-extrabold leading-tight text-navy-950 sm:text-5xl">
              Vagas e obras abertas na sua região
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Encontre novas oportunidades, conecte-se com empresas e dê o próximo passo na sua carreira na construção.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => navigate({ name: 'post-job' })} className="btn-primary justify-center !bg-[#F97316] hover:!bg-orange-600">
                Publicar uma vaga <ArrowRight size={17} />
              </button>
              <button type="button" onClick={() => navigate({ name: 'professionals' })} className="btn-outline justify-center !border-slate-300 !text-navy-900 hover:!border-orange-400">
                Ver profissionais
              </button>
            </div>
            <button type="button" onClick={() => filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-700">
              Explorar oportunidades <ArrowRight size={15} />
            </button>
          </div>

          <div className="relative mx-auto w-full max-w-xl motion-safe:animate-slide-up">
            <img
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85"
              alt="Pedreiro trabalhando em uma obra"
              className="h-[300px] w-full rounded-[2rem] object-cover shadow-2xl sm:h-[390px]"
            />
            <span className="absolute -left-2 top-5 inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 px-3 py-2.5 text-sm font-semibold text-navy-900 shadow-lg motion-safe:animate-pulse sm:-left-5 sm:top-10 sm:px-4">
              <HardHat size={19} className="text-orange-600" /> Obras Ativas
            </span>
            <span className="absolute -bottom-4 right-3 inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 px-3 py-2.5 text-sm font-semibold text-navy-900 shadow-lg motion-safe:animate-pulse sm:-right-4 sm:bottom-8 sm:px-4">
              <CheckCircle2 size={18} className="text-green-600" /> Contratação Direta
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        <section ref={filtersRef} aria-label="Filtros de oportunidades" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-900/5 sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Busque por região e profissão</p>
              <h2 className="mt-1 font-display text-xl font-bold text-navy-900">Oportunidades para sua próxima obra</h2>
            </div>
            <p className="text-sm text-slate-500">Ajuste os filtros para encontrar vagas mais relevantes.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-semibold text-slate-600">
              Especialidade
              <select value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="input-field mt-1 w-full text-sm">
                <option value="all">Todas as especialidades</option>
                {SPECIALTIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Estado
              <select value={state} onChange={(event) => { setState(event.target.value); setCity(''); }} className="input-field mt-1 w-full text-sm">
                <option value="">Todos os estados</option>
                {BRAZIL_STATES.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Cidade
              <CitySelectorSpMs value={city} onChange={setCity} stateFilter={state} placeholder="Todas as cidades" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">{activeFilters ? `${activeFilters} filtro(s) aplicado(s)` : 'Oportunidades em todas as regiões'}</p>
            {activeFilters > 0 && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"><X size={16} /> Limpar filtros</button>}
          </div>
        </section>

        <p className="mb-4 mt-6 text-sm text-gray-500">
          {loading ? 'Buscando...' : `${jobs.length} vaga(s) encontrada(s)`}
        </p>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="card h-56 animate-pulse p-5">
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />
                <div className="mt-4 h-3 w-full rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
              <section className="rounded-3xl border border-orange-100 bg-white p-6 text-center shadow-sm sm:p-8">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><Briefcase size={27} /></span>
                <h3 className="mt-4 font-display text-2xl font-bold text-navy-900">Ainda não há vagas com esses filtros</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">Publique uma oportunidade para encontrar profissionais ou ajuste os filtros para explorar outras regiões e especialidades.</p>
                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <button type="button" onClick={clearFilters} className="btn-outline justify-center">Limpar filtros</button>
                  <button type="button" onClick={() => navigate({ name: 'post-job' })} className="btn-primary justify-center !bg-[#F97316] hover:!bg-orange-600">Publicar uma vaga <ArrowRight size={17} /></button>
                </div>
              </section>

              <form onSubmit={submitJobAlert} className="rounded-3xl bg-[#1C1917] p-6 text-white shadow-lg sm:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 text-[#F97316]"><MessageCircle size={23} /></span>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-orange-300">Alerta de Vagas no WhatsApp</p>
                <h3 className="mt-1 font-display text-xl font-bold">Saiba quando surgir uma obra na sua cidade.</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">Informe seu WhatsApp e selecione a cidade nos filtros. Você poderá confirmar o alerta diretamente pelo WhatsApp.</p>
                <label className="mt-4 block text-sm font-medium text-white">
                  WhatsApp com DDD
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={15}
                    value={alertPhone}
                    onChange={(event) => { setAlertPhone(formatPhone(event.target.value)); setAlertUrl(''); }}
                    placeholder="(11) 99999-9999"
                    className="input-field mt-1 border-white/20 bg-white text-slate-900"
                  />
                </label>
                {alertError && <p role="alert" className="mt-3 rounded-lg bg-red-500/15 p-3 text-sm text-red-100">{alertError}</p>}
                {alertUrl ? (
                  <a href={alertUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700">
                    Confirmar alerta no WhatsApp <ArrowRight size={16} />
                  </a>
                ) : (
                  <button type="submit" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                    Preparar meu alerta <ArrowRight size={16} />
                  </button>
                )}
              </form>
            </div>

            <section aria-labelledby="opportunity-models-title">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-700">Inspire sua próxima oportunidade</p>
                <h3 id="opportunity-models-title" className="mt-1 font-display text-xl font-bold text-navy-900">Modelos de Oportunidade</h3>
                <p className="mt-1 text-sm text-slate-500">Exemplos ilustrativos de serviços que podem ser publicados na plataforma.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {opportunityModels.map((model, index) => (
                  <article key={model.title} className="group relative isolate flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg motion-safe:animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <img src={model.image} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-transparent" />
                    <span className="mb-auto self-start rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-navy-800">Modelo de Oportunidade</span>
                    <span className="text-xs font-semibold text-orange-300">{model.specialty}</span>
                    <h4 className="mt-1 font-display text-lg font-bold">{model.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-white/80">{model.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Store size={23} /></span>
              <div><p className="text-sm font-bold uppercase tracking-wider text-orange-600">Imóveis de parceiros</p><h2 className="mt-1 font-display text-xl font-bold text-navy-900">Casas e imóveis construídos por parceiros</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">As oportunidades imobiliárias serão apresentadas conforme a adesão de construtoras e imobiliárias parceiras. Lojas e empresas podem falar com a equipe para divulgar seus projetos.</p></div>
            </div>
            <button type="button" onClick={() => navigate({ name: 'partners' })} className="btn-outline shrink-0">Conhecer parceiros</button>
          </div>
        </section>
      </main>
    </div>
  );
}
