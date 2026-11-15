import { MapPin, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { useNav } from '@/lib/nav';
import type { Job } from '@/lib/types';
import { CONTRACT_TYPE_LABELS } from '@/lib/types';

interface JobCardProps {
  job: Job;
}

const contractBadgeColors: Record<string, string> = {
  diaria: 'bg-blue-50 text-blue-700',
  empreitada: 'bg-green-50 text-green-700',
  clt: 'bg-purple-50 text-purple-700',
};

export default function JobCard({ job }: JobCardProps) {
  const { navigate } = useNav();

  return (
    <div className="card group p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="badge bg-navy-50 text-navy-700">{job.specialty}</span>
          <h3 className="mt-2 font-display text-base font-bold text-navy-900 line-clamp-2">{job.title}</h3>
        </div>
        {job.status === 'open' && (
          <span className="badge bg-green-50 text-green-700 flex-shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Aberta
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-600 line-clamp-2 flex-1">{job.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
        <span className="flex items-center gap-1"><MapPin size={13} /> {job.city} — {job.state}</span>
        <span className={`badge ${contractBadgeColors[job.contract_type]}`}>
          <Briefcase size={12} /> {CONTRACT_TYPE_LABELS[job.contract_type]}
        </span>
        {job.deadline && (
          <span className="flex items-center gap-1"><Clock size={13} /> {job.deadline}</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-500">por {job.company_name}</span>
        <button
          onClick={() => navigate({ name: 'job-detail', id: job.id })}
          className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700"
        >
          Ver detalhes <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
