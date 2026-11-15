import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Briefcase, Lock } from 'lucide-react';
import { useNav } from '@/lib/nav';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabase';
import { BRAZIL_STATES, SPECIALTIES, CONTRACT_TYPE_LABELS } from '@/lib/types';
import { saveLocalJob } from '@/lib/localStore';
import type { ContractType } from '@/lib/types';
import AuthModal from '@/components/AuthModal';
import CitySelectorSpMs from '@/components/CitySelectorSpMs';

export default function PostJobPage() {
  const { navigate } = useNav();
  const { user, profile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    specialty: SPECIALTIES[0],
    city: '',
    state: '',
    contract_type: 'empreitada' as ContractType,
    deadline: '',
    company_name: '',
    company_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const [cityName, cityState] = form.city.split(' - ');
    const job = {
      id: crypto.randomUUID(),
      user_id: user.id,
      company_name: form.company_name || profile?.full_name || 'Empresa',
      company_phone: form.company_phone,
      title: form.title,
      description: form.description,
      specialty: form.specialty,
      city: cityName,
      state: cityState || form.state,
      contract_type: form.contract_type,
      deadline: form.deadline || null,
      status: 'open',
      created_at: new Date().toISOString(),
    } as const;

    let persisted = false;
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('jobs').insert({
          user_id: user.id,
          company_name: job.company_name,
          company_phone: job.company_phone,
          title: job.title,
          description: job.description,
          specialty: job.specialty,
          city: job.city,
          state: job.state,
          contract_type: job.contract_type,
          deadline: job.deadline,
          status: job.status,
        });
        if (error) throw error;
        persisted = true;
      } catch (error) {
        console.warn('Não foi possível publicar online; salvando a vaga neste dispositivo:', error);
      }
    }
    if (!persisted) {
      saveLocalJob(job);
      setSavedLocally(true);
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="card max-w-lg p-8 text-center">
          <CheckCircle2 size={56} className="mx-auto text-green-500" />
          <h2 className="mt-4 font-display text-xl font-bold text-navy-900">Vaga publicada com sucesso!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Sua vaga já está visível no mural para profissionais de {savedLocally ? 'todo o Brasil' : 'sua região'}.
            {savedLocally ? ' Ela foi salva neste dispositivo e ficará disponível nesta sessão.' : ''}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button onClick={() => navigate({ name: 'jobs' })} className="btn-primary">Ver no mural</button>
            <button onClick={() => navigate({ name: 'dashboard' })} className="btn-outline">Ir para o painel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6 lg:px-8">
        <button onClick={() => navigate({ name: 'home' })} className="btn-ghost">
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-navy-900">Publicar Vaga ou Pedido de Orçamento</h1>
          <p className="mt-1 text-sm text-gray-500">Encontre o profissional certo para seu projeto em todo o Brasil.</p>
        </div>

        {!user ? (
          <div className="card p-8 text-center">
            <Lock size={40} className="mx-auto text-gray-300" />
            <h3 className="mt-3 font-display text-lg font-bold text-navy-900">Faça login para publicar</h3>
            <p className="mt-1 text-sm text-gray-500">Crie uma conta de empresa para publicar vagas e receber propostas de profissionais.</p>
            <button onClick={() => setAuthOpen(true)} className="btn-primary mt-4">Entrar / Criar conta</button>
            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" defaultUserType="company" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">Nome da empresa / contratante</label>
              <input
                type="text"
                required
                value={form.company_name}
                onChange={(e) => update('company_name', e.target.value)}
                placeholder={profile?.full_name ?? 'Ex: Construtora Vale do Paraná'}
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">Telefone / WhatsApp</label>
              <input
                type="text"
                value={form.company_phone}
                onChange={(e) => update('company_phone', e.target.value)}
                placeholder="(18) 99999-9999"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">Título da vaga</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Ex: Reforma de cozinha residencial"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">Descrição detalhada</label>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Descreva o trabalho: o que precisa ser feito, materiais, dimensões, condições..."
                className="input-field resize-none"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-700">Especialidade necessária</label>
                <select value={form.specialty} onChange={(e) => update('specialty', e.target.value)} className="input-field">
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-700">Cidade</label>
                <CitySelectorSpMs
                  value={form.city}
                  onChange={(location) => {
                    const [, state] = location.split(' - ');
                    setForm((prev) => ({ ...prev, city: location, state: state || prev.state }));
                  }}
                  stateFilter={form.state}
                  required
                  placeholder="Busque uma cidade..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-700">Estado (UF)</label>
                <select required value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value, city: '' }))} className="input-field">
                  <option value="">Selecione o estado</option>
                  {BRAZIL_STATES.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-700">Tipo de contrato</label>
                <select
                  value={form.contract_type}
                  onChange={(e) => update('contract_type', e.target.value as ContractType)}
                  className="input-field"
                >
                  {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-700">Prazo</label>
                <input
                  type="text"
                  value={form.deadline}
                  onChange={(e) => update('deadline', e.target.value)}
                  placeholder="Ex: 30 dias"
                  className="input-field"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              <Briefcase size={18} /> {submitting ? 'Publicando...' : 'Publicar Vaga'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
