import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Page =
  | { name: 'home' }
  | { name: 'professionals'; specialty?: string; city?: string }
  | { name: 'professional-detail'; id: string }
  | { name: 'jobs'; specialty?: string; city?: string }
  | { name: 'job-detail'; id: string }
  | { name: 'post-job' }
  | { name: 'learn' }
  | { name: 'tools' }
  | { name: 'community' }
  | { name: 'about' }
  | { name: 'partners' }
  | { name: 'dashboard' };

interface NavContextValue {
  page: Page;
  navigate: (page: Page) => void;
}

function pageFromPath(pathname: string): Page {
  const path = decodeURIComponent(pathname).replace(/\/+$/, '') || '/';
  if (path === '/') return { name: 'home' };
  if (path === '/profissionais') return { name: 'professionals' };
  if (path.startsWith('/profissionais/')) return { name: 'professional-detail', id: path.slice('/profissionais/'.length) };
  if (path === '/vagas') return { name: 'jobs' };
  if (path.startsWith('/vagas/')) return { name: 'job-detail', id: path.slice('/vagas/'.length) };
  if (path === '/publicar-vaga') return { name: 'post-job' };
  if (path === '/aprender') return { name: 'learn' };
  if (path === '/ferramentas') return { name: 'tools' };
  if (path === '/comunidade') return { name: 'community' };
  if (path === '/sobre') return { name: 'about' };
  if (path === '/parceiros') return { name: 'partners' };
  if (path === '/painel') return { name: 'dashboard' };
  return { name: 'home' };
}

function pathFromPage(page: Page): string {
  switch (page.name) {
    case 'home': return '/';
    case 'professionals': return '/profissionais';
    case 'professional-detail': return `/profissionais/${encodeURIComponent(page.id)}`;
    case 'jobs': return '/vagas';
    case 'job-detail': return `/vagas/${encodeURIComponent(page.id)}`;
    case 'post-job': return '/publicar-vaga';
    case 'learn': return '/aprender';
    case 'tools': return '/ferramentas';
    case 'community': return '/comunidade';
    case 'about': return '/sobre';
    case 'partners': return '/parceiros';
    case 'dashboard': return '/painel';
  }
}

const NavContext = createContext<NavContextValue | undefined>(undefined);

export function NavProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>(() => pageFromPath(window.location.pathname));

  const navigate = (p: Page) => {
    const path = pathFromPage(p);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPopState = () => {
      setPage(pageFromPath(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return <NavContext.Provider value={{ page, navigate }}>{children}</NavContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
