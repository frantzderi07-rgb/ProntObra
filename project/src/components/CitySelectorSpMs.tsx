import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';

interface City {
  id: number;
  nome: string;
  uf: string;
  label: string;
}

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  dark?: boolean;
  stateFilter?: string;
  required?: boolean;
}

const CITIES_FALLBACK: City[] = [
  ['Andradina', 'SP'], ['Castilho', 'SP'], ['Murutinga do Sul', 'SP'], ['Ilha Solteira', 'SP'],
  ['Pereira Barreto', 'SP'], ['Mirandópolis', 'SP'], ['Nova Independência', 'SP'],
  ['Sud Mennucci', 'SP'], ['Guaraçaí', 'SP'], ['Auriflama', 'SP'], ['Araçatuba', 'SP'],
  ['São Paulo', 'SP'], ['Três Lagoas', 'MS'], ['Brasilândia', 'MS'], ['Água Clara', 'MS'],
  ['Selvíria', 'MS'], ['Ribas do Rio Pardo', 'MS'], ['Campo Grande', 'MS'],
].map(([nome, uf], index) => ({
  id: index,
  nome,
  uf,
  label: `${nome} - ${uf}`,
}));

interface IbgeMunicipality {
  id: number;
  nome: string;
  microrregiao?: { mesorregiao?: { UF?: { sigla?: string } } };
  'regiao-imediata'?: { 'regiao-intermediaria'?: { UF?: { sigla?: string } } };
}

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

export default function CitySelectorSpMs({
  value,
  onChange,
  placeholder = 'Busque sua cidade em todo o Brasil...',
  dark = false,
  stateFilter = '',
  required = false,
}: CitySelectorProps) {
  const [cities, setCities] = useState<City[]>(CITIES_FALLBACK);
  const [search, setSearch] = useState(value);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => setSearch(value), [value]);

  useEffect(() => {
    const controller = new AbortController();
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`IBGE respondeu com status ${response.status}`);
        return response.json() as Promise<IbgeMunicipality[]>;
      })
      .then((municipalities) => {
        const fromIbge = municipalities.flatMap((item) => {
          const uf = item.microrregiao?.mesorregiao?.UF?.sigla
            ?? item['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla;
          if (!uf) return [];
          return [{ id: item.id, nome: item.nome, uf, label: `${item.nome} - ${uf}` }];
        });
        if (fromIbge.length > 0) setCities(fromIbge);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.warn('Não foi possível carregar municípios do IBGE; usando cidades locais:', error);
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = useMemo(() => cities
    .filter((city) => !stateFilter || city.uf === stateFilter)
    .filter((city) => normalize(city.label).includes(normalize(search)))
    .slice(0, 30), [cities, search, stateFilter]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 transition-all ${
        dark
          ? 'border-white/20 bg-white/10 text-white focus-within:border-orange-500 focus-within:bg-white/15'
          : 'border-slate-300 bg-white text-slate-900 focus-within:border-orange-500'
      }`}>
        <MapPin className="h-5 w-5 shrink-0 text-orange-500" />
        <input
          type="text"
          value={search}
          required={required}
          aria-expanded={open}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value);
            onChange(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full bg-transparent text-sm outline-none ${dark ? 'placeholder:text-slate-300' : 'placeholder:text-slate-400'}`}
        />
        {search ? (
          <button type="button" onClick={() => { setSearch(''); onChange(''); }} className="text-slate-400 hover:text-orange-500" aria-label="Limpar cidade">
            <X className="h-4 w-4" />
          </button>
        ) : <Search className="h-4 w-4 shrink-0 text-slate-400" />}
      </div>

      {open && (
        <ul className="absolute z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 text-slate-800 shadow-xl">
          {filteredCities.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-slate-500">Nenhuma cidade encontrada no estado selecionado.</li>
          ) : filteredCities.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => { setSearch(city.label); onChange(city.label); setOpen(false); }}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-orange-50 hover:text-orange-600"
              >
                <span>{city.nome}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{city.uf}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
