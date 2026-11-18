import { useState } from 'react';
import { ArrowRight, BadgePercent, Building2, Check, Handshake, PackageCheck, Star, Store, Truck, Wrench } from 'lucide-react';
import PartnerRequestModal from '@/components/PartnerRequestModal';

const categories = [
  { title: 'Lojas de materiais', detail: 'Apresente materiais, soluções e condições para profissionais e clientes.', icon: Store, image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=960&q=80' },
  { title: 'Locadoras de equipamentos', detail: 'Divulgue andaimes, betoneiras, ferramentas e equipamentos para cada etapa.', icon: Wrench, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3a3f7f6f?auto=format&fit=crop&w=960&q=80' },
  { title: 'Construtoras e imobiliárias', detail: 'Destaque projetos, imóveis para venda ou locação e novas oportunidades.', icon: Truck, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=960&q=80' },
];

const brandBenefits = [
  { title: 'Mais visibilidade', detail: 'Apresente sua marca a quem planeja, executa e transforma obras.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80', icon: Building2 },
  { title: 'Conexões relevantes', detail: 'Aproxime seus produtos e serviços dos profissionais da construção.', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80', icon: Handshake },
  { title: 'Ofertas para a comunidade', detail: 'Compartilhe novidades, condições e benefícios com clientes e equipes.', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80', icon: BadgePercent },
];

const catalogItems = [
  { title: 'Catálogo de materiais', detail: 'Apresente produtos e soluções para diferentes etapas da obra.', icon: PackageCheck, image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80' },
  { title: 'Ofertas da semana', detail: 'Destaque condições especiais e novidades para a comunidade.', icon: BadgePercent, image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80' },
  { title: 'Locação de máquinas e equipamentos', detail: 'Divulgue equipamentos disponíveis para cada tipo de serviço.', icon: Wrench, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3a3f7f6f?auto=format&fit=crop&w=800&q=80' },
];

const sponsorshipTiers = [
  {
    name: 'Ouro',
    badge: 'Máximo Destaque',
    benefits: ['Logo na página inicial', 'Selo Oficial Parceiro Ouro', 'Divulgação prioritária de ofertas'],
    className: 'border-amber-300 bg-amber-50 text-amber-950',
  },
  {
    name: 'Prata',
    badge: '',
    benefits: ['Destaque na categoria', 'Selo Parceiro Verificado', 'Link direto para WhatsApp / catálogo'],
    className: 'border-slate-300 bg-slate-50 text-slate-900',
  },
  {
    name: 'Bronze',
    badge: '',
    benefits: ['Presença fixa na Vitrine', 'Perfil comercial completo', 'Contato direto com profissionais'],
    className: 'border-orange-200 bg-orange-50 text-orange-950',
  },
];

export default function PartnersPage() {
  const [request, setRequest] = useState<{ category: string; tier: string } | null>(null);
  const openRequest = (category = '', tier = '') => setRequest({ category, tier });

  return (
    <div className="min-h-screen bg-[#fcfaf6] animate-fade-in">
      <section className="overflow-hidden bg-[#f8f5ef]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-16">
          <div className="motion-safe:animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-800"><Handshake size={16} /> Programa de Parcerias</span>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight text-navy-950 sm:text-5xl">Sua marca ao lado de quem constrói.</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">Aproxime sua marca de profissionais, clientes e empresas que movimentam a construção civil em todo o Brasil.</p>
            <button type="button" onClick={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="btn-primary mt-6 !bg-[#F97316] hover:!bg-orange-600">
              Conhecer a vitrine <ArrowRight size={17} />
            </button>
          </div>
          <div className="relative mx-auto w-full max-w-xl motion-safe:animate-slide-up">
            <img src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=85" alt="Materiais e ferramentas de construção em loja" className="h-[300px] w-full rounded-[2rem] object-cover shadow-2xl sm:h-[390px]" />
            <span className="absolute -left-2 top-5 inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 px-3 py-2.5 text-sm font-semibold text-navy-900 shadow-lg motion-safe:animate-pulse sm:-left-5 sm:top-10 sm:px-4">
              <Store size={18} className="text-orange-600" /> Lojas de Materiais
            </span>
            <span className="absolute -bottom-4 right-3 inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 px-3 py-2.5 text-sm font-semibold text-navy-900 shadow-lg motion-safe:animate-pulse sm:-right-4 sm:bottom-8 sm:px-4">
              <Truck size={18} className="text-orange-600" /> Locadoras e Construtoras
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Benefícios para marcas parceiras</p>
          <h2 className="mt-2 section-title">Uma parceria que aproxima sua marca do setor.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {brandBenefits.map(({ title, detail, image, icon: Icon }, index) => (
            <article key={title} className="group relative isolate flex min-h-64 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl motion-safe:animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <img src={image} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/95 via-navy-950/45 to-transparent" />
              <span className="mb-auto flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white"><Icon size={22} /></span>
              <h3 className="mt-8 font-display text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{detail}</p>
            </article>
          ))}
        </div>

        <section className="mt-14" aria-labelledby="partner-catalog-title">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Sua marca em evidência</p>
              <h2 id="partner-catalog-title" className="mt-2 section-title">O que sua marca pode divulgar na Vitrine</h2>
            </div>
            <button type="button" onClick={() => openRequest()} className="btn-outline self-start !border-orange-200 !text-orange-800 hover:!border-orange-400 sm:self-auto">
              Solicitar Cotação <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {catalogItems.map(({ title, detail, icon: Icon, image }, index) => (
              <article key={title} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg motion-safe:animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative h-40 overflow-hidden">
                  <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-600 shadow"><Icon size={20} /></span>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-navy-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div id="vitrine" className="mt-14 scroll-mt-24">
          <div className="mb-6 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Vitrine do ecossistema</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Quem pode participar?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Selecione o segmento para abrir a solicitação com a categoria já preenchida.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map(({ title, detail, icon: Icon }, index) => (
              <button key={title} type="button" onClick={() => openRequest(title)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 motion-safe:animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white"><Icon size={23} /></span>
                <span className="mt-4 block font-display font-bold text-navy-900">{title}</span>
                <span className="mt-2 block text-sm leading-relaxed text-slate-600">{detail}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <button type="button" onClick={() => openRequest()} className="btn-primary">
              Cadastrar minha empresa na vitrine <ArrowRight size={17} />
            </button>
          </div>
        </div>

        <section className="mt-14 rounded-3xl bg-navy-950 p-5 text-white sm:p-8" aria-labelledby="sponsorship-title">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-sm font-bold uppercase tracking-wider text-orange-300">Cotas de patrocínio</p><h2 id="sponsorship-title" className="mt-2 font-display text-2xl font-bold sm:text-3xl">Uma parceria no tamanho da sua marca.</h2></div>
            <p className="max-w-md text-sm text-white/65">Escolha a cota que combina com seus objetivos e envie uma solicitação para nossa equipe.</p>
          </div>
          <div className="mt-6 grid items-stretch gap-4 sm:grid-cols-3">
            {sponsorshipTiers.map((tier) => (
              <article key={tier.name} className={`flex h-full flex-col rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg ${tier.className}`}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-extrabold">{tier.name}</h3>
                  {tier.badge && <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-950"><Star size={12} fill="currentColor" />{tier.badge}</span>}
                </div>
                <ul className="mt-4 flex-1 space-y-3 text-sm">
                  {tier.benefits.map((benefit) => <li key={benefit} className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-green-700" />{benefit}</li>)}
                </ul>
                <button type="button" onClick={() => openRequest('', tier.name)} className="btn-primary mt-5 w-full">
                  Selecionar Cota {tier.name} <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>

      {request && <PartnerRequestModal initialCategory={request.category} initialTier={request.tier} onClose={() => setRequest(null)} />}
    </div>
  );
}
