import { Award, Eye, Handshake, HeartHandshake, Lightbulb, LockKeyhole, ShieldCheck, Target, Users } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      <section className="relative overflow-hidden bg-navy-950 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <span className="badge border border-orange-400/30 bg-orange-500/10 text-orange-300">Sobre a ProntObra</span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Quem entende de obra, encontra na <span className="text-orange-400">ProntObra.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Nascemos em 2026 para conectar pessoas e oportunidades na construção civil, com atuação em todo o Brasil.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Valorização profissional</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Conexões transparentes</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Qualificação contínua</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-600">Nosso propósito</p>
          <h2 className="mt-2 section-title">Construir confiança também faz parte da obra.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {principles.map(({ title, description, icon: Icon }) => (
            <article key={title} className="card p-6 sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon size={24} /></div>
              <h3 className="mt-5 font-display text-xl font-bold text-navy-900">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p>
            </article>
          ))}
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
            <div className="rounded-3xl bg-navy-900 p-6 text-white shadow-xl sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white"><Lightbulb size={27} /></div>
              <h3 className="mt-5 font-display text-xl font-bold">Gestão próxima e responsável</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">A plataforma evolui para facilitar conexões confiáveis, incentivar o desenvolvimento profissional e apoiar o crescimento do setor em todas as regiões do país.</p>
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
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-orange-400"><LockKeyhole size={23} /></span>
            <div>
              <h2 className="font-display text-xl font-bold text-navy-900">Privacidade e proteção de dados</h2>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-gray-600">A ProntObra trata os dados pessoais conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), utilizando as informações para operar a plataforma e conectar seus participantes. Para solicitar informações ou exercer seus direitos como titular, entre em contato pelo e-mail <a className="font-semibold text-orange-700 hover:underline" href="mailto:prontobra.oficial@gmail.com?subject=Privacidade%20e%20dados%20pessoais">prontobra.oficial@gmail.com</a>.</p>
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-3xl bg-navy-950 p-6 text-white sm:p-9 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-orange-400"><Handshake size={20} /><span className="text-sm font-bold uppercase tracking-wider">Parcerias</span></div>
            <h2 className="mt-3 font-display text-2xl font-bold">Vamos construir novas oportunidades juntos?</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70">Lojas de materiais, construtoras e instituições de ensino: fale com a administração da ProntObra.</p>
          </div>
          <a
            href="mailto:prontobra.oficial@gmail.com?subject=Parceria%20com%20a%20ProntObra"
            className="btn-primary shrink-0"
          >
            <Handshake size={18} /> Seja um Parceiro / Falar com a Administração
          </a>
        </div>
      </section>
    </div>
  );
}

function TrustItem({ icon: Icon, title, detail }: { icon: typeof ShieldCheck; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-orange-400"><Icon size={20} /></span>
      <div><h3 className="font-display font-bold text-navy-900">{title}</h3><p className="mt-1 text-xs leading-relaxed text-gray-500">{detail}</p></div>
    </div>
  );
}
