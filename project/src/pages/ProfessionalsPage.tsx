import { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { BRAZIL_STATES, SPECIALTIES } from '@/lib/types';
import type { ProfessionalWithStats } from '@/lib/types';
import { fetchProfessionals } from '@/lib/queries';
import ProfessionalCard from '@/components/ProfessionalCard';
import CitySelectorSpMs from '@/components/CitySelectorSpMs';
import ProfessionalVisibilitySection from '@/components/ProfessionalVisibilitySection';

interface ProfessionalsPageProps {
  initialSpecialty?: string;
  initialCity?: string;
}

export default function ProfessionalsPage({ initialSpecialty = 'all', initialCity = 'all' }: ProfessionalsPageProps) {
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [city, setCity] = useState(initialCity === 'all' ? '' : initialCity);
  const [state, setState] = useState('');
  const [availability, setAvailability] = useState('');
  const [certification, setCertification] = useState('');
  const [professionals, setProfessionals] = useState<ProfessionalWithStats[]>([]);
  const [loading, setLoading] = useState(true);

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
  const clearFilters = () => { setSpecialty('all'); setCity(''); setState(''); setAvailability(''); setCertification(''); };
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
      <div className="bg-navy-900 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-300">Talentos da comunidade</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">Profissionais para sua obra</h1>
          <p className="mt-1 text-white/70">Encontre profissionais qualificados, compare perfis e fale diretamente com quem constrói.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section aria-labelledby="community-talents-title" className="mb-10">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div><p className="text-sm font-bold uppercase tracking-wider text-orange-700">Conheça quem faz acontecer</p><h2 id="community-talents-title" className="mt-1 section-title">Talentos da Comunidade</h2></div>
            <p className="text-sm text-slate-500">Perfis com especialidades, avaliações e selos quando disponíveis.</p>
          </div>
          {loading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => <div key={item} className="card h-64 animate-pulse bg-white" />)}
            </div>
          ) : communityTalents.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {communityTalents.map((person, index) => <div key={person.id} className="motion-safe:animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}><ProfessionalCard professional={person} /></div>)}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">Os perfis de profissionais aparecerão aqui conforme forem cadastrados.</p>
          )}
        </section>

        {/* Search/filter bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="input-field flex-1">
              <option value="all">Todas as especialidades</option>
              {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={state} onChange={(e) => { setState(e.target.value); setCity(''); }} className="input-field flex-1" aria-label="Filtrar por estado">
              <option value="">Todos os estados</option>
              {BRAZIL_STATES.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
            </select>
            <CitySelectorSpMs value={city} onChange={setCity} stateFilter={state} placeholder="Todas as cidades" />
            <select value={availability} onChange={(event) => setAvailability(event.target.value)} className="input-field" aria-label="Filtrar disponibilidade">
              <option value="">Qualquer agenda</option>
              <option value="available">Disponível agora / agenda livre</option>
              <option value="busy">Agenda ocupada</option>
            </select>
            <select value={certification} onChange={(event) => setCertification(event.target.value)} className="input-field" aria-label="Filtrar certificação">
              <option value="">Com ou sem certificação</option>
              <option value="certified">Certificados</option>
              <option value="uncertified">Sem certificação</option>
            </select>
          </div>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="btn-ghost">
              <X size={16} /> Limpar filtros
            </button>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading ? 'Buscando...' : `${filteredProfessionals.length} profissional(is) encontrado(s)`}
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
        ) : filteredProfessionals.length === 0 ? (
          <div className="card p-12 text-center">
            <Users size={40} className="mx-auto text-gray-300" />
            <h3 className="mt-4 font-display text-lg font-bold text-navy-900">Nenhum profissional encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">Tente alterar os filtros de busca.</p>
            <button onClick={clearFilters} className="btn-primary mt-4">Limpar filtros</button>
          </div>
        ) : otherProfessionals.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Todos os perfis desta busca estão na vitrine de talentos acima.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherProfessionals.map((p) => (
              <ProfessionalCard key={p.id} professional={p} />
            ))}
          </div>
        )}
      </div>
      <ProfessionalVisibilitySection />
    </div>
  );
}
