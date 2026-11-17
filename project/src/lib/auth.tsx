import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { clearActiveLocalUser, createLocalAccount, getActiveLocalUser, getLocalProfile, getProfileExtras, signInLocal, updateLocalEmail } from './localStore';
import type { Profile, UserType } from './types';
import type { LocalUser } from './localStore';

type AuthUser = User | LocalUser;

function authErrorMessage(message: string) {
  const normalized = message.toLocaleLowerCase();
  if (normalized.includes('invalid login credentials')) return 'E-mail ou senha inválidos.';
  if (normalized.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (normalized.includes('user already registered')) return 'Já existe uma conta com este e-mail.';
  if (normalized.includes('password should be at least')) return 'A senha deve ter no mínimo 6 caracteres.';
  return `Não foi possível concluir a solicitação de autenticação: ${message}`;
}

export interface SignupDetails {
  specialty?: string;
  specialties?: string[];
  state?: string;
  city?: string;
  experience_years?: number;
  phone?: string;
  bio?: string;
  cnpj?: string;
  avatar_url?: string;
  avatar_file?: File;
  is_available?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  passwordRecovery: boolean;
  signUp: (email: string, password: string, userType: UserType, fullName: string, details?: SignupDetails) => Promise<{ error: string | null; requiresEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  clearPasswordRecovery: () => void;
  updateEmail: (email: string) => Promise<{ error: string | null; requiresConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

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
    const referralId = new URLSearchParams(window.location.search).get('ref');
    if (referralId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(referralId)) {
      window.sessionStorage.setItem('prontobra:referrer-user-id', referralId);
    }

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

      const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
        if (getActiveLocalUser()) return;
        setPasswordRecovery(event === 'PASSWORD_RECOVERY');
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
      avatar_url: details.avatar_url ?? null,
      specialty: userType === 'professional' ? details.specialty ?? null : null,
      specialties: userType === 'professional' ? details.specialties ?? [] : [],
      experience_years: userType === 'professional' ? details.experience_years ?? 0 : null,
      city: details.city ?? 'Andradina',
      state: details.state ?? 'SP',
      service_radius: null,
      bio: details.bio ?? null,
      is_available: details.is_available ?? true,
      company_cnpj: userType === 'company' ? details.cnpj ?? null : null,
    };
    const localProfileData = {
      ...profileData,
      company_cnpj: userType === 'company' ? details.cnpj ?? null : null,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: userType,
              full_name: profileData.full_name,
              phone: profileData.phone,
              specialty: profileData.specialty,
              specialties: profileData.specialties,
              experience_years: profileData.experience_years,
              city: profileData.city,
              state: profileData.state,
              bio: profileData.bio,
              is_available: profileData.is_available,
              company_cnpj: profileData.company_cnpj,
              referrer_user_id: window.sessionStorage.getItem('prontobra:referrer-user-id'),
            },
          },
        });
        if (error) return { error: authErrorMessage(error.message) };
        if (data.user) {
          if (!data.session) return { error: null, requiresEmailConfirmation: true };
          let avatarUrl = details.avatar_url ?? null;
          if (details.avatar_file) {
            const extension = details.avatar_file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
            const avatarPath = `${data.user.id}/${crypto.randomUUID()}.${extension}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(avatarPath, details.avatar_file, {
              contentType: details.avatar_file.type,
              upsert: true,
            });
            if (uploadError) return { error: `Não foi possível enviar a foto de perfil. Confira o bucket "avatars" e as políticas de upload. (${uploadError.message})` };
            avatarUrl = supabase.storage.from('avatars').getPublicUrl(avatarPath).data.publicUrl;
          }
          const { error: profileError } = await supabase.from('profiles').upsert({
            user_id: data.user.id,
            ...profileData,
            avatar_url: avatarUrl,
          }, { onConflict: 'user_id' });
          if (profileError) return { error: `Não foi possível salvar o perfil: ${profileError.message}` };
          setUser(data.user);
          setSession(data.session);
          await fetchProfile(data.user.id);
          return { error: null };
        }
        return { error: 'Não foi possível criar o usuário. Tente novamente.' };
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Não foi possível concluir o cadastro no Supabase.' };
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
        return { error: authErrorMessage(error.message) };
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

  const sendPasswordReset: AuthContextValue['sendPasswordReset'] = async (email) => {
    if (!isSupabaseConfigured) return { error: 'A recuperação de senha por e-mail não está disponível para contas salvas somente neste dispositivo.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    return { error: error ? authErrorMessage(error.message) : null };
  };

  const updatePassword: AuthContextValue['updatePassword'] = async (password) => {
    if (!isSupabaseConfigured) return { error: 'A redefinição de senha não está disponível para contas salvas somente neste dispositivo.' };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? authErrorMessage(error.message) : null };
  };

  const clearPasswordRecovery = () => setPasswordRecovery(false);

  const updateEmail: AuthContextValue['updateEmail'] = async (email) => {
    if (getActiveLocalUser()) {
      try {
        const updatedUser = await updateLocalEmail(getActiveLocalUser()!.id, email);
        setUser(updatedUser);
        if (profile) setProfile({ ...profile, email: updatedUser.email });
        return { error: null, requiresConfirmation: false };
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Não foi possível alterar o e-mail.' , requiresConfirmation: false };
      }
    }
    if (!isSupabaseConfigured) return { error: 'Não foi possível alterar o e-mail desta conta.', requiresConfirmation: false };
    const { data, error } = await supabase.auth.updateUser({ email });
    if (error) return { error: authErrorMessage(error.message), requiresConfirmation: false };
    if (data.user && profile) {
      const { error: profileError } = await supabase.from('profiles').update({ email }).eq('user_id', data.user.id);
      if (profileError) return { error: 'O pedido de alteração foi enviado, mas não foi possível atualizar o perfil. Tente novamente mais tarde.', requiresConfirmation: true };
      await fetchProfile(data.user.id);
    }
    return { error: null, requiresConfirmation: true };
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
    <AuthContext.Provider value={{ user, session, profile, loading, passwordRecovery, signUp, signIn, sendPasswordReset, updatePassword, clearPasswordRecovery, updateEmail, signOut, refreshProfile }}>
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
