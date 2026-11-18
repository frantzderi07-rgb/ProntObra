import { useState } from 'react';
import { CheckCircle2, Handshake, MessageCircle, X } from 'lucide-react';
import { BRAZIL_STATES } from '@/lib/types';
import { isSupabaseConfigured, supabase, whatsappAssistantNumber } from '@/lib/supabase';

const partnershipTypes = [
  { value: 'Patrocinador (Ouro, Prata ou Bronze)', label: 'Patrocinador Ouro/Prata/Bronze' },
  { value: 'Clube de Descontos / Cupons', label: 'Clube de Descontos / Cupons' },
  { value: 'Loja Parceira / Divulgação', label: 'Loja Parceira / Divulgação' },
  { value: 'Outro', label: 'Outro' },
];

const categories = [
  'Lojas de materiais',
  'Locadoras de equipamentos',
  'Construtoras e imobiliárias',
  'Fabricante',
  'Instituição de ensino',
  'Outro',
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

export default function PartnerRequestModal({
  initialCategory = '',
  initialTier = '',
  onClose,
}: {
  initialCategory?: string;
  initialTier?: string;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [segment, setSegment] = useState(initialCategory);
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [cityState, setCityState] = useState('');
  const [partnershipType, setPartnershipType] = useState(initialTier ? partnershipTypes[0].value : initialCategory ? partnershipTypes[2].value : '');
  const [tier, setTier] = useState(initialTier);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const partnerNumber = (import.meta.env.VITE_WHATSAPP_PARTNERS_NUMBER || whatsappAssistantNumber).replace(/\D/g, '');
  const whatsappUrl = partnerNumber ? `https://wa.me/${partnerNumber}?text=${encodeURIComponent(
    `Olá! Acabei de enviar uma solicitação de parceria ProntObra.\nEmpresa: ${organization}\nCota: ${tier || 'A definir'}\nResponsável: ${name}`,
  )}` : '';

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
      categoria: segment || null,
      tipo_parceria: partnershipType,
      cota: partnershipType === partnershipTypes[0].value ? tier || null : null,
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
    <div className="fixed inset-0 z-[70] flex items-start overflow-y-auto bg-navy-950/70 p-3 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="partner-contact-title" className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:max-h-[92vh] sm:p-8" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        {sent ? (
          <div className="py-7 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600"><CheckCircle2 size={29} /></span>
            <h2 id="partner-contact-title" className="mt-4 font-display text-xl font-bold text-navy-900">Proposta recebida!</h2>
            <p className="mt-2 text-sm text-gray-600">Recebemos sua proposta! Nossa equipe entrará em contato em breve.</p>
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5"><MessageCircle size={17} /> Agilizar pelo WhatsApp</a>}
            <div><button type="button" onClick={onClose} className="btn-outline mt-4">Concluir</button></div>
          </div>
        ) : (
          <>
            <span className="text-sm font-bold uppercase tracking-wider text-orange-600">Fale com a administração</span>
            <h2 id="partner-contact-title" className="mt-2 pr-8 font-display text-2xl font-bold text-navy-900">Vamos conversar sobre parceria</h2>
            <p className="mt-1 text-sm text-slate-600">Conte um pouco sobre sua empresa. Os campos marcados são obrigatórios.</p>
            <form onSubmit={(event) => void submit(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-navy-700">Seu nome<input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="input-field mt-1" /></label>
              <label className="block text-sm font-medium text-navy-700">Loja ou organização<input required maxLength={120} value={organization} onChange={(event) => setOrganization(event.target.value)} className="input-field mt-1" /></label>
              <label className="block text-sm font-medium text-navy-700">E-mail para retorno<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input-field mt-1" /></label>
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
                  <option value="">Selecione</option>{partnershipTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-navy-700">Categoria / segmento
                <select value={segment} onChange={(event) => setSegment(event.target.value)} className="input-field mt-1">
                  <option value="">Selecione (opcional)</option>{categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              {partnershipType === partnershipTypes[0].value && (
                <label className="block text-sm font-medium text-navy-700">Cota de patrocínio
                  <select value={tier} onChange={(event) => setTier(event.target.value)} className="input-field mt-1">
                    <option value="">A definir</option><option value="Ouro">Ouro</option><option value="Prata">Prata</option><option value="Bronze">Bronze</option>
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
