import { useState } from 'react';
import { ArrowRight, Award, BadgeCheck, Camera, Check, CheckCircle2, Handshake, Info, MessageCircle, Rocket, ShieldCheck, Star, TrendingUp, X, Zap } from 'lucide-react';

interface ProfessionalRequest {
  fullName: string;
  specialty: string;
  whatsapp: string;
  city: string;
}

const specialties = [
  'Pedreiro / Mestre de Obras',
  'Eletricista',
  'Encanador / Hidráulica',
  'Pintor / Acabamento',
  'Engenheiro / Arquiteto',
  'Outro serviço',
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length < 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface ProfessionalVisibilitySectionProps {
  plansOpen: boolean;
  step: 1 | 2 | 3;
  onOpenPlans: (step?: 1 | 2) => void;
  onStepChange: (step: 1 | 2 | 3) => void;
  onClosePlans: () => void;
  onSignupRequest: () => void;
}

export default function ProfessionalVisibilitySection({
  plansOpen,
  step,
  onOpenPlans,
  onStepChange,
  onClosePlans,
  onSignupRequest,
}: ProfessionalVisibilitySectionProps) {

  return (
    <>
      <section className="bg-[#f8f5ef] py-12 sm:py-16" aria-labelledby="vip-plans-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-700"><Award size={17} /> Mais visibilidade para profissionais</p>
              <h2 id="vip-plans-title" className="mt-2 section-title">Destaque seu trabalho e conquiste mais obras</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">Crie seu perfil gratuitamente ou ative o Destaque VIP para aparecer no topo das buscas da sua cidade.</p>
            </div>
            <button type="button" onClick={() => onOpenPlans()} className="btn-outline shrink-0 !border-orange-200 !text-orange-800 hover:!border-orange-400">Comparar planos <ArrowRight size={17} /></button>
          </div>
          <div className="mt-6 grid items-stretch gap-4 md:grid-cols-2">
            <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
              <div>
                <p className="font-display text-xl font-bold text-navy-900">Plano Gratuito</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">R$ 0 <span className="font-normal">/ para sempre</span></p>
                <ul className="mt-5 space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><Check size={18} className="mt-0.5 shrink-0 text-green-600" />Perfil profissional público na plataforma</li>
                  <li className="flex items-start gap-2"><Check size={18} className="mt-0.5 shrink-0 text-green-600" />Aparição nas buscas por especialidade e cidade</li>
                  <li className="flex items-start gap-2"><Check size={18} className="mt-0.5 shrink-0 text-green-600" />Recebimento de contatos diretos de clientes</li>
                </ul>
              </div>
              <button type="button" onClick={onSignupRequest} className="btn-outline mt-6 w-full md:mt-auto">Criar perfil grátis</button>
            </article>
            <article className="flex h-full flex-col rounded-2xl border-2 border-[#F97316] bg-[#1C1917] p-5 text-white shadow-lg shadow-orange-950/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-bold text-white">Destaque VIP</p>
                  <p className="mt-1 text-sm font-semibold text-orange-300">Sob consulta</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-400/30 bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-200"><Star size={13} fill="currentColor" /> Mais Escolhido</span>
              </div>
              <ul className="mt-5 flex-1 space-y-3 text-sm text-white/85">
                <li className="flex items-start gap-2"><BadgeCheck size={18} className="mt-0.5 shrink-0 text-[#F97316]" />Selo de Profissional Verificado</li>
                <li className="flex items-start gap-2"><Rocket size={18} className="mt-0.5 shrink-0 text-[#F97316]" />Prioridade no topo das buscas da região</li>
                <li className="flex items-start gap-2"><Camera size={18} className="mt-0.5 shrink-0 text-[#F97316]" />Portfólio de fotos de obras realizadas</li>
                <li className="flex items-start gap-2"><Handshake size={18} className="mt-0.5 shrink-0 text-[#F97316]" />Maior destaque para orçamentos rápidos</li>
              </ul>
              <button type="button" onClick={() => onOpenPlans(2)} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-600 active:scale-[0.98]">Quero ser VIP <ArrowRight size={17} /></button>
            </article>
          </div>
          <div className="mt-5 grid gap-3 rounded-2xl border border-orange-100 bg-white/80 p-4 text-sm text-slate-700 sm:grid-cols-3">
            <p className="flex items-center gap-2"><ShieldCheck size={17} className="shrink-0 text-orange-600" />Sem fidelidade</p>
            <p className="flex items-center gap-2"><Zap size={17} className="shrink-0 text-orange-600" />Ativação rápida via WhatsApp</p>
            <p className="flex items-center gap-2"><TrendingUp size={17} className="shrink-0 text-orange-600" />Mais contatos na sua região</p>
          </div>
        </div>
      </section>
      {plansOpen && <ProfessionalPlansModal step={step} onStepChange={onStepChange} onClose={onClosePlans} onFreePlan={onClosePlans} />}
    </>
  );
}

function ProfessionalPlansModal({
  step,
  onStepChange,
  onClose,
  onFreePlan,
}: {
  step: 1 | 2 | 3;
  onStepChange: (step: 1 | 2 | 3) => void;
  onClose: () => void;
  onFreePlan: () => void;
}) {
  const [request, setRequest] = useState<ProfessionalRequest>({ fullName: '', specialty: '', whatsapp: '', city: '' });
  const [error, setError] = useState('');
  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_PARTNERS_NUMBER || import.meta.env.VITE_WHATSAPP_ASSISTANT_NUMBER || '5567996936753').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Olá! Solicitei o Destaque VIP na ProntObra.\nNome: ${request.fullName}\nEspecialidade: ${request.specialty}`,
  )}`;
  const update = (key: keyof ProfessionalRequest, value: string) => setRequest((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (request.whatsapp.replace(/\D/g, '').length !== 11) {
      setError('Informe um WhatsApp com DDD e 11 dígitos.');
      return;
    }
    onStepChange(3);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/70 p-2 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="vip-modal-title" className="relative max-h-[calc(100dvh-1rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:max-h-[92vh] sm:p-7" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        {step === 1 ? (
          <>
            <p className="flex items-center gap-2 pr-10 text-xs font-bold uppercase tracking-wider text-orange-700"><BadgeCheck size={17} /> Planos para profissionais da construção</p>
            <h2 id="vip-modal-title" className="mt-2 pr-10 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Escolha como quer aparecer</h2>
            <div className="mt-6 grid items-stretch gap-4 sm:grid-cols-2">
              <article className="flex flex-col rounded-2xl border border-slate-200 p-5">
                <h3 className="font-display text-lg font-bold text-navy-900">Plano Gratuito</h3>
                <ul className="mt-4 flex-1 space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2"><Check size={17} className="shrink-0 text-green-600" />Perfil profissional público</li>
                  <li className="flex gap-2"><Check size={17} className="shrink-0 text-green-600" />Buscas por especialidade e cidade</li>
                  <li className="flex gap-2"><Check size={17} className="shrink-0 text-green-600" />Contato direto de clientes</li>
                  <li className="flex gap-2"><X size={17} className="shrink-0 text-slate-400" />Sem selo verificado ou prioridade</li>
                  <li className="flex gap-2"><X size={17} className="shrink-0 text-slate-400" />Sem portfólio VIP</li>
                </ul>
                <button type="button" onClick={onFreePlan} className="btn-outline mt-5 w-full">Continuar no Plano Gratuito</button>
              </article>
              <article className="flex flex-col rounded-2xl border-2 border-orange-400 bg-orange-50/60 p-5">
                <h3 className="font-display text-lg font-bold text-orange-900">Destaque VIP</h3>
                <ul className="mt-4 flex-1 space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2"><BadgeCheck size={17} className="shrink-0 text-orange-600" />Selo de Profissional Verificado</li>
                  <li className="flex gap-2"><Rocket size={17} className="shrink-0 text-orange-600" />Prioridade no topo das buscas</li>
                  <li className="flex gap-2"><Camera size={17} className="shrink-0 text-orange-600" />Portfólio de fotos de obras</li>
                </ul>
                <button type="button" onClick={() => onStepChange(2)} className="btn-primary mt-5 w-full">Tenho interesse no Destaque VIP</button>
              </article>
            </div>
            <p className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500"><Info size={15} className="mt-0.5 shrink-0" />Valores e ativação são consultados com a equipe, conforme disponibilidade da sua região. Sem cobrança automática.</p>
          </>
        ) : step === 2 ? (
          <>
            <button type="button" onClick={() => onStepChange(1)} className="inline-flex items-center gap-2 pr-10 text-sm font-semibold text-orange-700 hover:text-orange-800">← Voltar aos planos</button>
            <h2 id="vip-modal-title" className="mt-4 pr-10 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Solicite seu Destaque VIP</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Preencha seus dados para nossa equipe ativar seu selo de destaque.</p>
            <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-navy-700">Nome completo
                <input required maxLength={120} autoComplete="name" value={request.fullName} onChange={(event) => update('fullName', event.target.value)} className="input-field mt-1" />
              </label>
              <label className="text-sm font-medium text-navy-700">Especialidade principal
                <select required value={request.specialty} onChange={(event) => update('specialty', event.target.value)} className="input-field mt-1">
                  <option value="">Selecione sua especialidade</option>{specialties.map((specialty) => <option key={specialty}>{specialty}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-navy-700">WhatsApp com DDD
                <input required type="tel" inputMode="tel" autoComplete="tel" maxLength={15} placeholder="(11) 99999-9999" value={request.whatsapp} onChange={(event) => update('whatsapp', formatPhone(event.target.value))} className="input-field mt-1" />
              </label>
              <label className="text-sm font-medium text-navy-700">Cidade / UF
                <input required maxLength={120} placeholder="Ex.: Andradina / SP" value={request.city} onChange={(event) => update('city', event.target.value)} className="input-field mt-1" />
              </label>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
              <button type="submit" className="btn-primary sm:col-span-2">Enviar solicitação</button>
            </form>
          </>
        ) : (
          <div className="py-5 text-center sm:py-8">
            <CheckCircle2 size={54} className="mx-auto text-green-600" />
            <h2 id="vip-modal-title" className="mt-4 font-display text-2xl font-bold text-navy-900">Solicitação recebida!</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">Nossa equipe entrará em contato pelo WhatsApp informado para ativar seu Destaque VIP.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"><MessageCircle size={18} />Agilizar atendimento no WhatsApp</a>
              <button type="button" onClick={onClose} className="btn-outline">Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
