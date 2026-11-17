import { useState } from 'react';
import { ArrowRight, BadgePercent, Building2, Calculator, GraduationCap, Handshake, Store, Truck, Wrench, X } from 'lucide-react';
import { useNav } from '@/lib/nav';
import { BRAZIL_STATES } from '@/lib/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const partnershipTypeOptions = [
  { value: 'Patrocinador (Ouro, Prata ou Bronze)', label: 'Patrocinador Ouro/Prata/Bronze' },
  { value: 'Clube de Descontos / Cupons', label: 'Clube de Descontos / Cupons' },
  { value: 'Loja Parceira / Divulgação', label: 'Loja Parceira / Divulgação' },
  { value: 'Outro', label: 'Outro' },
];

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length < 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

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
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [cityState, setCityState] = useState('');
  const [partnershipType, setPartnershipType] = useState('');
  const [tier, setTier] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const cnpjDigits = cnpj.replace(/\D/g, '');
    const phoneDigits = phone.replace(/\D/g, '');
    const locationMatch = cityState.trim().match(/^(.+?)\s*[-,]\s*([A-Za-z]{2})$/);
    if (cnpjDigits.length !== 14) {
      setError('Informe um CNPJ com 14 dígitos.');
      return;
    }
    if (phoneDigits.length !== 11) {
      setError('Informe um WhatsApp com DDD e 11 dígitos.');
      return;
    }
    if (!locationMatch) {
      setError('Informe a cidade e a UF. Exemplo: Andradina - SP.');
      return;
    }
    const state = locationMatch[2].toUpperCase();
    if (!BRAZIL_STATES.some(([uf]) => uf === state)) {
      setError('Informe uma UF válida. Exemplo: Andradina - SP.');
      return;
    }
    if (!isSupabaseConfigured) {
      setError('O envio está temporariamente indisponível. Tente novamente mais tarde.');
      return;
    }

    setLoading(true);
    const { error: insertError } = await supabase.from('solicitacoes_parceria').insert({
      nome_empresa: organization.trim(),
      cnpj: cnpjDigits,
      responsavel: name.trim(),
      email: email.trim(),
      whatsapp: phoneDigits,
      cidade: locationMatch[1].trim(),
      estado: state,
      categoria: segment,
      tipo_parceria: partnershipType,
      cota: partnershipType === partnershipTypeOptions[0].value ? tier || null : null,
      mensagem: message.trim(),
    });
    setLoading(false);
    if (insertError) {
      console.error('Não foi possível registrar a solicitação de parceria:', insertError);
      setError(insertError.message.includes('Aguarde alguns minutos')
        ? 'Aguarde alguns minutos antes de enviar outra proposta.'
        : 'Não foi possível enviar sua proposta. Confira os dados e tente novamente.');
      return;
    }
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/70 p-2 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="partner-contact-title" className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        {sent ? (
          <div className="py-7 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600"><Handshake size={27} /></span>
            <h2 id="partner-contact-title" className="mt-4 font-display text-xl font-bold text-navy-900">Proposta recebida!</h2>
            <p className="mt-2 text-sm text-gray-600">Recebemos sua proposta! Nossa equipe entrará em contato em breve.</p>
            <button type="button" onClick={onClose} className="btn-primary mt-5">Concluir</button>
          </div>
        ) : (
          <>
            <span className="text-sm font-bold uppercase tracking-wider text-orange-600">Fale com a administração</span>
            <h2 id="partner-contact-title" className="mt-2 font-display text-2xl font-bold text-navy-900">Vamos conversar sobre parceria?</h2>
            <form onSubmit={(event) => void submit(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-navy-700">Seu nome<input required value={name} onChange={(event) => setName(event.target.value)} className="input-field mt-1" /></label>
              <label className="block text-sm font-medium text-navy-700">Loja ou organização<input required value={organization} onChange={(event) => setOrganization(event.target.value)} className="input-field mt-1" /></label>
              <label className="block text-sm font-medium text-navy-700">E-mail para retorno<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input-field mt-1" /></label>
              <label className="block text-sm font-medium text-navy-700">CNPJ da Empresa
                <input required inputMode="numeric" autoComplete="on" maxLength={18} value={cnpj} onChange={(event) => setCnpj(formatCnpj(event.target.value))} placeholder="00.000.000/0000-00" className="input-field mt-1" />
              </label>
              <label className="block text-sm font-medium text-navy-700">WhatsApp / Telefone
                <input required type="tel" inputMode="tel" autoComplete="tel" maxLength={15} value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} placeholder="(00) 00000-0000" className="input-field mt-1" />
              </label>
              <label className="block text-sm font-medium text-navy-700">Cidade e Estado (UF)
                <input required maxLength={120} value={cityState} onChange={(event) => setCityState(event.target.value)} placeholder="Andradina - SP" className="input-field mt-1" />
              </label>
              <label className="block text-sm font-medium text-navy-700">Tipo de Parceria
                <select required value={partnershipType} onChange={(event) => setPartnershipType(event.target.value)} className="input-field mt-1">
                  <option value="">Selecione</option>
                  {partnershipTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
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
              {partnershipType === partnershipTypeOptions[0].value && (
                <label className="block text-sm font-medium text-navy-700">Cota de patrocínio
                  <select value={tier} onChange={(event) => setTier(event.target.value)} className="input-field mt-1">
                    <option value="">A definir</option>
                    <option value="Ouro">Ouro</option>
                    <option value="Prata">Prata</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                </label>
              )}
              <label className="block text-sm font-medium text-navy-700 sm:col-span-2">Conte um pouco sobre sua proposta
                <textarea required maxLength={1000} rows={4} value={message} onChange={(event) => setMessage(event.target.value)} className="input-field mt-1 resize-y" placeholder="Conte sobre sua empresa e a parceria que gostaria de propor." />
              </label>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full sm:col-span-2"><Handshake size={17} /> {loading ? 'Enviando proposta...' : 'Enviar proposta'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
