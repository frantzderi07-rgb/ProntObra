import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Users } from 'lucide-react';
import { ALL_CITIES, SPECIALTIES } from '@/lib/types';
import type { ProfessionalWithStats } from '@/lib/types';
import { fetchProfessionals } from '@/lib/queries';
import ProfessionalCard from '@/components/ProfessionalCard';

interface ProfessionalsPageProps {
  initialSpecialty?: string;
  initialCity?: string;
}

export default function ProfessionalsPage({ initialSpecialty = 'all', initialCity = 'all' }: ProfessionalsPageProps) {
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [city, setCity] = useState(initialCity);
  const [professionals, setProfessionals] = useState<ProfessionalWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSpecialty(initialSpecialty);
    setCity(initialCity);
  }, [initialSpecialty, initialCity]);

  useEffect(() => {
    setLoading(true);
    fetchProfessionals({ specialty, city })
      .then(setProfessionals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [specialty, city]);

  const activeFilters = (specialty !== 'all' ? 1 : 0) + (city !== 'all' ? 1 : 0);
  const clearFilters = () => { setSpecialty('all'); setCity('all'); };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Page header */}
      <div className="bg-navy-900 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Profissionais Disponíveis</h1>
          <p className="mt-1 text-white/70">Encontre o profissional ideal para sua obra ou reforma na região</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search/filter bar */}
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
