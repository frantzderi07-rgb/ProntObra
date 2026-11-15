import { useEffect, useState, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';

interface Cidade {
  id: number;
  nome: string;
  uf: 'SP' | 'MS';
  label: string;
}

interface CitySelectorProps {
  value: string;
  onChange: (cidadeSelecionada: string) => void;
  placeholder?: string;
  dark?: boolean;
}

const CIDADES_FALLBACK: Cidade[] = [
  { id: 3502101, nome: 'Andradina', uf: 'SP', label: 'Andradina - SP' },
  { id: 5008305, nome: 'Três Lagoas', uf: 'MS', label: 'Três Lagoas - MS' },
  { id: 3520400, nome: 'Ilha Solteira', uf: 'SP', label: 'Ilha Solteira - SP' },
  { id: 3537008, nome: 'Pereira Barreto', uf: 'SP', label: 'Pereira Barreto - SP' },
  { id: 3530508, nome: 'Mirandópolis', uf: 'SP', label: 'Mirandópolis - SP' },
  { id: 3502804, nome: 'Araçatuba', uf: 'SP', label: 'Araçatuba - SP' },
  { id: 5002704, nome: 'Campo Grande', uf: 'MS', label: 'Campo Grande - MS' },
  { id: 3550308, nome: 'São Paulo', uf: 'SP', label: 'São Paulo - SP' },
];

export default function CitySelectorSpMs({
  value,
  onChange,
  placeholder = 'Busque sua cidade em SP ou MS...',
  dark = false,
}: CitySelectorProps) {
  const [cidades, setCidades] = useState<Cidade[]>(CIDADES_FALLBACK);
  const [busca, setBusca] = useState(value);
  const [aberto, setAberto] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBusca(value);
  }, [value]);

  useEffect(() => {
    async function carregarCidadesIBGE() {
      try {
        const res = await fetch(
          'https://ibge.gov.br|MS/municipios?orderBy=nome'
        );
        if (!res.ok) return;
        const data = await res.json();
        const formatadas: Cidade[] = data.map((item: any) => {
          const uf = item.microrregiao.mesorregiao.UF.sigla as 'SP' | 'MS';
          return {
            id: item.id,
            nome: item.nome,
            uf,
            label: `${item.nome} - ${uf}`,
          };
        });
        if (formatadas.length > 0) setCidades(formatadas);
      } catch {
        // Mantém a lista principal caso esteja sem internet
      }
    }
    carregarCidadesIBGE();
  }, []);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const normalizar = (txt: string) =>
    txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filtradas = cidades
    .filter((c) => normalizar(c.label).includes(normalizar(busca)))
    .slice(0, 30);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 transition-all ${
          dark
            ? 'border-white/20 bg-white/10 text-white focus-within:border-orange-500 focus-within:bg-white/15'
            : 'border-slate-300 bg-white text-slate-900 focus-within:border-orange-500'
        }`}
      >
        <MapPin className="h-5 w-5 shrink-0 text-orange-500" />
        <input
          type="text"
          value={busca}
          onFocus={() => setAberto(true)}
          onChange={(e) => {
            setBusca(e.target.value);
            onChange(e.target.value);
            setAberto(true);
          }}
          placeholder={placeholder}
          className={`w-full bg-transparent text-sm outline-none ${
            dark ? 'placeholder:text-slate-300' : 'placeholder:text-slate-400'
          }`}
        />
        {busca ? (
          <button
            type="button"
            onClick={() => {
              setBusca('');
              onChange('');
            }}
            className="text-slate-400 hover:text-orange-500"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </div>

      {aberto && (
        <ul className="absolute z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 text-slate-800 shadow-xl">
          {filtradas.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-slate-500">
              Nenhuma cidade encontrada em SP ou MS.
            </li>
          ) : (
            filtradas.map((cidade) => (
              <li key={cidade.id}>
                <button
                  type="button"
                  onClick={() => {
                    setBusca(cidade.label);
                    onChange(cidade.label);
                    setAberto(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-orange-50 hover:text-orange-600"
                >
                  <span>{cidade.nome}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {cidade.uf}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
