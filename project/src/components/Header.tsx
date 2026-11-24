import { useState } from 'react';
import { Briefcase, LayoutDashboard, LogOut, Menu, Users, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNav, type Page } from '@/lib/nav';
import type { UserType } from '@/lib/types';
import Logo from './Logo';
import AuthModal from './AuthModal';

const links: { label: string; page: Page }[] = [
  { label: 'Início', page: { name: 'home' } },
  { label: 'Profissionais', page: { name: 'professionals' } },
  { label: 'Vagas', page: { name: 'jobs' } },
  { label: 'Ferramentas', page: { name: 'tools' } },
  { label: 'Aprender', page: { name: 'learn' } },
  { label: 'Comunidade', page: { name: 'community' } },
  { label: 'Parceiros', page: { name: 'partners' } },
  { label: 'Sobre', page: { name: 'about' } },
];

export default function Header() {
  const { user, signOut } = useAuth();
  const { page, navigate } = useNav();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [authUserType, setAuthUserType] = useState<UserType>('professional');

  const openAuth = (mode: 'signin' | 'signup', type: UserType) => {
    setAuthMode(mode);
    setAuthUserType(type);
    setAuthOpen(true);
    setMobileOpen(false);
  };
  const isActive = (target: Page) => page.name === target.name
    || (target.name === 'professionals' && page.name === 'professional-detail')
    || (target.name === 'jobs' && ['job-detail', 'post-job'].includes(page.name));
  const goTo = (target: Page) => {
    navigate(target);
    setMobileOpen(false);
  };
  const navLink = ({ label, page: target }: typeof links[number]) => (
    <button key={label} type="button" onClick={() => goTo(target)} aria-current={isActive(target) ? 'page' : undefined}
      className={`relative whitespace-nowrap py-2 text-sm font-medium transition-colors ${isActive(target) ? 'text-[#D95D24] after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-[#D95D24]' : 'text-stone-700 hover:text-[#D95D24]'}`}>
      {label}
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-40">
        <div className="brand-banner relative isolate overflow-hidden bg-gradient-to-r from-[#07193D] via-[#0B2863] to-[#113D94] text-white">
          <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-1 px-4 py-3 sm:px-6 lg:px-8">
            <button type="button" onClick={() => goTo({ name: 'home' })} className="brand-banner-logo text-center" aria-label="ProntObra - Início">
              <Logo size="lg" />
            </button>
            <div role="marquee" aria-label="Quem entende de obra, encontra na ProntObra" className="brand-banner-slogan-window w-full overflow-hidden text-center text-xs font-medium text-white/85 sm:text-sm">
              <span className="brand-banner-slogan-track whitespace-nowrap">Quem entende de obra, encontra na ProntObra</span>
            </div>
          </div>
        </div>
        <div className="border-b border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <button type="button" onClick={() => goTo({ name: 'home' })} className="max-w-[13rem] shrink-0 sm:max-w-none" aria-label="ProntObra - Início"><Logo size="sm" /></button>
          <nav aria-label="Navegação principal" className="hidden items-center gap-3 xl:flex 2xl:gap-4">
            {links.map(navLink)}
            {!user && (
              <button type="button" onClick={() => openAuth('signin', 'professional')} className="whitespace-nowrap py-2 text-sm font-medium text-stone-700 transition-colors hover:text-[#D95D24]">Entrar</button>
            )}
          </nav>
          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            {user ? (
              <>
                <button type="button" onClick={() => goTo({ name: 'dashboard' })} className="btn-ghost !px-2"><LayoutDashboard size={17} /> Painel</button>
                <button type="button" onClick={() => void signOut()} className="btn-ghost !px-2"><LogOut size={17} /> Sair</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => openAuth('signup', 'professional')} className="whitespace-nowrap rounded-full bg-[#D95D24] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C24E1B]"><Users size={16} /> Sou Profissional</button>
                <button type="button" onClick={() => openAuth('signup', 'client')} className="whitespace-nowrap rounded-full bg-[#1C1917] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"><Briefcase size={16} /> Contratar</button>
              </>
            )}
          </div>
          <button type="button" className="rounded-lg p-2 text-navy-700 xl:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-4 xl:hidden">
            <nav aria-label="Navegação móvel" className="flex flex-col gap-4">{links.map(navLink)}</nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
              {user ? (
                <>
                  <button type="button" onClick={() => goTo({ name: 'dashboard' })} className="btn-outline w-full"><LayoutDashboard size={17} /> Painel</button>
                  <button type="button" onClick={() => { void signOut(); setMobileOpen(false); }} className="btn-outline w-full"><LogOut size={17} /> Sair</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => openAuth('signin', 'professional')} className="btn-outline w-full">Entrar</button>
                  <button type="button" onClick={() => openAuth('signup', 'professional')} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D95D24] px-4 py-3 text-sm font-semibold text-white"><Users size={17} /> Sou Profissional</button>
                  <button type="button" onClick={() => openAuth('signup', 'client')} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1C1917] px-4 py-3 text-sm font-semibold text-white"><Briefcase size={17} /> Contratar</button>
                </>
              )}
            </div>
          </div>
        )}
        </div>
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode={authMode} defaultUserType={authUserType} />
    </>
  );
}
