import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Award, BadgeCheck, BadgePercent, Building2, CheckCircle2, GraduationCap, MapPin, MessageCircle, Search, Star, Store, Truck, UserRound, Wrench, X } from 'lucide-react';
import { useNav } from '@/lib/nav';
import { BRAZIL_STATES, SPECIALTIES, type Review } from '@/lib/types';
import type { Job, ProfessionalWithStats } from '@/lib/types';
import CitySelectorSpMs from '@/components/CitySelectorSpMs';
import ProfessionalCard from '@/components/ProfessionalCard';
import QuickVideos from '@/components/QuickVideos';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/lib/auth';
import { getActiveLocalUser } from '@/lib/localStore';
import { isSupabaseConfigured, supabase, whatsappAssistantNumber } from '@/lib/supabase';

interface HomePageProps {
  professionals?: ProfessionalWithStats[];
  jobs?: Job[];
}

const demoProfessionals = [
  { name: 'Carlos Eduardo Silva', specialty: 'Pedreiro · Mestre de Obras', city: 'Andradina - SP', rating: '4,9', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=720&q=80' },
  { name: 'Marcos Vinícius Souza', specialty: 'Eletricista Residencial', city: 'Três Lagoas - MS', rating: '5,0', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=720&q=80' },
  { name: 'Roberto Almeida', specialty: 'Pintor · Acabamento Fino', city: 'Ilha Solteira - SP', rating: '4,8', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=720&q=80' },
];

const partnerCategories = [
  { title: 'Lojas de materiais', detail: 'Apresente materiais, soluções e condições para profissionais e clientes.', icon: Store },
  { title: 'Locadoras de equipamentos', detail: 'Divulgue andaimes, betoneiras, ferramentas e equipamentos para cada etapa.', icon: Wrench },
  { title: 'Construtoras e imobiliárias', detail: 'Destaque projetos, imóveis para venda ou locação e novas oportunidades.', icon: Truck },
];

const sponsorshipTiers = [
  { name: 'Ouro', detail: 'Máxima visibilidade', className: 'border-amber-300 bg-amber-50 text-amber-900' },
  { name: 'Prata', detail: 'Presença em destaque', className: 'border-slate-300 bg-slate-50 text-slate-800' },
  { name: 'Bronze', detail: 'Conexão com a comunidade', className: 'border-orange-200 bg-orange-50 text-orange-900' },
];

const coupons = [
  { id: 'cimento-argamassa', discount: '10% OFF', title: 'Cimento e argamassa', partner: 'Lojas de materiais parceiros', detail: 'Desconto sujeito à disponibilidade e às condições da loja.' },
  { id: 'locacao-betoneira', discount: '15% OFF', title: 'Locação de betoneiras', partner: 'Locadoras parceiras', detail: 'Consulte prazos, região de atendimento e disponibilidade.' },
  { id: 'ferramentas-obra', discount: 'Condição especial', title: 'Ferramentas para sua obra', partner: 'Parceiros ProntObra', detail: 'Apresente seu código ao parceiro para consultar a oferta vigente.' },
];

const servicePriceRows = [
  { category: 'Alvenaria', service: 'Assentamento de tijolos', unit: 'm²', min: 55, max: 110 },
  { category: 'Acabamento', service: 'Assentamento de piso cerâmico', unit: 'm²', min: 45, max: 100 },
  { category: 'Pintura', service: 'Pintura de parede (mão de obra)', unit: 'm²', min: 12, max: 30 },
  { category: 'Elétrica', service: 'Instalação de ponto elétrico', unit: 'ponto', min: 80, max: 180 },
  { category: 'Hidráulica', service: 'Instalação de ponto hidráulico', unit: 'ponto', min: 100, max: 240 },
  { category: 'Reforma', service: 'Reforma geral (mão de obra)', unit: 'diária', min: 180, max: 400 },
];

type PartnerRequest = {
  tier: string;
  category: string;
  companyName: string;
  cnpj: string;
  responsibleName: string;
  whatsapp: string;
  city: string;
  state: string;
  partnershipType: string;
  message: string;
};

const emptyPartnerRequest: PartnerRequest = {
  tier: '',
  category: '',
  companyName: '',
  cnpj: '',
  responsibleName: '',
  whatsapp: '',
  city: '',
  state: '',
  partnershipType: '',
  message: '',
};

const partnershipTypes = [
  'Patrocinador (Ouro, Prata ou Bronze)',
  'Clube de Descontos / Cupons',
  'Loja Parceira / Divulgação',
  'Outro',
];

const formatCnpj = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const formatPartnerPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length < 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export default function HomePage({ professionals = [], jobs = [] }: HomePageProps) {
  const { navigate } = useNav();
  const { user } = useAuth();
  const [type, setType] = useState('professional');
  const [specialty, setSpecialty] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<'professional' | 'company' | 'client'>('client');
  const [partnerRequest, setPartnerRequest] = useState<PartnerRequest | null>(null);
  const [vipPlansOpen, setVipPlansOpen] = useState(false);
  const [couponCodes, setCouponCodes] = useState<Record<string, string>>({});
  const [availableCoupons, setAvailableCoupons] = useState(coupons);
  const [couponMessage, setCouponMessage] = useState('');
  const [redeemingCoupon, setRedeemingCoupon] = useState<string | null>(null);
  const [priceCategory, setPriceCategory] = useState('Todas');

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    void supabase.from('cupons')
      .select('slug, discount, title, partner, detail')
      .order('title')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Não foi possível carregar os cupons ativos:', error);
          setAvailableCoupons([]);
          setCouponMessage('Não foi possível carregar os cupons ativos. Tente novamente mais tarde.');
          return;
        }
        setAvailableCoupons((data ?? []).map((coupon) => ({
          id: coupon.slug,
          discount: coupon.discount,
          title: coupon.title,
          partner: coupon.partner,
          detail: coupon.detail,
        })));
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) {
      setCouponCodes({});
      return;
    }
    if (!isSupabaseConfigured || getActiveLocalUser()) {
      try {
        setCouponCodes(JSON.parse(localStorage.getItem(`prontobra:coupons:${user.id}`) ?? '{}') as Record<string, string>);
      } catch {
        setCouponCodes({});
      }
      return;
    }
    let active = true;
    void supabase.from('cupons_desconto').select('coupon_slug, redemption_code').eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Não foi possível carregar os cupons resgatados:', error);
          if (active) setCouponMessage('Não foi possível carregar seus cupons. Tente novamente mais tarde.');
          return;
        }
        if (active) setCouponCodes(Object.fromEntries((data ?? []).map((item) => [item.coupon_slug, item.redemption_code])));
      });
    return () => { active = false; };
  }, [user]);

  const filteredPriceRows = useMemo(
    () => priceCategory === 'Todas' ? servicePriceRows : servicePriceRows.filter((item) => item.category === priceCategory),
    [priceCategory],
  );
  const reviews = useMemo(() => professionals
    .flatMap((professional) => (professional.reviews ?? [])
      .filter((review) => review.comment?.trim())
      .map((review) => ({ ...review, professionalName: professional.full_name })))
    .sort((first, second) => second.created_at.localeCompare(first.created_at))
    .slice(0, 3), [professionals]);
  const totalReviews = professionals.reduce((total, professional) => total + professional.review_count, 0);
  const averageRating = professionals.reduce((total, professional) => total + (professional.avg_rating ?? 0) * professional.review_count, 0)
    / (totalReviews || 1);

  const search = () => {
    if (type === 'jobs') navigate({ name: 'jobs', specialty: specialty || undefined, city: city || undefined });
    else navigate({ name: 'professionals', specialty: specialty || undefined, city: city || undefined });
  };
  const openSignup = (userType: 'company' | 'client') => {
    setAuthType(userType);
    setAuthOpen(true);
  };

  const openPartnerRequest = (tier = '', category = '') => {
    setPartnerRequest({
      ...emptyPartnerRequest,
      tier,
      category,
      partnershipType: tier ? partnershipTypes[0] : category ? partnershipTypes[2] : '',
    });
  };

  const redeemCoupon = async (couponId: string) => {
    setCouponMessage('');
    if (!user) {
      setAuthType('client');
      setAuthOpen(true);
      setCouponMessage('Entre ou crie sua conta de cliente para resgatar um cupom.');
      return;
    }
    if (couponCodes[couponId]) return;
    setRedeemingCoupon(couponId);
    if (isSupabaseConfigured && !getActiveLocalUser()) {
      const { data, error } = await supabase.from('cupons_desconto').insert({
        user_id: user.id,
        coupon_slug: couponId,
      }).select('redemption_code').single();
      if (error) {
        if (error.code === '23505') {
          const { data: existing } = await supabase.from('cupons_desconto').select('redemption_code').eq('user_id', user.id).eq('coupon_slug', couponId).maybeSingle();
          if (existing?.redemption_code) setCouponCodes((current) => ({ ...current, [couponId]: existing.redemption_code }));
          else setCouponMessage('Este cupom já foi resgatado, mas não foi possível carregar o código. Atualize a página.');
        } else {
          console.error('Não foi possível resgatar o cupom:', error);
          setCouponMessage('Não foi possível resgatar o cupom. Tente novamente.');
        }
        setRedeemingCoupon(null);
        return;
      }
      setCouponCodes((current) => ({ ...current, [couponId]: data.redemption_code }));
    } else {
      const code = `PO-${couponId.slice(0, 4).toUpperCase()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
      const nextCodes = { ...couponCodes, [couponId]: code };
      try {
        localStorage.setItem(`prontobra:coupons:${user.id}`, JSON.stringify(nextCodes));
        setCouponCodes(nextCodes);
      } catch (error) {
        console.error('Não foi possível salvar o cupom neste dispositivo:', error);
        setCouponMessage('Não foi possível guardar o cupom neste dispositivo. Verifique o espaço disponível e tente novamente.');
      }
    }
    setRedeemingCoupon(null);
  };

  return (
    <>
      <div className="bg-slate-50 text-navy-900">
        <section className="relative isolate overflow-visible bg-navy-950 text-white">
          <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=85')" }} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-950/95 to-navy-900/80" />
          <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:px-8 lg:py-20">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-300">
                <MapPin size={14} /> Conectando todo o Brasil
              </span>
              <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
                Quem entende de obra, encontra na <span translate="no" className="notranslate text-orange-400">ProntObra.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Quem entende de obra, encontra na ProntObra.
              </p>
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-md">
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
                  <select aria-label="Tipo de busca" value={type} onChange={(event) => setType(event.target.value)} className="input-field !border-white/10 !bg-navy-900 !text-white">
                    <option value="professional">Profissionais</option>
                    <option value="jobs">Vagas</option>
                  </select>
                  <select aria-label="Especialidade" value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="input-field !border-white/10 !bg-navy-900 !text-white">
                    <option value="">Especialidade</option>
                    {SPECIALTIES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <select aria-label="Estado" value={state} onChange={(event) => { setState(event.target.value); setCity(''); }} className="input-field !border-white/10 !bg-navy-900 !text-white">
                    <option value="">Estado (UF)</option>
                    {BRAZIL_STATES.map(([uf, name]) => <option key={uf} value={uf}>{uf} · {name}</option>)}
                  </select>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <CitySelectorSpMs value={city} onChange={setCity} stateFilter={state} placeholder="Cidade" dark />
                  </div>
                  <button type="button" onClick={search} className="btn-primary sm:col-span-2 lg:col-span-1"><Search size={17} /> Buscar</button>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-medium text-slate-300">
                <span>✓ Busca por cidade e especialidade</span><span>✓ Profissionais em todo o Brasil</span>
              </div>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('prontobra:open-whatsapp-assistant'))}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-green-400/40 bg-green-500/10 px-4 py-2.5 text-sm font-semibold text-green-200 transition hover:bg-green-500/20">
                <MessageCircle size={17} /> Converse com a IA pelo WhatsApp
              </button>
            </div>
            <div className="hidden lg:col-span-5 lg:block">
              <div className="relative mx-auto max-w-md">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85" alt="Casa pronta após obra" className="h-[390px] w-full rounded-3xl object-cover shadow-2xl" />
                <div className="absolute -bottom-5 -left-8 rounded-2xl border border-white/10 bg-white p-4 text-navy-900 shadow-xl">
                  <p className="font-display font-bold">Sua próxima obra começa aqui.</p>
                  <p className="mt-1 text-xs text-slate-500">Pessoas, oportunidades e conhecimento.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <QuickAccess icon={UserRound} title="Para Clientes" description="Encontre profissionais para sua obra ou reforma." action="Criar conta de cliente" onClick={() => openSignup('client')} />
          <QuickAccess icon={Building2} title="Para Empresas" description="Publique vagas e conecte-se com profissionais." action="Publicar oportunidade" onClick={() => navigate({ name: 'jobs' })} />
          <QuickAccess icon={GraduationCap} title="Para Aprender" description="Cursos rápidos, guias e conteúdos da construção." action="Explorar conteúdos" onClick={() => navigate({ name: 'learn' })} />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-sm font-bold uppercase tracking-wider text-orange-600">Talentos da comunidade</p><h2 className="mt-2 section-title">Profissionais em Destaque</h2></div>
            <button type="button" onClick={() => navigate({ name: 'professionals' })} className="inline-flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700">Ver todos os profissionais <ArrowRight size={17} /></button>
          </div>
          {professionals.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{professionals.slice(0, 3).map((person) => <ProfessionalCard key={person.id} professional={person} />)}</div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {demoProfessionals.map((person) => (
                <article key={person.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <img src={person.image} alt="" loading="lazy" className="h-40 w-full object-cover" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2"><div><h3 className="font-display font-bold text-navy-900">{person.name}</h3><p className="mt-1 text-sm text-orange-600">{person.specialty}</p></div><span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700"><Star size={13} fill="currentColor" />{person.rating}</span></div>
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14} />{person.city}</p>
                    <button type="button" onClick={() => navigate({ name: 'professionals' })} className="btn-outline mt-4 w-full !py-2.5">Encontrar profissionais</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8" aria-labelledby="vip-plans-title">
          <div className="rounded-3xl border border-orange-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-600"><Award size={17} /> Mais visibilidade para seu perfil</p>
                <h2 id="vip-plans-title" className="mt-2 section-title">Conheça os planos ProntObra</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">Comece gratuitamente ou consulte a equipe sobre o Destaque VIP para profissionais e empresas.</p>
              </div>
              <button type="button" onClick={() => setVipPlansOpen(true)} className="btn-primary shrink-0">Comparar planos <ArrowRight size={17} /></button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-900">Plano Gratuito</p>
                <p className="mt-1 text-sm text-slate-600">Perfil público, presença nas buscas e acesso aos recursos básicos da plataforma.</p>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <p className="flex items-center gap-2 font-bold text-orange-800"><BadgeCheck size={18} /> Destaque VIP</p>
                <p className="mt-1 text-sm text-orange-800">Selo de destaque e prioridade no topo das buscas, conforme disponibilidade e critérios da plataforma.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="ecosystem-title">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-600">Vitrine do ecossistema</p>
            <h2 id="ecosystem-title" className="mt-2 section-title">Sua marca ao lado de quem constrói.</h2>
            <p className="mt-2 text-sm text-slate-600">Conheça oportunidades para lojas, locadoras, construtoras e empresas do setor.</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {partnerCategories.map(({ title, detail, icon: Icon }) => (
              <button key={title} type="button" onClick={() => openPartnerRequest('', title)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-orange-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white"><Icon size={23} /></span>
                <span className="mt-4 block font-display font-bold text-navy-900 group-hover:text-orange-700">{title}</span>
                <span className="mt-2 block text-sm leading-relaxed text-slate-600">{detail}</span>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-600">Quero ser parceiro <ArrowRight size={16} /></span>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-navy-950 p-5 text-white sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><p className="text-sm font-bold uppercase tracking-wider text-orange-300">Cotas de patrocínio</p><h3 className="mt-2 font-display text-2xl font-bold">Uma parceria no tamanho da sua marca.</h3></div>
              <p className="max-w-md text-sm text-white/65">Escolha a cota que combina com seus objetivos e envie uma solicitação para nossa equipe.</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {sponsorshipTiers.map((tier) => (
                <button key={tier.name} type="button" onClick={() => openPartnerRequest(tier.name)}
                  className={`rounded-2xl border p-5 text-left transition hover:-translate-y-1 hover:border-orange-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${tier.className}`}>
                  <span className="text-lg font-extrabold">{tier.name}</span>
                  <span className="mt-1 block text-sm opacity-75">{tier.detail}</span>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-700">Quero ser parceiro <ArrowRight size={16} /></span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-orange-50/70 py-10" aria-labelledby="coupons-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white"><BadgePercent size={23} /></span>
              <div><p className="text-sm font-bold uppercase tracking-wider text-orange-700">Benefícios para a comunidade</p><h2 id="coupons-title" className="mt-1 section-title">Clube de Descontos ProntObra</h2><p className="mt-2 text-sm text-slate-600">Resgate seu código e consulte os termos e disponibilidade com o parceiro.</p></div>
            </div>
            {couponMessage && <p role="status" className="mt-4 rounded-lg bg-white p-3 text-sm text-slate-700 shadow-sm">{couponMessage}</p>}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {availableCoupons.map((coupon) => {
                const code = couponCodes[coupon.id];
                return (
                  <article key={coupon.id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                    <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-700">{coupon.discount}</span>
                    <h3 className="mt-3 font-display text-lg font-bold text-navy-900">{coupon.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{coupon.partner}</p>
                    <p className="mt-3 text-xs leading-relaxed text-slate-500">{coupon.detail}</p>
                    {code ? (
                      <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 font-mono text-sm font-bold text-green-800"><CheckCircle2 size={17} /> {code}</p>
                    ) : (
                      <button type="button" onClick={() => void redeemCoupon(coupon.id)} disabled={redeemingCoupon === coupon.id} className="btn-primary mt-4 w-full !py-2.5">
                        {redeemingCoupon === coupon.id ? 'Gerando código...' : 'Resgatar Cupom'}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="prices-title">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-sm font-bold uppercase tracking-wider text-orange-600">Referência para planejar</p><h2 id="prices-title" className="mt-2 section-title">Preços médios de serviços</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">Faixas indicativas de mão de obra. Os valores variam conforme região, escopo, materiais e condições da obra.</p></div>
            <label className="text-sm font-semibold text-navy-800">Filtrar categoria
              <select value={priceCategory} onChange={(event) => setPriceCategory(event.target.value)} className="input-field mt-1 min-w-48">
                {['Todas', ...new Set(servicePriceRows.map((item) => item.category))].map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Serviço</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Unidade</th><th className="px-4 py-3">Faixa média</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPriceRows.map((row) => <tr key={row.service} className="hover:bg-orange-50/50"><td className="px-4 py-3 font-semibold text-navy-800">{row.service}</td><td className="px-4 py-3 text-slate-600">{row.category}</td><td className="px-4 py-3 text-slate-600">{row.unit}</td><td className="px-4 py-3 font-semibold text-orange-700">R$ {row.min}–{row.max}{row.unit === 'diária' ? '/dia' : `/${row.unit}`}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500">Valores ilustrativos para referência, não constituem proposta ou garantia de preço.</p>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" aria-label="Comunidade e avaliações">
          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            <div className="rounded-3xl bg-navy-950 p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-wider text-orange-300">ProntObra em números</p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div><p className="text-2xl font-extrabold">{professionals.length}</p><p className="mt-1 text-[11px] text-white/60">profissionais</p></div>
                <div><p className="text-2xl font-extrabold">{jobs.length}</p><p className="mt-1 text-[11px] text-white/60">oportunidades</p></div>
                <div><p className="flex items-center justify-center gap-1 text-2xl font-extrabold"><Star size={17} className="text-orange-300" fill="currentColor" />{totalReviews ? averageRating.toFixed(1).replace('.', ',') : '—'}</p><p className="mt-1 text-[11px] text-white/60">{totalReviews} avaliações</p></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4 text-xs text-white/70"><span>Clientes</span><span>·</span><span>Profissionais</span><span>·</span><span>Empresas</span></div>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-orange-600">Experiências da comunidade</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-navy-900">Avaliações de quem já está na plataforma</h2>
              {reviews.length ? <div className="mt-4 grid gap-3 md:grid-cols-3">
                {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
              </div> : <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">As avaliações dos profissionais aparecerão aqui conforme forem publicadas pela comunidade.</p>}
            </div>
          </div>
        </section>
        <QuickVideos />
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" defaultUserType={authType} />
      {partnerRequest && <PartnerRequestModal initialRequest={partnerRequest} onClose={() => setPartnerRequest(null)} />}
      {vipPlansOpen && <VipPlansModal onClose={() => setVipPlansOpen(false)} />}
    </>
  );
}

function ReviewCard({ review }: { review: Review & { professionalName: string } }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1 text-orange-500" aria-label={`Avaliação ${review.rating} de 5`}>
        {Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < review.rating ? 'currentColor' : 'none'} />)}
      </div>
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-600">“{review.comment}”</p>
      <p className="mt-3 text-xs font-semibold text-navy-800">{review.reviewer_name} · {review.professionalName}</p>
    </article>
  );
}

function PartnerRequestModal({ initialRequest, onClose }: { initialRequest: PartnerRequest; onClose: () => void }) {
  const [form, setForm] = useState(initialRequest);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const partnerNumber = (import.meta.env.VITE_WHATSAPP_PARTNERS_NUMBER || whatsappAssistantNumber).replace(/\D/g, '');
  const whatsappUrl = partnerNumber ? `https://wa.me/${partnerNumber}?text=${encodeURIComponent(
    `Olá! Acabei de enviar uma solicitação de parceria ProntObra.\nEmpresa: ${form.companyName}\nCota: ${form.tier || 'A definir'}\nResponsável: ${form.responsibleName}`,
  )}` : '';

  const update = (key: keyof PartnerRequest, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const cnpjDigits = form.cnpj.replace(/\D/g, '');
    const phoneDigits = form.whatsapp.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) {
      setError('Informe um CNPJ válido com 14 dígitos.');
      return;
    }
    if (phoneDigits.length !== 11) {
      setError('Informe um WhatsApp com DDD e 11 dígitos.');
      return;
    }
    if (!isSupabaseConfigured) {
      setError('O envio de solicitações está temporariamente indisponível. Tente novamente mais tarde.');
      return;
    }
    setLoading(true);
    const { error: insertError } = await supabase.from('solicitacoes_parceria').insert({
      nome_empresa: form.companyName.trim(),
      cnpj: cnpjDigits,
      responsavel: form.responsibleName.trim(),
      whatsapp: form.whatsapp.replace(/\D/g, ''),
      cidade: form.city.trim(),
      estado: form.state,
      categoria: form.category || null,
      tipo_parceria: form.partnershipType,
      cota: form.tier || null,
      mensagem: form.message.trim(),
    });
    setLoading(false);
    if (insertError) {
      console.error('Não foi possível salvar a solicitação de parceria:', insertError);
      setError(insertError.message.includes('Aguarde alguns minutos')
        ? 'Aguarde alguns minutos antes de enviar outra proposta.'
        : 'Não foi possível enviar a solicitação agora. Confira os dados e tente novamente.');
      return;
    }
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/70 p-2 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="partnership-modal-title" className="relative max-h-[calc(100dvh-1rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:max-h-[92vh] sm:p-8" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        {saved ? (
          <div className="py-6 text-center">
            <CheckCircle2 size={48} className="mx-auto text-green-600" />
            <h2 id="partnership-modal-title" className="mt-4 break-words font-display text-xl font-bold leading-snug text-navy-900 sm:text-2xl">Proposta recebida!</h2>
            <p className="mt-2 text-sm text-slate-600">Recebemos sua proposta! Nossa equipe entrará em contato em breve.</p>
            {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700 sm:w-auto"><MessageCircle size={18} /> Continuar pelo WhatsApp</a> : <p className="mt-4 text-xs text-slate-500">O WhatsApp de parcerias ainda não está configurado.</p>}
            <div><button type="button" onClick={onClose} className="btn-outline mt-4">Fechar</button></div>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-600">Parcerias</p>
            <h2 id="partnership-modal-title" className="mt-2 break-words pr-8 font-display text-xl font-bold leading-snug text-navy-900 sm:text-2xl">Vamos conversar sobre parceria</h2>
            <p className="mt-1 text-sm text-slate-600">Conte um pouco sobre sua empresa. Os campos marcados são obrigatórios.</p>
            <form onSubmit={(event) => void submit(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-navy-700">Nome da Empresa
                <input required maxLength={120} value={form.companyName} onChange={(event) => update('companyName', event.target.value)} className="input-field mt-1" />
              </label>
              <label className="block text-sm font-medium text-navy-700">CNPJ da Empresa
                <input required inputMode="numeric" autoComplete="on" maxLength={18} value={form.cnpj} onChange={(event) => update('cnpj', formatCnpj(event.target.value))} placeholder="00.000.000/0000-00" className="input-field mt-1" />
              </label>
              <label className="block text-sm font-medium text-navy-700">Responsável
                <input required maxLength={120} value={form.responsibleName} onChange={(event) => update('responsibleName', event.target.value)} className="input-field mt-1" />
              </label>
              <label className="block text-sm font-medium text-navy-700">WhatsApp / Telefone
                <input required type="tel" inputMode="tel" autoComplete="tel" maxLength={15} value={form.whatsapp} onChange={(event) => update('whatsapp', formatPartnerPhone(event.target.value))} placeholder="(00) 00000-0000" className="input-field mt-1" />
              </label>
              <fieldset className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                <legend className="mb-2 text-sm font-semibold text-black sm:col-span-2">Cidade e Estado (UF)</legend>
                <label className="block text-sm font-medium text-navy-700">Cidade
                  <input required maxLength={100} value={form.city} onChange={(event) => update('city', event.target.value)} placeholder="Andradina" className="input-field mt-1" />
                </label>
                <label className="block text-sm font-medium text-navy-700">Estado (UF)
                  <select required value={form.state} onChange={(event) => update('state', event.target.value)} className="input-field mt-1">
                    <option value="">Selecione</option>{BRAZIL_STATES.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
                  </select>
                </label>
              </fieldset>
              <label className="block text-sm font-medium text-navy-700">Tipo de Parceria
                <select required value={form.partnershipType} onChange={(event) => update('partnershipType', event.target.value)} className="input-field mt-1">
                  <option value="">Selecione</option>{partnershipTypes.map((partnershipType) => <option key={partnershipType}>{partnershipType}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-navy-700">Categoria / segmento
                <select value={form.category} onChange={(event) => update('category', event.target.value)} className="input-field mt-1">
                  <option value="">Selecione (opcional)</option>{partnerCategories.map((item) => <option key={item.title}>{item.title}</option>)}
                  <option>Fabricante</option><option>Instituição de ensino</option><option>Outro</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-navy-700">Cota de patrocínio
                <select value={form.tier} onChange={(event) => update('tier', event.target.value)} className="input-field mt-1">
                  <option value="">A definir</option>{sponsorshipTiers.map((tier) => <option key={tier.name}>{tier.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-navy-700 sm:col-span-2">Conte um pouco sobre sua proposta
                <textarea required maxLength={1000} rows={4} value={form.message} onChange={(event) => update('message', event.target.value)} className="input-field mt-1 resize-y" placeholder="Conte sobre sua empresa e a parceria que gostaria de propor." />
              </label>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary sm:col-span-2">{loading ? 'Enviando solicitação...' : 'Enviar solicitação'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function VipPlansModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="vip-modal-title" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-7" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-600"><BadgeCheck size={17} /> Planos para profissionais e empresas</p>
            <h2 id="vip-modal-title" className="mt-2 break-words font-display text-xl font-bold text-black sm:text-2xl">Escolha como quer aparecer</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="mt-5 grid gap-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-bold text-black">Plano Gratuito</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">Perfil público e participação nas buscas da ProntObra, sem selo VIP.</p>
          </div>
          <div className="rounded-xl border border-orange-300 bg-orange-50 p-4">
            <h3 className="flex items-center gap-2 font-bold text-orange-800"><Award size={18} /> Destaque VIP</h3>
            <p className="mt-1 text-sm leading-relaxed text-orange-900">Selo visual de Destaque VIP e prioridade no topo das buscas da página inicial, conforme disponibilidade e critérios da plataforma.</p>
            <p className="mt-2 text-xs text-orange-800">Valores e ativação são consultados com a equipe; não há cobrança automática por este modal.</p>
          </div>
        </div>
        <a href="mailto:prontobra.oficial@gmail.com?subject=Interesse%20no%20Destaque%20VIP" className="btn-primary mt-5 w-full">Tenho interesse no Destaque VIP</a>
        <button type="button" onClick={onClose} className="btn-outline mt-2 w-full">Fechar</button>
      </div>
    </div>
  );
}

function QuickAccess({ icon: Icon, title, description, action, onClick }: { icon: typeof UserRound; title: string; description: string; action: string; onClick: () => void }) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon size={24} /></span>
      <h2 className="mt-4 font-display text-lg font-bold text-navy-900">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>
      <button type="button" onClick={onClick} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700">{action}<ArrowRight size={16} /></button>
    </article>
  );
}
