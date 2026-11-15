import { useState, useEffect } from 'react';
import { Search, X, Briefcase, Plus } from 'lucide-react';
import { useNav } from '@/lib/nav';
import { ALL_CITIES, SPECIALTIES } from '@/lib/types';
import type { Job } from '@/lib/types';
import { fetchJobs } from '@/lib/queries';
import JobCard from '@/components/JobCard';

export default function JobsPage() {
  const { navigate } = useNav();
  const [specialty, setSpecialty] = useState('all');
  const [city, setCity] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchJobs({ specialty, city })
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [specialty, city]);

  const activeFilters = (specialty !== 'all' ? 1 : 0) + (city !== 'all' ? 1 : 0);
  const clearFilters = () => { setSpecialty('all'); setCity('all'); };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="bg-navy-900 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Mural de Vagas e Orçamentos</h1>
              <p className="mt-1 text-white/70">Oportunidades de trabalho e pedidos de reforma na região</p>
            </div>
            <button onClick={() => navigate({ name: 'post-job' })} className="btn-primary self-start">
              <Plus size={18} /> Publicar Vaga
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="input-field flex-1">
              <option value="all">Todas as especialidades</option>
              {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="input-field flex-1">
              <option value="all">Todas as cidades</option>
              {ALL_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
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
      </div>
    </div>
  );
}
