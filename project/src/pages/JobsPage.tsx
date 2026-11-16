import { useState, useEffect } from 'react';
import { X, Briefcase, Plus, Store } from 'lucide-react';
import { useNav } from '@/lib/nav';
import { BRAZIL_STATES, SPECIALTIES } from '@/lib/types';
import type { Job } from '@/lib/types';
import { fetchJobs } from '@/lib/queries';
import JobCard from '@/components/JobCard';
import CitySelectorSpMs from '@/components/CitySelectorSpMs';

export default function JobsPage({ initialSpecialty = 'all', initialCity = 'all' }: { initialSpecialty?: string; initialCity?: string }) {
  const { navigate } = useNav();
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [city, setCity] = useState(initialCity === 'all' ? '' : initialCity);
  const [state, setState] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="bg-navy-900 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Vagas & Imóveis</h1>
              <p className="mt-1 text-white/70">Oportunidades de trabalho, serviços e imóveis divulgados por parceiros.</p>
            </div>
            <button onClick={() => navigate({ name: 'post-job' })} className="btn-primary self-start">
              <Plus size={18} /> Publicar Vaga
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="input-field flex-1">
              <option value="all">Todas as especialidades</option>
              {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={state} onChange={(e) => { setState(e.target.value); setCity(''); }} className="input-field flex-1" aria-label="Filtrar por estado">
              <option value="">Todos os estados</option>
              {BRAZIL_STATES.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
            </select>
            <CitySelectorSpMs value={city} onChange={setCity} stateFilter={state} placeholder="Todas as cidades" />
          </div>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="btn-ghost">
              <X size={16} /> Limpar filtros
            </button>
          )}
        </div>

        <p className="mb-4 text-sm text-gray-500">
          {loading ? 'Buscando...' : `${jobs.length} vaga(s) encontrada(s)`}
        </p>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card h-56 animate-pulse p-5">
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />
                <div className="mt-4 h-3 w-full rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card p-12 text-center">
            <Briefcase size={40} className="mx-auto text-gray-300" />
            <h3 className="mt-4 font-display text-lg font-bold text-navy-900">Nenhuma vaga encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">Não há vagas abertas com esses filtros no momento.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button onClick={clearFilters} className="btn-outline">Limpar filtros</button>
              <button onClick={() => navigate({ name: 'post-job' })} className="btn-primary">Publicar uma vaga</button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
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
      </div>
    </div>
  );
}
