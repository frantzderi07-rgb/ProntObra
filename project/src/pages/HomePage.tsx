import { useState } from 'react';
import { ArrowRight, Building2, GraduationCap, HardHat, MapPin, Search, Star, UserRound } from 'lucide-react';
import { useNav } from '@/lib/nav';
import { BRAZIL_STATES, SPECIALTIES } from '@/lib/types';
import type { Job, ProfessionalWithStats } from '@/lib/types';
import CitySelectorSpMs from '@/components/CitySelectorSpMs';
import ProfessionalCard from '@/components/ProfessionalCard';
import QuickVideos from '@/components/QuickVideos';
import AuthModal from '@/components/AuthModal';

interface HomePageProps {
  professionals?: ProfessionalWithStats[];
  jobs?: Job[];
}

const demoProfessionals = [
  { name: 'Carlos Eduardo Silva', specialty: 'Pedreiro · Mestre de Obras', city: 'Andradina - SP', rating: '4,9', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=720&q=80' },
  { name: 'Marcos Vinícius Souza', specialty: 'Eletricista Residencial', city: 'Três Lagoas - MS', rating: '5,0', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=720&q=80' },
  { name: 'Roberto Almeida', specialty: 'Pintor · Acabamento Fino', city: 'Ilha Solteira - SP', rating: '4,8', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=720&q=80' },
];

export default function HomePage({ professionals = [] }: HomePageProps) {
  const { navigate } = useNav();
  const [type, setType] = useState('professional');
  const [specialty, setSpecialty] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<'professional' | 'company' | 'client'>('client');

  const search = () => {
    if (type === 'jobs') navigate({ name: 'jobs', specialty: specialty || undefined, city: city || undefined });
    else navigate({ name: 'professionals', specialty: specialty || undefined, city: city || undefined });
  };
  const openSignup = (userType: 'company' | 'client') => {
    setAuthType(userType);
    setAuthOpen(true);
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
                Quem entende de obra, encontra na <span className="text-orange-400">ProntObra.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Conectando quem constrói a quem precisa em todo o Brasil.
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
        <QuickVideos />
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" defaultUserType={authType} />
    </>
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
