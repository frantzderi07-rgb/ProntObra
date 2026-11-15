import { MapPin, Briefcase, MessageCircle, FileText } from 'lucide-react';
import { useNav } from '@/lib/nav';
import type { ProfessionalWithStats } from '@/lib/types';
import StarRating from './StarRating';

interface ProfessionalCardProps {
  professional: ProfessionalWithStats;
}

export default function ProfessionalCard({ professional: p }: ProfessionalCardProps) {
  const { navigate } = useNav();
  const coverPhoto = p.portfolio_photos?.[0]?.image_url;

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
          <span className="badge absolute left-3 top-3 bg-orange-500 text-white shadow-md">
            Destaque
          </span>
        )}
        <span className="badge absolute right-3 top-3 bg-white/90 text-navy-800">
          {p.specialty}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <img
            src={p.avatar_url ?? ''}
            alt={p.full_name}
            className="h-12 w-12 -mt-8 flex-shrink-0 rounded-xl border-4 border-white object-cover shadow-md bg-navy-100"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold text-navy-900">{p.full_name}</h3>
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} /> {p.city} — {p.state}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {p.avg_rating !== null ? (
            <StarRating rating={p.avg_rating} count={p.review_count} />
          ) : (
            <span className="text-xs text-gray-400">Sem avaliações</span>
          )}
          <span className="text-xs font-semibold text-navy-600">
            {p.experience_years} anos exp.
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-gray-600">{p.bio}</p>

        {p.service_radius && (
          <p className="mt-2 flex items-center gap-1 text-xs text-navy-500">
            <Briefcase size={12} /> {p.service_radius}
          </p>
        )}

        <div className="mt-4 flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => navigate({ name: 'professional-detail', id: p.id })}
            className="btn-outline flex-1 !py-2 !text-xs"
          >
            <FileText size={14} /> Ver Perfil
          </button>
          {p.phone && (
            <a
              href={`https://wa.me/55${p.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !py-2 !text-xs"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
