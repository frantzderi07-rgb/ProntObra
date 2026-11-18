import { useEffect, useState } from 'react';
import { BadgePercent, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getActiveLocalUser } from '@/lib/localStore';
import AuthModal from '@/components/AuthModal';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const sampleCoupons = [
  { id: 'cimento-argamassa', discount: '10% OFF', title: 'Cimento e argamassa', partner: 'Lojas de materiais parceiros', detail: 'Desconto sujeito à disponibilidade e às condições da loja.' },
  { id: 'locacao-betoneira', discount: '15% OFF', title: 'Locação de betoneiras', partner: 'Locadoras parceiras', detail: 'Consulte prazos, região de atendimento e disponibilidade.' },
  { id: 'ferramentas-obra', discount: 'Condição especial', title: 'Ferramentas para sua obra', partner: 'Parceiros ProntObra', detail: 'Apresente seu código ao parceiro para consultar a oferta vigente.' },
];

interface Coupon {
  id: string;
  discount: string;
  title: string;
  partner: string;
  detail: string;
}

export default function CommunityBenefitsSection() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [couponCodes, setCouponCodes] = useState<Record<string, string>>({});
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>(sampleCoupons);
  const [message, setMessage] = useState('');
  const [redeemingCoupon, setRedeemingCoupon] = useState<string | null>(null);

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
          setMessage('Não foi possível carregar os cupons ativos. Tente novamente mais tarde.');
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
          if (active) setMessage('Não foi possível carregar seus cupons. Tente novamente mais tarde.');
          return;
        }
        if (active) setCouponCodes(Object.fromEntries((data ?? []).map((item) => [item.coupon_slug, item.redemption_code])));
      });
    return () => { active = false; };
  }, [user]);

  const redeemCoupon = async (couponId: string) => {
    setMessage('');
    if (!user) {
      setAuthOpen(true);
      setMessage('Entre ou crie sua conta de cliente para resgatar um cupom.');
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
          else setMessage('Este cupom já foi resgatado, mas não foi possível carregar o código. Atualize a página.');
        } else {
          console.error('Não foi possível resgatar o cupom:', error);
          setMessage('Não foi possível resgatar o cupom. Tente novamente.');
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
        setMessage('Não foi possível guardar o cupom neste dispositivo. Verifique o espaço disponível e tente novamente.');
      }
    }
    setRedeemingCoupon(null);
  };

  return (
    <>
      <section className="bg-orange-50/70 py-12 sm:py-16" aria-labelledby="coupons-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white"><BadgePercent size={23} /></span>
            <div><p className="text-sm font-bold uppercase tracking-wider text-orange-700">Benefícios para a comunidade</p><h2 id="coupons-title" className="mt-1 section-title">Clube de Descontos ProntObra</h2><p className="mt-2 text-sm text-slate-600">Resgate seu código e consulte os termos e disponibilidade com o parceiro.</p></div>
          </div>
          {message && <p role="status" className="mt-4 rounded-lg bg-white p-3 text-sm text-slate-700 shadow-sm">{message}</p>}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {availableCoupons.map((coupon) => {
              const code = couponCodes[coupon.id];
              return (
                <article key={coupon.id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
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
            {!availableCoupons.length && !message && <p className="rounded-2xl border border-dashed border-orange-200 bg-white p-6 text-sm text-slate-600 md:col-span-3">Novos benefícios serão publicados aqui em breve.</p>}
          </div>
        </div>
      </section>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" defaultUserType="client" />
    </>
  );
}
