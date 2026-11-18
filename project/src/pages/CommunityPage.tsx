import { ClipboardCheck, HardHat, MessageCircle, ShieldCheck, Star, Users } from 'lucide-react';
import type { Job, ProfessionalWithStats, Review } from '@/lib/types';
import CommunityBenefitsSection from '@/components/CommunityBenefitsSection';
import CommunityFeed from '@/components/CommunityFeed';

interface CommunityPageProps {
  professionals?: ProfessionalWithStats[];
  jobs?: Job[];
}

const bestPractices = [
  { title: 'Combine o escopo por escrito', detail: 'Alinhe etapas, materiais, prazos e responsabilidades antes de iniciar o serviço.', icon: ClipboardCheck },
  { title: 'Priorize segurança', detail: 'Use os equipamentos adequados e interrompa a atividade diante de um risco.', icon: ShieldCheck },
  { title: 'Valorize o diálogo', detail: 'Mantenha clientes, equipes e parceiros atualizados durante toda a obra.', icon: MessageCircle },
];

export default function CommunityPage({ professionals = [], jobs = [] }: CommunityPageProps) {
  const reviews = professionals
    .flatMap((professional) => (professional.reviews ?? [])
      .filter((review) => review.comment?.trim())
      .map((review) => ({ ...review, professionalName: professional.full_name })))
    .sort((first, second) => second.created_at.localeCompare(first.created_at))
    .slice(0, 3);
  const reviewCount = professionals.reduce((total, professional) => total + professional.review_count, 0);
  const availableCount = professionals.filter((professional) => professional.is_available === true).length;

  return (
    <div className="min-h-screen bg-[#fcfaf6] animate-fade-in">
      <section className="relative isolate overflow-hidden bg-navy-950 px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=85')" }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-900/60" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-12">
          <div className="motion-safe:animate-slide-up lg:col-span-8">
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-300"><HardHat size={17} /> Comunidade ProntObra</span>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold sm:text-5xl">Cada obra fica melhor quando a gente constrói junto.</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">Compartilhe experiências, reconheça bons trabalhos e encontre ideias para fortalecer a comunidade da construção.</p>
          </div>
          <div className="hidden overflow-hidden rounded-3xl border border-white/10 shadow-xl lg:col-span-4 lg:block">
            <img src="https://images.unsplash.com/photo-1581092918056-0c4c3a3f7f6f?auto=format&fit=crop&w=900&q=85" alt="Equipe trabalhando em uma obra" className="h-56 w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-5 grid max-w-7xl gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:px-8" aria-label="Indicadores da comunidade">
        <CommunityMetric label="Profissionais disponíveis" value={availableCount} icon={Users} />
        <CommunityMetric label="Avaliações compartilhadas" value={reviewCount} icon={Star} />
        <CommunityMetric label="Oportunidades abertas" value={jobs.length} icon={ClipboardCheck} />
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        <section aria-labelledby="community-reviews-title">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Experiências reais</p>
            <h2 id="community-reviews-title" className="mt-1 section-title">Avaliações e depoimentos</h2>
          </div>
          {reviews.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {reviews.map((review: Review & { professionalName: string }) => (
                <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-1 text-orange-500" aria-label={`Avaliação ${review.rating} de 5`}>
                    {Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < review.rating ? 'currentColor' : 'none'} />)}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">“{review.comment}”</p>
                  <p className="mt-4 text-xs font-semibold text-navy-800">{review.reviewer_name} · {review.professionalName}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">As avaliações dos profissionais aparecerão aqui conforme forem publicadas pela comunidade.</p>
          )}
        </section>

        <CommunityBenefitsSection />

        <section aria-labelledby="community-tips-title">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Boas práticas</p>
            <h2 id="community-tips-title" className="mt-1 section-title">Pequenos cuidados, obras melhores.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {bestPractices.map(({ title, detail, icon: Icon }, index) => (
              <article key={title} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg motion-safe:animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon size={22} /></span>
                <h3 className="mt-4 font-display font-bold text-navy-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="community-feed-title">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Da comunidade para a comunidade</p>
            <h2 id="community-feed-title" className="mt-1 section-title">Compartilhe o que acontece na sua obra</h2>
          </div>
          <CommunityFeed />
        </section>
      </div>
    </div>
  );
}

function CommunityMetric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon size={20} /></span>
      <div><p className="text-xl font-extrabold text-navy-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
    </div>
  );
}
