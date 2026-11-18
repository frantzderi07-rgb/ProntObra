import { useEffect, useState } from 'react';
import { MapPin, Briefcase, MessageCircle, FileText, ShieldCheck, UserRound, Share2, BadgeCheck, Heart, Image as ImageIcon, ThumbsUp } from 'lucide-react';
import { useNav } from '@/lib/nav';
import type { ProfessionalWithStats } from '@/lib/types';
import StarRating from './StarRating';
import QuickContactModal from './QuickContactModal';
import { getPhotoReactions, savePhotoReaction } from '@/lib/localStore';

interface ProfessionalCardProps {
  professional: ProfessionalWithStats;
}

export default function ProfessionalCard({ professional: p }: ProfessionalCardProps) {
  const { navigate } = useNav();
  const [contactOpen, setContactOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const coverPhoto = p.portfolio_photos?.[0]?.image_url;
  const coverPhotoId = p.portfolio_photos?.[0]?.id;
  const [reactions, setReactions] = useState<string[]>([]);
  const directPhone = p.whatsapp_number || p.phone;
  const phoneDigits = directPhone?.replace(/\D/g, '') ?? '';
  const whatsappUrl = phoneDigits
    ? `https://wa.me/${phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`}?text=${encodeURIComponent(`Olá ${p.full_name}, encontrei seu perfil na ProntObra e gostaria de solicitar um orçamento.`)}`
    : '';

  useEffect(() => {
    const syncReactions = () => setReactions(coverPhotoId ? getPhotoReactions(coverPhotoId) : []);
    syncReactions();
    window.addEventListener('prontobra:data-changed', syncReactions);
    window.addEventListener('storage', syncReactions);
    return () => {
      window.removeEventListener('prontobra:data-changed', syncReactions);
      window.removeEventListener('storage', syncReactions);
    };
  }, [coverPhotoId]);

  const shareProfile = async () => {
    const url = `${window.location.origin}/profissionais/${encodeURIComponent(p.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Perfil de ${p.full_name} | ProntObra`, url });
      } else {
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
    <div className="card group overflow-hidden flex flex-col">
      <div className="relative h-40 overflow-hidden bg-navy-100">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={`Portfólio de ${p.full_name}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy-200 to-navy-300" />
        )}
        {p.is_featured && (
          <span className="badge absolute left-3 top-3 inline-flex items-center gap-1 bg-orange-500 text-white shadow-md">
            <BadgeCheck size={13} /> Destaque VIP
          </span>
        )}
        <span className="badge absolute right-3 top-3 bg-white/90 text-navy-800">
          {p.specialty || 'Construção Civil'}
        </span>
        <span className={`badge absolute bottom-3 left-3 ${p.is_available === false ? 'bg-gray-700 text-white' : 'bg-green-600 text-white'}`}>
          {p.is_available === false ? 'Agenda ocupada' : 'Disponível Agora'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          {p.avatar_url ? (
            <img src={p.avatar_url} alt={p.full_name} className="h-12 w-12 -mt-8 flex-shrink-0 rounded-xl border-4 border-white object-cover shadow-md bg-navy-100" loading="lazy" />
          ) : (
            <div className="flex h-12 w-12 -mt-8 flex-shrink-0 items-center justify-center rounded-xl border-4 border-white bg-navy-100 text-navy-600 shadow-md" aria-label="Foto não cadastrada">
              <UserRound size={20} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold text-navy-900">{p.full_name}</h3>
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} /> {p.city} — {p.state}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="badge bg-slate-100 !px-2 !py-0.5 text-slate-700"><ShieldCheck size={11} /> Perfil ProntObra</span>
              {!!p.certifications?.length && <span className="badge bg-green-50 !px-2 !py-0.5 text-green-700"><ShieldCheck size={11} /> Verificado</span>}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {p.avg_rating !== null ? (
            <StarRating rating={p.avg_rating} count={p.review_count} />
          ) : (
            <span className="text-xs text-gray-400">Sem avaliações</span>
          )}
          <span className="text-xs font-semibold text-navy-600">
            {p.experience_years ?? 0} anos de experiência
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
            <ImageIcon size={14} className="text-orange-600" /> {p.portfolio_photos?.length ?? 0} fotos no portfólio
          </span>
          {coverPhotoId && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Curtir foto do portfólio"
                aria-pressed={reactions.includes('❤️ Gostei')}
                onClick={() => setReactions(savePhotoReaction(coverPhotoId, '❤️ Gostei'))}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold transition ${reactions.includes('❤️ Gostei') ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-700'}`}
              >
                <Heart size={14} fill={reactions.includes('❤️ Gostei') ? 'currentColor' : 'none'} /> {reactions.filter((reaction) => reaction === '❤️ Gostei').length}
              </button>
              <button
                type="button"
                aria-label="Aplaudir foto do portfólio"
                aria-pressed={reactions.includes('👏 Parabéns')}
                onClick={() => setReactions(savePhotoReaction(coverPhotoId, '👏 Parabéns'))}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold transition ${reactions.includes('👏 Parabéns') ? 'bg-orange-50 text-orange-700' : 'text-slate-500 hover:bg-orange-50 hover:text-orange-700'}`}
              >
                <ThumbsUp size={14} /> {reactions.filter((reaction) => reaction === '👏 Parabéns').length}
              </button>
            </div>
          )}
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-gray-600">{p.bio}</p>

        {p.service_radius && (
          <p className="mt-2 flex items-center gap-1 text-xs text-navy-500">
            <Briefcase size={12} /> {p.service_radius}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
          <button
            onClick={() => navigate({ name: 'professional-detail', id: p.id })}
            className="btn-outline col-span-2 min-w-0 justify-center !py-2 !text-xs"
          >
            <FileText size={14} /> Ver Perfil
          </button>
          <button type="button" onClick={() => setContactOpen(true)} className={`btn-outline min-w-0 justify-center !px-2 !py-2 !text-xs ${whatsappUrl ? '' : 'col-span-2'}`} aria-label={`Contato direto com ${p.full_name}`}>
            <MessageCircle size={14} /> Contato
          </button>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary min-w-0 justify-center !px-2 !py-2 !text-xs"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
        </div>
        <button type="button" onClick={() => void shareProfile()} className="mt-2 inline-flex max-w-full flex-wrap items-center gap-1.5 self-start text-left text-xs font-semibold text-navy-600 hover:text-orange-600"><Share2 size={14} /> <span>Compartilhar Perfil / Cartão Digital</span></button>
        {shareMessage && <p role="status" className="mt-1 text-xs text-slate-500">{shareMessage}</p>}
      </div>
      <QuickContactModal professional={p} open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
