import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Calculator, ClipboardList, Copy, Plus, Printer, Ruler, Trash2, Wrench } from 'lucide-react';
import ServicePriceReference from '@/components/ServicePriceReference';
import PageHero from '@/components/PageHero';

type ToolTab = 'budget' | 'diary' | 'materials';
interface BudgetLine { id: string; description: string; quantity: string; unitPrice: string }
interface DiaryNote { date: string; text: string }
interface DiaryProject { id: string; name: string; stages: boolean[]; notes: DiaryNote[] }

const stages = ['Fundação', 'Alvenaria', 'Elétrica / Hidráulica', 'Acabamento'];
const diaryStorageKey = 'prontobra:diario-obras';
const tabs: { id: ToolTab; label: string; icon: typeof Calculator }[] = [
  { id: 'budget', label: 'Gerador de Orçamento', icon: ClipboardList },
  { id: 'diary', label: 'Diário de Obra', icon: Wrench },
  { id: 'materials', label: 'Calculadora de Materiais', icon: Calculator },
];
const toolHighlights: { id: ToolTab; title: string; detail: string; image: string }[] = [
  { id: 'materials', title: 'Calculadora de Materiais', detail: 'Tenha uma estimativa inicial para sua obra.', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3a3f7f6f?auto=format&fit=crop&w=800&q=80' },
  { id: 'budget', title: 'Guia de Orçamento', detail: 'Organize serviços, quantidades e valores.', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80' },
  { id: 'diary', title: 'Checklist de Etapas', detail: 'Acompanhe o progresso e anote o dia a dia.', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80' },
];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>('budget');
  const [budgetTitle, setBudgetTitle] = useState('');
  const [client, setClient] = useState('');
  const [warranty, setWarranty] = useState('90 dias');
  const [lines, setLines] = useState<BudgetLine[]>([{ id: crypto.randomUUID(), description: '', quantity: '1', unitPrice: '' }]);
  const total = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0), 0);
  const [projects, setProjects] = useState<DiaryProject[]>([]);
  const [projectName, setProjectName] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [error, setError] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const area = useMemo(() => (Number(width) || 0) * (Number(height) || 0), [width, height]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(diaryStorageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setProjects(parsed as DiaryProject[]);
      }
    } catch (storageError) {
      console.error('Não foi possível carregar o diário de obra salvo:', storageError);
      setError('Não foi possível ler o diário salvo neste navegador.');
    }
  }, []);

  const persistProjects = (next: DiaryProject[]) => {
    try {
      localStorage.setItem(diaryStorageKey, JSON.stringify(next));
      setProjects(next);
      setError('');
    } catch (storageError) {
      console.error('Não foi possível salvar o diário de obra:', storageError);
      setError('Não foi possível salvar. Verifique o espaço disponível no navegador.');
    }
  };

  const addProject = (event: React.FormEvent) => {
    event.preventDefault();
    const name = projectName.trim();
    if (!name) return;
    persistProjects([{ id: crypto.randomUUID(), name, stages: stages.map(() => false), notes: [] }, ...projects]);
    setProjectName('');
  };

  const toggleStage = (project: DiaryProject, stageIndex: number) => {
    persistProjects(projects.map((item) => item.id === project.id
      ? { ...item, stages: item.stages.map((done, index) => index === stageIndex ? !done : done) }
      : item));
  };

  const addNote = (project: DiaryProject) => {
    const text = noteDraft.trim();
    if (!text) return;
    persistProjects(projects.map((item) => item.id === project.id
      ? { ...item, notes: [{ date: new Date().toLocaleDateString('pt-BR'), text }, ...item.notes] }
      : item));
    setNoteDraft('');
  };

  const copyBudget = async () => {
    const summary = [
      `*ORÇAMENTO PRONTOBRA*`,
      budgetTitle && `Serviço: ${budgetTitle}`,
      client && `Cliente: ${client}`,
      ...lines.filter((line) => line.description.trim()).map((line) => `• ${line.description}: ${line.quantity} x ${formatCurrency(Number(line.unitPrice) || 0)} = ${formatCurrency((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0))}`),
      `*Total: ${formatCurrency(total)}*`,
      `Garantia: ${warranty}`,
      'Valores sujeitos à confirmação após visita técnica.',
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setError('Orçamento copiado. Cole no WhatsApp para compartilhar.');
    } catch (copyError) {
      console.error('Não foi possível copiar o orçamento:', copyError);
      setError('Não foi possível copiar automaticamente. Selecione e copie o orçamento impresso.');
    }
  };

  return (
    <div className="min-h-screen animate-fade-in bg-[#F7F5F0]">
      <PageHero
        pageLabel="Ferramentas"
        eyebrow="Ferramentas da obra"
        icon={Wrench}
        title="Planeje, acompanhe e calcule."
        description="Recursos gratuitos para organizar o dia a dia da construção."
        actions={(
          <button type="button" onClick={() => { setActiveTab('budget'); document.getElementById('tools-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D24] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C24E1B]">
            Conhecer ferramentas <ArrowRight size={17} />
          </button>
        )}
        visual={(
          <div className="flex h-[280px] flex-col justify-between bg-gradient-to-br from-[#07193D] via-[#0B2863] to-[#1D4ED8] p-6 text-white sm:h-[320px] sm:p-8">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">Planejamento inteligente</span>
              <h2 className="mt-4 max-w-xs text-2xl font-bold">Sua obra, organizada em cada etapa.</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {tabs.map(({ id, label, icon: Icon }) => (
                <div key={id} className="rounded-2xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur">
                  <Icon className="mx-auto text-blue-100" size={22} />
                  <span className="mt-2 block text-[10px] font-semibold leading-tight sm:text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 grid gap-4 md:grid-cols-3" aria-label="Ferramentas rápidas">
          {toolHighlights.map((tool, index) => (
            <button key={tool.id} type="button" onClick={() => { setActiveTab(tool.id); setError(''); }}
              className="group relative isolate flex min-h-48 flex-col justify-end overflow-hidden rounded-2xl p-5 text-left text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg motion-safe:animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}>
              <img src={tool.image} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-transparent" />
              <span className="font-display text-lg font-bold">{tool.title}</span>
              <span className="mt-1 text-sm text-white/75">{tool.detail}</span>
            </button>
          ))}
        </section>
        <div id="tools-tabs" role="tablist" aria-label="Ferramentas da obra" className="mb-7 flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => { setActiveTab(id); setError(''); }} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === id ? 'bg-[#0B2863] text-white shadow' : 'border border-blue-100 bg-white text-stone-700 hover:border-blue-300'}`}><Icon size={17} />{label}</button>)}
        </div>
        {error && <p role="status" className={`mb-5 rounded-xl p-3 text-sm ${error.startsWith('Não foi') ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'}`}>{error}</p>}
        {activeTab === 'budget' && (
          <section className="print-area rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-sm font-bold uppercase tracking-wider text-orange-600">ProntObra · orçamento</p><h2 className="mt-1 font-display text-2xl font-bold text-navy-900">Gerador de Orçamento Profissional</h2><p className="mt-2 text-sm text-slate-600">Preencha os serviços e compartilhe uma estimativa organizada com seu cliente.</p></div><div className="flex gap-2 print:hidden"><button type="button" onClick={() => void copyBudget()} className="btn-outline !px-3"><Copy size={16} /> Copiar</button><button type="button" onClick={() => window.print()} className="btn-primary !px-3"><Printer size={16} /> Imprimir / PDF</button></div></div>
            <div className="hidden print:block"><p className="mt-5 text-sm">Serviço / obra: {budgetTitle || 'Não informado'}<br />Cliente: {client || 'Não informado'}</p></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 print:hidden"><label className="text-sm font-medium text-navy-700">Serviço / obra<input value={budgetTitle} onChange={(event) => setBudgetTitle(event.target.value)} className="input-field mt-1" placeholder="Ex.: Reforma residencial" /></label><label className="text-sm font-medium text-navy-700">Cliente<input value={client} onChange={(event) => setClient(event.target.value)} className="input-field mt-1" placeholder="Nome do cliente" /></label></div>
            <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-500"><th className="py-3 pr-3">Etapa / serviço</th><th className="w-24 py-3 pr-3">Qtd.</th><th className="w-36 py-3 pr-3">Valor unitário</th><th className="w-36 py-3 text-right">Subtotal</th><th className="w-12 print:hidden" /></tr></thead><tbody>{lines.map((line) => <tr key={line.id} className="border-b border-slate-100"><td className="py-2 pr-3"><input aria-label="Descrição do serviço" value={line.description} onChange={(event) => setLines(lines.map((item) => item.id === line.id ? { ...item, description: event.target.value } : item))} className="input-field" placeholder="Ex.: Preparação e pintura" /></td><td className="py-2 pr-3"><input aria-label="Quantidade" type="number" min="0" step="0.01" value={line.quantity} onChange={(event) => setLines(lines.map((item) => item.id === line.id ? { ...item, quantity: event.target.value } : item))} className="input-field" /></td><td className="py-2 pr-3"><input aria-label="Valor unitário" type="number" min="0" step="0.01" value={line.unitPrice} onChange={(event) => setLines(lines.map((item) => item.id === line.id ? { ...item, unitPrice: event.target.value } : item))} className="input-field" placeholder="0,00" /></td><td className="py-2 text-right font-semibold">{formatCurrency((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0))}</td><td className="py-2 text-right print:hidden"><button type="button" aria-label="Remover etapa" onClick={() => setLines(lines.filter((item) => item.id !== line.id))} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></td></tr>)}</tbody></table></div>
            <button type="button" onClick={() => setLines([...lines, { id: crypto.randomUUID(), description: '', quantity: '1', unitPrice: '' }])} className="btn-outline mt-3 !py-2 print:hidden"><Plus size={16} /> Adicionar etapa</button>
            <div className="mt-6 grid gap-5 border-t border-slate-200 pt-5 sm:grid-cols-2"><label className="text-sm font-medium text-navy-700 print:hidden">Garantia<select value={warranty} onChange={(event) => setWarranty(event.target.value)} className="input-field mt-1"><option>30 dias</option><option>90 dias</option><option>6 meses</option><option>1 ano</option></select></label><p className="text-sm text-slate-600">Garantia: <strong>{warranty}</strong><br />Orçamento sujeito à confirmação de escopo e visita técnica.</p><div className="sm:col-span-2 flex justify-end"><p className="text-right text-lg font-bold text-navy-900">Total estimado <span className="ml-3 text-2xl text-orange-600">{formatCurrency(total)}</span></p></div></div>
          </section>
        )}
        {activeTab === 'diary' && (
          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="font-display text-2xl font-bold text-navy-900">Diário de Obra</h2><p className="mt-2 text-sm text-slate-600">Acompanhe etapas, progresso e observações. Os registros ficam salvos neste navegador.</p><form onSubmit={addProject} className="mt-5 flex flex-col gap-3 sm:flex-row"><input required value={projectName} onChange={(event) => setProjectName(event.target.value)} className="input-field" placeholder="Nome da obra ou projeto" /><button className="btn-primary shrink-0"><Plus size={17} /> Nova obra</button></form></div>
            {projects.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Adicione uma obra para começar seu diário.</div> : projects.map((project) => {
              const progress = project.stages.filter(Boolean).length / stages.length * 100;
              return <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-display text-xl font-bold text-navy-900">{project.name}</h3><p className="mt-1 text-sm text-slate-500">Etapas concluídas: {project.stages.filter(Boolean).length} de {stages.length}</p></div><button type="button" aria-label={`Excluir ${project.name}`} onClick={() => persistProjects(projects.filter((item) => item.id !== project.id))} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-1 text-right text-xs font-bold text-orange-600">{progress}% concluído</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{stages.map((stage, index) => <label key={stage} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm text-slate-700"><input type="checkbox" checked={project.stages[index] ?? false} onChange={() => toggleStage(project, index)} className="h-4 w-4 accent-orange-500" />{stage}</label>)}</div><div className="mt-5 border-t border-slate-100 pt-4"><h4 className="font-semibold text-navy-800">Notas diárias</h4><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} className="input-field" placeholder="Registro de hoje..." /><button type="button" onClick={() => addNote(project)} className="btn-outline shrink-0">Salvar nota</button></div><ul className="mt-3 space-y-2">{project.notes.map((note, index) => <li key={`${note.date}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm"><strong className="mr-2 text-orange-600">{note.date}</strong>{note.text}</li>)}</ul></div></article>;
            })}
          </section>
        )}
        {activeTab === 'materials' && (
          <section className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-2">
            <div><div className="flex items-center gap-2 text-orange-600"><Ruler size={21} /><span className="text-sm font-bold uppercase">Estimativa inicial</span></div><h2 className="mt-3 font-display text-2xl font-bold text-navy-900">Calculadora Rápida de Materiais</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Informe largura e altura para estimar materiais de uma parede. Os resultados variam conforme o projeto e os produtos escolhidos.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-navy-700">Largura (m)<input type="number" min="0" step="0.01" value={width} onChange={(event) => setWidth(event.target.value)} className="input-field mt-1" placeholder="Ex.: 4" /></label><label className="text-sm font-medium text-navy-700">Altura (m)<input type="number" min="0" step="0.01" value={height} onChange={(event) => setHeight(event.target.value)} className="input-field mt-1" placeholder="Ex.: 2,8" /></label></div><p className="mt-4 text-sm font-semibold text-navy-700">Área calculada: {area.toFixed(2)} m²</p></div>
            <div className="rounded-2xl bg-navy-50 p-5"><h3 className="font-display text-lg font-bold text-navy-900">Materiais estimados</h3><div className="mt-4 space-y-3"><Estimate label="Tijolos cerâmicos" value={area > 0 ? `${Math.ceil(area * 25)} unidades` : '—'} /><Estimate label="Cimento (sacos de 50 kg)" value={area > 0 ? `${Math.ceil(area * 0.18)} sacos` : '—'} /><Estimate label="Tinta (2 demãos)" value={area > 0 ? `${Math.ceil(area * 0.2)} litros` : '—'} /></div><p className="mt-4 text-xs leading-relaxed text-slate-500">Estimativas aproximadas: 25 tijolos/m², 0,18 saco de cimento/m² e 10 m²/L por demão. Considere perdas e valide o cálculo com um profissional.</p></div>
          </section>
        )}
        <div className="mt-12"><ServicePriceReference /></div>
      </div>
    </div>
  );
}

function Estimate({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 border-b border-navy-100 pb-2 text-sm last:border-0"><span className="text-slate-600">{label}</span><strong className="text-navy-900">{value}</strong></div>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
