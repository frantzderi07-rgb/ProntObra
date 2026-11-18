import { useMemo, useState } from 'react';

const servicePriceRows = [
  { category: 'Alvenaria', service: 'Assentamento de tijolos', unit: 'm²', min: 55, max: 110 },
  { category: 'Acabamento', service: 'Assentamento de piso cerâmico', unit: 'm²', min: 45, max: 100 },
  { category: 'Pintura', service: 'Pintura de parede (mão de obra)', unit: 'm²', min: 12, max: 30 },
  { category: 'Elétrica', service: 'Instalação de ponto elétrico', unit: 'ponto', min: 80, max: 180 },
  { category: 'Hidráulica', service: 'Instalação de ponto hidráulico', unit: 'ponto', min: 100, max: 240 },
  { category: 'Reforma', service: 'Reforma geral (mão de obra)', unit: 'diária', min: 180, max: 400 },
];

export default function ServicePriceReference() {
  const [category, setCategory] = useState('Todas');
  const rows = useMemo(
    () => category === 'Todas' ? servicePriceRows : servicePriceRows.filter((item) => item.category === category),
    [category],
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="prices-title">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold uppercase tracking-wider text-orange-600">Referência para planejar</p><h2 id="prices-title" className="mt-2 section-title">Preços médios de serviços</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">Faixas indicativas de mão de obra. Os valores variam conforme região, escopo, materiais e condições da obra.</p></div>
        <label className="text-sm font-semibold text-navy-800">Filtrar categoria
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="input-field mt-1 min-w-48">
            {['Todas', ...new Set(servicePriceRows.map((item) => item.category))].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Serviço</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Unidade</th><th className="px-4 py-3">Faixa média</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => <tr key={row.service} className="hover:bg-orange-50/50"><td className="px-4 py-3 font-semibold text-navy-800">{row.service}</td><td className="px-4 py-3 text-slate-600">{row.category}</td><td className="px-4 py-3 text-slate-600">{row.unit}</td><td className="px-4 py-3 font-semibold text-orange-700">R$ {row.min}–{row.max}{row.unit === 'diária' ? '/dia' : `/${row.unit}`}</td></tr>)}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">Valores ilustrativos para referência, não constituem proposta ou garantia de preço.</p>
    </section>
  );
}
