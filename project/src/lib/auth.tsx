import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { clearActiveLocalUser, createLocalAccount, getActiveLocalUser, getLocalProfile, getProfileExtras, signInLocal } from './localStore';
import type { Profile, UserType } from './types';
import type { LocalUser } from './localStore';

type AuthUser = User | LocalUser;

export interface SignupDetails {
  specialty?: string;
  state?: string;
  city?: string;
  experience_years?: number;
  phone?: string;
  bio?: string;
  cnpj?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: UserType, fullName: string, details?: SignupDetails) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(uid: string) {
    const localProfile = getLocalProfile(uid);
    if (localProfile) {
      setProfile(localProfile);
      return;
    }
    if (!isSupabaseConfigured) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', uid).maybeSingle();
      if (error) throw error;
      setProfile(data ? { ...(data as Profile), ...getProfileExtras((data as Profile).id) } : null);
    } catch (error) {
      console.error('Não foi possível carregar o perfil:', error);
      setProfile(null);
    }
  }

  useEffect(() => {
    const activeLocalUser = getActiveLocalUser();
    if (activeLocalUser) {
      setUser(activeLocalUser);
      void fetchProfile(activeLocalUser.id).finally(() => setLoading(false));
    } else if (!isSupabaseConfigured) {
      setLoading(false);
    }

    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | undefined;
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) throw error;
        if (!getActiveLocalUser()) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          if (data.session?.user) void fetchProfile(data.session.user.id);
        }
      }).catch((error: unknown) => {
        console.error('Não foi possível restaurar a sessão:', error);
      }).finally(() => setLoading(false));

      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (getActiveLocalUser()) return;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        if (nextSession?.user) void fetchProfile(nextSession.user.id);
        else setProfile(null);
      });
      subscription = data.subscription;
    }

    const syncLocalProfile = () => {
      const localUser = getActiveLocalUser();
      if (localUser) void fetchProfile(localUser.id);
    };
    window.addEventListener('prontobra:data-changed', syncLocalProfile);
    window.addEventListener('storage', syncLocalProfile);
    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('prontobra:data-changed', syncLocalProfile);
      window.removeEventListener('storage', syncLocalProfile);
    };
  }, []);

  const signUp: AuthContextValue['signUp'] = async (email, password, userType, fullName, details = {}) => {
    const profileData = {
      user_type: userType,
      full_name: fullName.trim(),
      email,
      phone: details.phone ?? null,
      avatar_url: null,
      specialty: userType === 'professional' ? details.specialty ?? null : null,
      experience_years: userType === 'professional' ? details.experience_years ?? 0 : null,
      city: details.city ?? 'Andradina',
      state: details.state ?? 'SP',
      service_radius: null,
      bio: details.bio ?? null,
    };
    const localProfileData = {
      ...profileData,
      company_cnpj: userType === 'company' ? details.cnpj ?? null : null,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (!error && data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            ...profileData,
          });
          if (profileError) throw profileError;
          setUser(data.user);
          setSession(data.session);
          await fetchProfile(data.user.id);
          return { error: null };
        }
        if (error) console.warn('Cadastro remoto indisponível; usando armazenamento local:', error.message);
        else return { error: 'Não foi possível criar o usuário. Tente novamente.' };
      } catch (error) {
        console.warn('Cadastro remoto indisponível; usando armazenamento local:', error);
      }
    }

    try {
      const result = await createLocalAccount(email, password, {
        ...localProfileData,
        user_type: userType,
        city: profileData.city,
        state: profileData.state,
      });
      setUser(result.user);
      setSession(null);
      setProfile(result.profile);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Não foi possível criar a conta.' };
    }
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) return { error: null };
        const localUser = await signInLocal(email, password);
        if (localUser) {
          setUser(localUser);
          setSession(null);
          await fetchProfile(localUser.id);
          return { error: null };
        }
        return { error: error.message };
      } catch (error) {
        console.warn('Login remoto indisponível; verificando conta local:', error);
      }
    }

    try {
      const localUser = await signInLocal(email, password);
      if (!localUser) return { error: 'E-mail ou senha inválidos.' };
      setUser(localUser);
      setSession(null);
      await fetchProfile(localUser.id);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Não foi possível entrar.' };
    }
  };

  const signOut = async () => {
    if (getActiveLocalUser()) {
      clearActiveLocalUser();
    } else if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
