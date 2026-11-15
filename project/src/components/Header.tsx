import { useState } from 'react';
import { Menu, X, LayoutDashboard, LogOut, Briefcase, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNav } from '@/lib/nav';
import type { UserType } from '@/lib/types';
import Logo from './Logo';
import AuthModal from './AuthModal';

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

  const navLink = (label: string, active: boolean, onClick: () => void) => (
    <button
      onClick={() => { onClick(); setMobileOpen(false); }}
      className={`text-sm font-medium transition-colors ${
        active ? 'text-orange-600' : 'text-navy-700 hover:text-orange-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate({ name: 'home' })} className="flex-shrink-0">
            <Logo />
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            {navLink('Início', page.name === 'home', () => navigate({ name: 'home' }))}
            {navLink('Profissionais', page.name === 'professionals', () => navigate({ name: 'professionals' }))}
            {navLink('Vagas', page.name === 'jobs' || page.name === 'job-detail', () => navigate({ name: 'jobs' }))}
            {navLink('Aprender', page.name === 'learn', () => navigate({ name: 'learn' }))}
            {navLink('Sobre Nós', page.name === 'about', () => navigate({ name: 'about' }))}
            {navLink('Lojas Parceiras', page.name === 'partners', () => navigate({ name: 'partners' }))}
            {navLink('Publicar Vaga', page.name === 'post-job', () => navigate({ name: 'post-job' }))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <button onClick={() => navigate({ name: 'dashboard' })} className="btn-ghost">
                  <LayoutDashboard size={18} />
                  Painel
                </button>
                <button onClick={signOut} className="btn-ghost">
                  <LogOut size={18} />
                  Sair
                </button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth('signin', 'professional')} className="btn-ghost">
                  Entrar
                </button>
                <button onClick={() => openAuth('signup', 'professional')} className="btn-primary">
                  Sou Profissional
                </button>
                <button onClick={() => openAuth('signup', 'company')} className="btn-secondary">
                  Quero Contratar
                </button>
              </>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-navy-700 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden animate-slide-down">
            <div className="flex flex-col gap-3">
              {navLink('Início', page.name === 'home', () => navigate({ name: 'home' }))}
              {navLink('Profissionais', page.name === 'professionals', () => navigate({ name: 'professionals' }))}
              {navLink('Vagas', page.name === 'jobs', () => navigate({ name: 'jobs' }))}
              {navLink('Aprender', page.name === 'learn', () => navigate({ name: 'learn' }))}
              {navLink('Sobre Nós', page.name === 'about', () => navigate({ name: 'about' }))}
              {navLink('Lojas Parceiras', page.name === 'partners', () => navigate({ name: 'partners' }))}
              {navLink('Publicar Vaga', page.name === 'post-job', () => navigate({ name: 'post-job' }))}
              {user && navLink('Painel', page.name === 'dashboard', () => navigate({ name: 'dashboard' }))}
              <div className="mt-2 border-t border-gray-100 pt-3">
                {user ? (
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="btn-outline w-full">
                    <LogOut size={18} /> Sair
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openAuth('signup', 'professional')} className="btn-primary w-full">
                      <Users size={18} /> Sou Profissional
                    </button>
                    <button onClick={() => openAuth('signup', 'company')} className="btn-secondary w-full">
                      <Briefcase size={18} /> Quero Contratar
                    </button>
                    <button onClick={() => openAuth('signin', 'professional')} className="btn-outline w-full">
                      Entrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode={authMode} defaultUserType={authUserType} />
    </>
  );
}
