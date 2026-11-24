import { ArrowRight, Award, Eye, Handshake, HardHat, HeartHandshake, Lightbulb, LockKeyhole, ShieldCheck, Store, Target, UserRound, Users } from 'lucide-react';
import QuickVideos from '@/components/QuickVideos';
import { ProntObraMonogramIcon } from '@/components/Logo';
import { useNav } from '@/lib/nav';
import PageHero from '@/components/PageHero';

const principles = [
  {
    title: 'Missão',
    description: 'Valorizar quem constrói e aproximar profissionais, clientes e empresas com oportunidades acessíveis e relações transparentes.',
    icon: Target,
  },
  {
    title: 'Visão',
    description: 'Ser uma plataforma de referência nacional para encontrar talentos, desenvolver competências e realizar projetos com confiança.',
    icon: Eye,
  },
  {
    title: 'Valores',
    description: 'Respeito ao trabalhador, transparência, segurança, responsabilidade e qualificação contínua em cada etapa da construção.',
    icon: HeartHandshake,
  },
];

export default function AboutPage() {
  const { navigate } = useNav();

  return (
    <div className="min-h-screen animate-fade-in bg-[#F7F5F0]">
      <PageHero
        pageLabel="Sobre"
        eyebrow="Sobre a ProntObra"
        icon={HardHat}
        title="Quem entende de obra, encontra na ProntObra."
        description="Nascemos em 2026 para conectar pessoas e oportunidades na construção civil, com atuação em todo o Brasil."
        actions={(
          <div className="flex flex-col gap-4">
            <button type="button" onClick={() => navigate({ name: 'partners' })} className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#D95D24] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C24E1B]">
              Conheça nossos parceiros <ArrowRight size={17} />
            </button>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-stone-600">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2">Valorização profissional</span>
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2">Conexões transparentes</span>
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2">Qualificação contínua</span>
            </div>
          </div>
        )}
        visual={<BrandLogoAnimation />}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-600">Nosso propósito</p>
          <h2 className="mt-2 section-title">Construir confiança também faz parte da obra.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {principles.map(({ title, description, icon: Icon }) => (
            <article key={title} className="card p-6 sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon size={24} /></div>
              <h3 className="mt-5 font-display text-xl font-bold text-navy-900">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="connection-steps-title">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Um setor conectado</p>
            <h2 id="connection-steps-title" className="mt-2 section-title">Como a ProntObra conecta o setor em 3 passos</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <ConnectionStep number="01" title="Cliente ou empresa solicita" detail="A necessidade da obra encontra o canal certo para buscar soluções e profissionais." icon={UserRound} />
            <ConnectionStep number="02" title="Profissional atende" detail="Talentos apresentam seu trabalho, recebem contatos e transformam oportunidades em serviços." icon={HardHat} />
            <ConnectionStep number="03" title="Loja parceira fornece" detail="Marcas e fornecedores aproximam materiais e equipamentos de quem está construindo." icon={Store} />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-600">Gestão e Administração</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-navy-900">Tecnologia a serviço de boas oportunidades.</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
              Frantz Derifond, idealizador, administrador e desenvolvedor de sistemas da ProntObra, conduz o projeto com o compromisso de unir inovação tecnológica, organização e geração de oportunidades para os profissionais da construção civil.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-blue-100 bg-white p-6 text-stone-900 shadow-sm sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Lightbulb size={27} /></div>
              <h3 className="mt-5 font-display text-xl font-bold">Gestão próxima e responsável</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">A plataforma evolui para facilitar conexões confiáveis, incentivar o desenvolvimento profissional e apoiar o crescimento do setor em todas as regiões do país.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-3xl bg-orange-50 p-5 sm:grid-cols-3 sm:p-7">
          <TrustItem icon={ShieldCheck} title="Selo ProntObra" detail="Incentivo à verificação de perfis" />
          <TrustItem icon={Users} title="Avaliações Reais" detail="Experiências compartilhadas pela comunidade" />
          <TrustItem icon={Award} title="Capacitação Contínua" detail="Aprendizado para evoluir na profissão" />
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><LockKeyhole size={23} /></span>
            <div>
              <h2 className="font-display text-xl font-bold text-navy-900">Privacidade e proteção de dados</h2>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-gray-600">A ProntObra trata os dados pessoais conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), utilizando as informações para operar a plataforma e conectar seus participantes. Para solicitar informações ou exercer seus direitos como titular, entre em contato pelo e-mail <a className="font-semibold text-orange-700 hover:underline" href="mailto:prontobra@gmail.com?subject=Privacidade%20e%20dados%20pessoais">prontobra@gmail.com</a>.</p>
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-3xl border border-blue-100 bg-white p-6 text-stone-900 shadow-sm sm:p-9 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-700"><Handshake size={20} /><span className="text-sm font-bold uppercase tracking-wider">Parcerias</span></div>
            <h2 className="mt-3 font-display text-2xl font-bold">Vamos construir novas oportunidades juntos?</h2>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">Lojas de materiais, construtoras e instituições de ensino: fale com a administração da ProntObra.</p>
          </div>
          <a
            href="mailto:prontobra@gmail.com?subject=Parceria%20com%20a%20ProntObra"
            className="btn-primary shrink-0"
          >
            <Handshake size={18} /> Seja um Parceiro / Falar com a Administração
          </a>
        </div>
      </section>
      <QuickVideos />
    </div>
  );
}

function BrandLogoAnimation() {
  return (
    <>
      <style>{`
        @keyframes aboutHouseLoop {
          0%, 2% {
            opacity: 0;
            transform: translate3d(clamp(110px, 32vw, 220px), 0, 0) scale(0.72);
          }
          10% {
            opacity: 1;
            transform: translate3d(clamp(78px, 23vw, 158px), -64px, 0) scale(0.82);
          }
          20% {
            transform: translate3d(0, -104px, 0) scale(0.9);
          }
          32% {
            transform: translate3d(clamp(-28px, -2vw, -6px), -68px, 0) scale(0.94);
          }
          44% {
            transform: translate3d(clamp(-32px, -2.5vw, -7px), 0, 0) scale(0.96);
          }
          56% {
            transform: translate3d(clamp(-20px, -1.5vw, -5px), 50px, 0) scale(0.98);
          }
          66%, 86% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
          94%, 100% {
            opacity: 0;
            transform: translate3d(clamp(110px, 32vw, 220px), 0, 0) scale(0.72);
          }
        }
        @keyframes aboutSloganLoop {
          0%, 56% {
            opacity: 0;
            transform: translate3d(60px, 0, 0);
          }
          68% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          86% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          94%, 100% {
            opacity: 0;
            transform: translate3d(60px, 0, 0);
          }
        }
        .about-brand-house {
          animation: aboutHouseLoop 6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          will-change: transform, opacity;
        }
        .about-brand-slogan {
          animation: aboutSloganLoop 6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .about-brand-house,
          .about-brand-slogan {
            animation: none;
            opacity: 1;
            transform: none;
            will-change: auto;
          }
        }
      `}</style>
      <div className="rounded-3xl border border-white/60 bg-white/95 p-5 text-center shadow-xl sm:p-7">
        <div className="flex min-h-[190px] items-center justify-center overflow-visible sm:min-h-[230px]">
          <div className="flex items-center gap-2 sm:gap-4">
            <ProntObraMonogramIcon className="about-brand-house h-14 w-14 shrink-0 sm:h-24 sm:w-24" />
            <div className="flex min-w-0 flex-col items-start">
              <h2 aria-label="ProntObra" className="flex whitespace-nowrap font-display text-2xl font-extrabold leading-none tracking-tight sm:text-5xl">
                <span className="text-[#0F172A]">Pront</span>
                <span className="text-[#F97316]">Obra</span>
              </h2>
              <p className="about-brand-slogan mt-2 max-w-[170px] font-display text-[10px] font-semibold leading-relaxed text-slate-600 sm:max-w-none sm:whitespace-nowrap sm:text-sm">
                Quem entende de obra, encontra na ProntObra
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ConnectionStep({ number, title, detail, icon: Icon }: { number: string; title: string; detail: string; icon: typeof UserRound }) {
  return (
    <article className="rounded-3xl border border-stone-200/80 bg-[#F7F5F0] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg motion-safe:animate-slide-up">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold tracking-widest text-orange-600">{number}</span>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon size={22} /></span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{detail}</p>
    </article>
  );
}

function TrustItem({ icon: Icon, title, detail }: { icon: typeof ShieldCheck; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon size={20} /></span>
      <div><h3 className="font-display font-bold text-navy-900">{title}</h3><p className="mt-1 text-xs leading-relaxed text-gray-500">{detail}</p></div>
    </div>
  );
}
