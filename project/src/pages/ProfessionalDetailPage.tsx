import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, Clock, MessageCircle, Mail, Star, Image as ImageIcon, X, ShieldCheck, Award, ThumbsUp, Share2, BadgeCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { useNav } from '@/lib/nav';
import { fetchProfessionalById } from '@/lib/queries';
import type { ProfessionalWithStats } from '@/lib/types';
import StarRating from '@/components/StarRating';
import QuickContactModal from '@/components/QuickContactModal';
import { getPhotoReactions, savePhotoReaction } from '@/lib/localStore';

interface ProfessionalDetailPageProps {
  id: string;
}

export default function ProfessionalDetailPage({ id }: ProfessionalDetailPageProps) {
  const { navigate } = useNav();
  const [professional, setProfessional] = useState<ProfessionalWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [badgeQr, setBadgeQr] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchProfessionalById(id)
      .then(setProfessional)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!professional) return;
    setReactions(Object.fromEntries(professional.portfolio_photos.map((photo) => [photo.id, getPhotoReactions(photo.id)])));
  }, [professional]);

  useEffect(() => {
    if (!professional) return;
    let active = true;
    const profileUrl = `${window.location.origin}/profissionais/${encodeURIComponent(professional.id)}`;
    QRCode.toDataURL(profileUrl, { errorCorrectionLevel: 'M', margin: 1, width: 180 })
      .then((dataUrl) => { if (active) setBadgeQr(dataUrl); })
      .catch((error: unknown) => console.error('Não foi possível gerar o QR Code do perfil:', error));
    return () => { active = false; };
  }, [professional?.id]);

  useEffect(() => {
    const syncReactions = () => {
      if (!professional) return;
      setReactions(Object.fromEntries(professional.portfolio_photos.map((photo) => [photo.id, getPhotoReactions(photo.id)])));
    };
    window.addEventListener('prontobra:data-changed', syncReactions);
    window.addEventListener('storage', syncReactions);
    return () => {
      window.removeEventListener('prontobra:data-changed', syncReactions);
      window.removeEventListener('storage', syncReactions);
    };
  }, [professional]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-gray-500">Profissional não encontrado.</p>
        <button onClick={() => navigate({ name: 'professionals' })} className="btn-primary">Ver profissionais</button>
      </div>
    );
  }

  const p = professional;
  const waLink = p.phone ? `https://wa.me/55${p.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${p.full_name}, encontrei seu perfil na ProntObra e gostaria de solicitar um orçamento.`)}` : null;
  const shareProfile = async () => {
    const url = `${window.location.origin}/profissionais/${encodeURIComponent(p.id)}`;
    try {
      if (navigator.share) await navigator.share({ title: `Perfil de ${p.full_name} | ProntObra`, url });
      else {
        await navigator.clipboard.writeText(url);
        setShareMessage('Link copiado!');
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Não foi possível compartilhar o perfil:', error);
        setShareMessage('Não foi possível compartilhar agora.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Back */}
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
        <button onClick={() => navigate({ name: 'professionals' })} className="btn-ghost">
          <ArrowLeft size={18} /> Voltar para profissionais
        </button>
      </div>

      {/* Header card */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="card overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-navy-700 to-navy-900" />
          <div className="px-6 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                {p.avatar_url
                  ? <img src={p.avatar_url} alt={p.full_name} className="h-24 w-24 -mt-12 rounded-2xl border-4 border-white object-cover shadow-lg bg-navy-100" />
                  : <div className="flex h-24 w-24 -mt-12 items-center justify-center rounded-2xl border-4 border-white bg-navy-100 text-navy-600 shadow-lg"><span className="text-2xl font-bold">{p.full_name.slice(0, 1).toUpperCase()}</span></div>}
                <div>
                  <h1 className="font-display text-xl font-bold text-navy-900">{p.full_name}</h1>
                  <p className="text-orange-600 font-semibold text-sm">{p.specialty}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {p.city} — {p.state}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {p.experience_years} anos de experiência</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="badge bg-slate-100 text-slate-700"><ShieldCheck size={13} /> Perfil ProntObra</span>
                    {p.is_featured && <span className="badge bg-orange-50 text-orange-800"><BadgeCheck size={13} /> Destaque VIP</span>}
                    {!!p.certifications?.length && <span className="badge bg-amber-50 text-amber-700"><Award size={13} /> Profissional Certificado</span>}
                    <span className={`badge ${p.is_available === false ? 'bg-gray-100 text-gray-700' : 'bg-green-50 text-green-700'}`}>
                      {p.is_available === false ? 'Agenda ocupada' : 'Disponível Agora · Agenda Livre'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                {p.avg_rating !== null && <StarRating rating={p.avg_rating} count={p.review_count} size={18} />}
                {p.is_featured && <span className="badge inline-flex items-center gap-1 bg-orange-50 text-orange-800"><BadgeCheck size={13} /> Destaque VIP</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: bio + portfolio + reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-navy-900">Sobre o profissional</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{p.bio}</p>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-navy-50 p-4">
                <Briefcase size={18} className="mt-0.5 flex-shrink-0 text-navy-500" />
                <div>
                  <p className="text-xs font-semibold text-navy-700">Raio de Atendimento</p>
                  <p className="text-sm text-navy-600">{p.service_radius}</p>
                </div>
              </div>
            </div>

            {/* Portfolio */}
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
                <ImageIcon size={20} className="text-orange-500" /> Obras Concluídas / Antes e Depois
              </h2>
              {p.portfolio_photos.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {p.portfolio_photos.map((photo) => (
                    <article key={photo.id} className="overflow-hidden rounded-xl border border-gray-100">
                      <button type="button" onClick={() => setLightbox(photo.image_url)} className="group relative block aspect-video w-full overflow-hidden bg-gray-100">
                        <img src={photo.image_url} alt={photo.caption ?? 'Obra concluída'} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                        {photo.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs text-white">{photo.caption}</span>}
                      </button>
                      <div className="grid grid-cols-1 gap-2 p-3">
                        {['Acabamento Perfeito', 'No Prazo', 'Recomendo'].map((reaction) => {
                          const active = reactions[photo.id]?.includes(reaction) ?? false;
                          return (
                            <button
                              key={reaction}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setReactions((current) => ({ ...current, [photo.id]: savePhotoReaction(photo.id, reaction) }))}
                              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                              <span className="flex items-center gap-1.5"><ThumbsUp size={13} /> {reaction}</span>
                              <span>{reactions[photo.id]?.filter((item) => item === reaction).length ?? 0}</span>
                            </button>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-400">Ainda não há fotos no portfólio.</p>
              )}
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
                <Star size={20} className="text-gold-400" /> Avaliações de Clientes
              </h2>
              {p.reviews.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {p.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-navy-900">{review.reviewer_name}</p>
                        <StarRating rating={review.rating} showCount={false} size={14} />
                      </div>
                      {review.comment && <p className="mt-1.5 text-sm text-gray-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-400">Ainda não há avaliações para este profissional.</p>
              )}
            </div>
          </div>

          {/* Right: contact card */}
          <div className="space-y-4">
            <div className="card sticky top-20 p-6">
              <h3 className="font-display text-lg font-bold text-navy-900">Entrar em contato</h3>
              <p className="mt-1 text-sm text-gray-500">Solicite um orçamento diretamente com o profissional.</p>

              <div className="mt-4 space-y-3">
                <button type="button" onClick={() => setContactOpen(true)} className="btn-secondary w-full">
                  <MessageCircle size={18} /> Contato Direto / Chat Rápido
                </button>
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                )}
                {p.email && (
                  <a href={`mailto:${p.email}`} className="btn-outline w-full">
                    <Mail size={18} /> Enviar e-mail
                  </a>
                )}
                <button type="button" onClick={() => void shareProfile()} className="btn-outline w-full"><Share2 size={17} /> Compartilhar meu Perfil</button>
                {shareMessage && <p role="status" className="text-xs text-slate-500">{shareMessage}</p>}
              </div>

              {p.phone && (
                <div className="mt-4 rounded-xl bg-green-50 p-4">
                  <p className="text-xs font-semibold text-green-700">Telefone / WhatsApp</p>
                  <p className="text-sm font-bold text-green-800">{p.phone}</p>
                </div>
              )}

              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Especialidade</span>
                  <span className="font-semibold text-navy-700">{p.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Experiência</span>
                  <span className="font-semibold text-navy-700">{p.experience_years} anos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cidade base</span>
                  <span className="font-semibold text-navy-700">{p.city}/{p.state}</span>
                </div>
              </div>
              <div className="card p-5 text-center">
                <h3 className="font-display font-bold text-navy-900">Crachá Digital ProntObra</h3>
                <p className="mt-1 text-xs text-gray-500">Aponte a câmera para abrir este perfil público.</p>
                {badgeQr ? <img src={badgeQr} alt={`QR Code do perfil de ${p.full_name}`} className="mx-auto mt-3 h-36 w-36" /> : <div className="mx-auto mt-3 h-36 w-36 animate-pulse rounded-xl bg-slate-100" />}
                <p className="mt-2 text-sm font-bold text-navy-900">{p.full_name}</p>
                <p className="text-xs text-slate-500">{p.specialty} · {p.city}/{p.state}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Portfólio ampliado" className="max-h-full max-w-full rounded-lg object-contain" />
          <button className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white/70 hover:text-white" aria-label="Fechar imagem" onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>
        </div>
      )}
      <QuickContactModal professional={p} open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
