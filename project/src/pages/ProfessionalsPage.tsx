import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, Users } from 'lucide-react';
import { BRAZIL_STATES, SPECIALTIES } from '@/lib/types';
import type { ProfessionalWithStats } from '@/lib/types';
import { fetchProfessionals } from '@/lib/queries';
import ProfessionalCard from '@/components/ProfessionalCard';
import CitySelectorSpMs from '@/components/CitySelectorSpMs';

interface ProfessionalsPageProps {
  initialSpecialty?: string;
  initialCity?: string;
}

export default function ProfessionalsPage({ initialSpecialty = 'all', initialCity = 'all' }: ProfessionalsPageProps) {
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [city, setCity] = useState(initialCity === 'all' ? '' : initialCity);
  const [state, setState] = useState('');
  const [professionals, setProfessionals] = useState<ProfessionalWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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

  const activeFilters = (specialty !== 'all' ? 1 : 0) + (city ? 1 : 0) + (state ? 1 : 0);
  const clearFilters = () => { setSpecialty('all'); setCity(''); setState(''); };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Page header */}
      <div className="bg-navy-900 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Profissionais Disponíveis</h1>
          <p className="mt-1 text-white/70">Encontre profissionais qualificados em todo o Brasil.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search/filter bar */}
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
          <button onClick={() => setShowFilters(!showFilters)} className="btn-outline sm:hidden">
            <SlidersHorizontal size={16} /> Filtros {activeFilters > 0 && `(${activeFilters})`}
          </button>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="btn-ghost">
              <X size={16} /> Limpar filtros
            </button>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading ? 'Buscando...' : `${professionals.length} profissional(is) encontrado(s)`}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card h-80 animate-pulse overflow-hidden">
                <div className="h-40 bg-gray-200" />
                <div className="p-4">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
                  <div className="mt-4 h-3 w-full rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : professionals.length === 0 ? (
          <div className="card p-12 text-center">
            <Users size={40} className="mx-auto text-gray-300" />
            <h3 className="mt-4 font-display text-lg font-bold text-navy-900">Nenhum profissional encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">Tente alterar os filtros de busca.</p>
            <button onClick={clearFilters} className="btn-primary mt-4">Limpar filtros</button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((p) => (
              <ProfessionalCard key={p.id} professional={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
