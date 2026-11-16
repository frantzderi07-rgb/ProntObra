import { useState } from 'react';
import { ArrowRight, BadgePercent, Building2, Calculator, GraduationCap, Handshake, Store, Truck, Wrench, X } from 'lucide-react';
import { useNav } from '@/lib/nav';

const benefits = [
  { title: 'Vantagens para clientes', description: 'Estruture condições especiais e descontos para a comunidade ProntObra conforme o acordo de parceria.', icon: BadgePercent },
  { title: 'Presença no ecossistema', description: 'Apresente sua loja, construtora ou instituição a profissionais e clientes que movimentam a construção.', icon: Store },
  { title: 'Conexão com ferramentas', description: 'Associe sua marca a conteúdos e à Calculadora de Materiais da área Para Aprender.', icon: Calculator },
];

export default function PartnersPage() {
  const { navigate } = useNav();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      <section className="bg-navy-950 px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <span className="badge border border-orange-400/30 bg-orange-500/10 text-orange-300"><Handshake size={14} /> Programa de Parcerias</span>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">Lojas Parceiras & Fabricantes</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">Aproxime sua marca de quem planeja, executa e transforma obras em todo o Brasil.</p>
            <button type="button" onClick={() => setContactOpen(true)} className="btn-primary mt-7"><Handshake size={17} /> Quero Ser Loja Parceira</button>
          </div>
          <div className="hidden justify-center lg:col-span-4 lg:flex">
            <div className="flex h-48 w-48 items-center justify-center rounded-full border border-orange-400/20 bg-orange-500/10 text-orange-400"><Building2 size={76} strokeWidth={1.3} /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-600">Crescemos em parceria</p>
          <h2 className="mt-2 section-title">Mais conexões entre materiais, conhecimento e trabalho.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map(({ title, description, icon: Icon }) => (
            <article key={title} className="card p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon size={23} /></span>
              <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <div className="mb-5"><p className="text-sm font-bold uppercase tracking-wider text-orange-600">Vitrine do ecossistema</p><h2 className="mt-2 font-display text-2xl font-bold text-navy-900">Sua marca ao lado de quem constrói.</h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            <PartnerCategory icon={Store} title="Lojas de materiais" detail="Apresente materiais, soluções e condições para profissionais e clientes." />
            <PartnerCategory icon={Wrench} title="Locadoras de equipamentos" detail="Divulgue andaimes, betoneiras, ferramentas e equipamentos para cada etapa." />
            <PartnerCategory icon={Truck} title="Construtoras e imobiliárias" detail="Destaque projetos, imóveis para venda ou locação e novas oportunidades." />
          </div>
        </div>
        <div className="mt-8 rounded-3xl bg-navy-950 p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-sm font-bold uppercase tracking-wider text-orange-300">Cotas de patrocínio</p><h2 className="mt-2 font-display text-2xl font-bold">Uma parceria no tamanho da sua marca.</h2></div><button type="button" onClick={() => setContactOpen(true)} className="btn-primary shrink-0">Quero Ser Parceiro <ArrowRight size={16} /></button></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">{[['Ouro', 'Máxima visibilidade'], ['Prata', 'Presença em destaque'], ['Bronze', 'Conexão com a comunidade']].map(([tier, detail]) => <div key={tier} className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="text-lg font-extrabold text-orange-300">{tier}</span><p className="mt-1 text-sm text-white/65">{detail}</p></div>)}</div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-orange-400"><GraduationCap size={24} /></span>
            <div><h3 className="font-display text-xl font-bold text-navy-900">Conheça a Calculadora de Materiais</h3><p className="mt-1 text-sm text-gray-600">Veja a experiência prática que pode apoiar clientes e profissionais no planejamento da obra.</p></div>
          </div>
          <button type="button" onClick={() => navigate({ name: 'learn' })} className="btn-outline shrink-0">Explorar ferramentas <ArrowRight size={16} /></button>
        </div>
      </section>

      {contactOpen && <PartnerContactModal onClose={() => setContactOpen(false)} />}
    </div>
  );
}

function PartnerCategory({ icon: Icon, title, detail }: { icon: typeof Store; title: string; detail: string }) {
  return <article className="card p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon size={22} /></span><h3 className="mt-4 font-display font-bold text-navy-900">{title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-600">{detail}</p></article>;
}

function PartnerContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [segment, setSegment] = useState('Loja de materiais de construção');
  const [sent, setSent] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Parceria ProntObra: ${organization}`);
    const body = encodeURIComponent(`Olá, administração da ProntObra!\n\nTenho interesse em conversar sobre uma parceria.\n\nNome: ${name}\nOrganização: ${organization}\nSegmento: ${segment}\nE-mail: ${email}`);
    window.location.href = `mailto:contato@prontobra.com.br?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="partner-contact-title" className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        {sent ? (
          <div className="py-7 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600"><Handshake size={27} /></span>
            <h2 id="partner-contact-title" className="mt-4 font-display text-xl font-bold text-navy-900">Contato preparado</h2>
            <p className="mt-2 text-sm text-gray-600">Seu aplicativo de e-mail foi solicitado com os dados da parceria. Se não abriu, escreva para contato@prontobra.com.br.</p>
            <button type="button" onClick={onClose} className="btn-primary mt-5">Concluir</button>
          </div>
        ) : (
          <>
            <span className="text-sm font-bold uppercase tracking-wider text-orange-600">Fale com a administração</span>
            <h2 id="partner-contact-title" className="mt-2 font-display text-2xl font-bold text-navy-900">Vamos conversar sobre parceria?</h2>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-navy-700">Seu nome<input required value={name} onChange={(event) => setName(event.target.value)} className="input-field mt-1" /></label>
              <label className="block text-sm font-medium text-navy-700">Loja ou organização<input required value={organization} onChange={(event) => setOrganization(event.target.value)} className="input-field mt-1" /></label>
              <label className="block text-sm font-medium text-navy-700">E-mail para retorno<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input-field mt-1" /></label>
              <label className="block text-sm font-medium text-navy-700">Segmento
                <select value={segment} onChange={(event) => setSegment(event.target.value)} className="input-field mt-1">
                  <option>Loja de materiais de construção</option>
                  <option>Fabricante</option>
                  <option>Construtora</option>
                  <option>Imobiliária / divulgação de imóveis</option>
                  <option>Instituição de ensino</option>
                  <option>Outro</option>
                </select>
              </label>
              <button type="submit" className="btn-primary w-full"><Handshake size={17} /> Enviar contato</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
