import { ArrowRight, ClipboardCheck, Handshake, HardHat, MessageCircle, ShieldCheck, Star, Users } from 'lucide-react';
import type { Job, ProfessionalWithStats, Review } from '@/lib/types';
import CommunityBenefitsSection from '@/components/CommunityBenefitsSection';
import CommunityFeed from '@/components/CommunityFeed';
import { useNav } from '@/lib/nav';

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
  const { navigate } = useNav();
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
      <section className="overflow-hidden bg-[#f8f5ef]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-16">
          <div className="motion-safe:animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-800"><HardHat size={17} /> Comunidade ProntObra</span>
            <h1 className="mt-5 max-w-2xl font-display text-4xl font-extrabold leading-tight text-navy-950 sm:text-5xl">Cada obra fica melhor quando a gente constrói junto.</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">Compartilhe experiências, reconheça bons trabalhos e encontre ideias para fortalecer a comunidade da construção.</p>
            <button type="button" onClick={() => document.getElementById('community-feed-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="btn-primary mt-6 !bg-[#F97316] hover:!bg-orange-600">
              Conhecer a comunidade <ArrowRight size={17} />
            </button>
          </div>
          <div className="relative mx-auto w-full max-w-xl motion-safe:animate-slide-up">
            <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85" alt="Equipe analisando um projeto de construção" className="h-[300px] w-full rounded-[2rem] object-cover shadow-2xl sm:h-[390px]" />
            <span className="absolute -left-2 top-5 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 text-sm font-semibold text-navy-900 shadow-lg sm:-left-5 sm:top-10">
              <span className="block text-orange-600">Juntos construímos</span>mais confiança
            </span>
            <span className="absolute -bottom-4 right-3 rounded-2xl bg-[#1C1917] px-4 py-3 text-sm font-semibold text-white shadow-lg sm:-right-4 sm:bottom-8">
              Pessoas que fazem acontecer
            </span>
          </div>
        </div>
      </section>

      <section className="bg-[#1C1917] px-4 py-5 text-white sm:px-6 lg:px-8" aria-label="Confiança na comunidade">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3">
          <CommunityTrust label="Perfis Verificados" icon={ShieldCheck} />
          <CommunityTrust label="Negociação 100% Direta" icon={Handshake} />
          <CommunityTrust label="Avaliações Reais" icon={Star} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 py-7 sm:grid-cols-3 sm:px-6 lg:px-8" aria-label="Indicadores da comunidade">
        <CommunityMetric label="Profissionais disponíveis" value={availableCount} icon={Users} />
        <CommunityMetric label="Avaliações compartilhadas" value={reviewCount} icon={Star} />
        <CommunityMetric label="Oportunidades abertas" value={jobs.length} icon={ClipboardCheck} />
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        <section aria-labelledby="community-reviews-title">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Experiências reais</p>
              <h2 id="community-reviews-title" className="mt-1 section-title">Avaliações e depoimentos</h2>
            </div>
            <button type="button" onClick={() => navigate({ name: 'professionals' })} className="btn-outline self-start !border-orange-200 !text-orange-800 hover:!border-orange-400 sm:self-auto">
              Deixar minha avaliação <ArrowRight size={16} />
            </button>
          </div>
          <p className="mb-4 text-sm text-slate-500">Escolha um profissional para conhecer o perfil e compartilhar sua experiência.</p>
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

function CommunityTrust({ label, icon: Icon }: { label: string; icon: typeof ShieldCheck }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400"><Icon size={20} /></span>
      <span className="text-sm font-semibold">{label}</span>
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
