import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Briefcase, Building2, Phone, MessageCircle, Send, CheckCircle2, Lock } from 'lucide-react';
import { useNav } from '@/lib/nav';
import { useAuth } from '@/lib/auth';
import { fetchJobById } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import type { Job, ContractType } from '@/lib/types';
import { CONTRACT_TYPE_LABELS, ALL_CITIES, SPECIALTIES } from '@/lib/types';
import AuthModal from '@/components/AuthModal';

interface JobDetailPageProps {
  id: string;
}

const contractBadgeColors: Record<string, string> = {
  diaria: 'bg-blue-50 text-blue-700',
  empreitada: 'bg-green-50 text-green-700',
  clt: 'bg-purple-50 text-purple-700',
};

export default function JobDetailPage({ id }: JobDetailPageProps) {
  const { navigate } = useNav();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [proposedValue, setProposedValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchJobById(id)
      .then(setJob)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-gray-500">Vaga não encontrada.</p>
        <button onClick={() => navigate({ name: 'jobs' })} className="btn-primary">Ver vagas</button>
      </div>
    );
  }

  const isOwner = user && job.user_id === user.id;
  const isProfessional = profile?.user_type === 'professional';
  const waLink = job.company_phone ? `https://wa.me/55${job.company_phone.replace(/\D/g, '')}` : null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSubmitting(true);
    const { error } = await supabase.from('applications').insert({
      job_id: job.id,
      professional_id: profile.id,
      user_id: user.id,
      message,
      proposed_value: proposedValue,
    });
    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
    } else {
      alert('Erro ao enviar proposta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8">
        <button onClick={() => navigate({ name: 'jobs' })} className="btn-ghost">
          <ArrowLeft size={18} /> Voltar para vagas
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1">
              <span className="badge bg-navy-50 text-navy-700">{job.specialty}</span>
              <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">{job.title}</h1>
              <p className="mt-2 text-sm text-gray-500">
                Publicado por <span className="font-semibold text-navy-700">{job.company_name}</span>
              </p>
            </div>
            {job.status === 'open' ? (
              <span className="badge bg-green-50 text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Vaga aberta</span>
            ) : (
              <span className="badge bg-gray-100 text-gray-600">Encerrada</span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Cidade</p>
              <p className="text-sm font-semibold text-navy-800 flex items-center gap-1"><MapPin size={14} /> {job.city}/{job.state}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Contrato</p>
              <p className={`text-sm font-semibold badge ${contractBadgeColors[job.contract_type]}`}>{CONTRACT_TYPE_LABELS[job.contract_type as ContractType]}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Prazo</p>
              <p className="text-sm font-semibold text-navy-800 flex items-center gap-1"><Clock size={14} /> {job.deadline ?? 'A combinar'}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Empresa</p>
              <p className="text-sm font-semibold text-navy-800 flex items-center gap-1"><Building2 size={14} /> {job.company_name}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-display text-lg font-bold text-navy-900">Descrição</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.company_phone && (
            <div className="mt-6 rounded-xl bg-green-50 p-4 flex items-center gap-3">
              <MessageCircle size={20} className="text-green-600" />
              <div>
                <p className="text-xs font-semibold text-green-700">Contato da empresa</p>
                <p className="text-sm font-bold text-green-800">{job.company_phone}</p>
              </div>
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="ml-auto btn-primary !py-2 !text-xs">
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
            </div>
          )}
        </div>

        {/* Application form */}
        {isOwner ? (
          <div className="mt-6 card p-6 text-center">
            <p className="text-sm text-gray-600">Esta vaga foi publicada por você. Acesse o painel para ver as candidaturas.</p>
            <button onClick={() => navigate({ name: 'dashboard' })} className="btn-primary mt-3">Ir para o painel</button>
          </div>
        ) : job.status === 'open' && (
          <div className="mt-6 card p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="mx-auto text-green-500" />
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">Proposta enviada com sucesso!</h3>
                <p className="mt-1 text-sm text-gray-500">A empresa entrará em contato se tiver interesse.</p>
                <button onClick={() => navigate({ name: 'jobs' })} className="btn-primary mt-4">Ver outras vagas</button>
              </div>
            ) : !user ? (
              <div className="text-center py-6">
                <Lock size={36} className="mx-auto text-gray-300" />
                <h3 className="mt-3 font-display text-lg font-bold text-navy-900">Faça login para se candidatar</h3>
                <p className="mt-1 text-sm text-gray-500">Você precisa de uma conta de profissional para enviar propostas.</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button onClick={() => setAuthOpen(true)} className="btn-primary">Entrar / Criar conta</button>
                </div>
                <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" defaultUserType="professional" />
              </div>
            ) : !isProfessional ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-600">Apenas profissionais podem se candidatar a vagas. Crie uma conta de profissional para enviar propostas.</p>
              </div>
            ) : (
              <form onSubmit={handleApply}>
                <h3 className="font-display text-lg font-bold text-navy-900">Enviar Proposta</h3>
                <p className="mt-1 text-sm text-gray-500">Descreva sua proposta para esta vaga. A empresa verá seu perfil e portfólio.</p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy-700">Mensagem / Proposta</label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Descreva sua experiência com este tipo de trabalho, disponibilidade e por que você é o profissional ideal..."
                      className="input-field resize-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy-700">Valor proposto (opcional)</label>
                    <input
                      type="text"
                      value={proposedValue}
                      onChange={(e) => setProposedValue(e.target.value)}
                      placeholder="Ex: R$ 3.500 empreitada / R$ 200/diária"
                      className="input-field"
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full">
                  {submitting ? 'Enviando...' : (<><Send size={18} /> Enviar Proposta</>)}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
