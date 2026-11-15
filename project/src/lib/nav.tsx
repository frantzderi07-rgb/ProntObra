import { createContext, useContext, useState, type ReactNode } from 'react';

export type Page =
  | { name: 'home' }
  | { name: 'professionals'; specialty?: string; city?: string }
  | { name: 'professional-detail'; id: string }
  | { name: 'jobs' }
  | { name: 'job-detail'; id: string }
  | { name: 'post-job' }
  | { name: 'learn' }
  | { name: 'about' }
  | { name: 'partners' }
  | { name: 'dashboard' };

interface NavContextValue {
  page: Page;
  navigate: (page: Page) => void;
}

const NavContext = createContext<NavContextValue | undefined>(undefined);

export function NavProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>({ name: 'home' });

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <NavContext.Provider value={{ page, navigate }}>{children}</NavContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
