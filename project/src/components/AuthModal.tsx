import { useEffect, useState } from 'react';
import { X, Mail, Lock, User as UserIcon, HardHat, Building2, UserRound, Loader2, Phone, Award } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNav } from '@/lib/nav';
import type { UserType } from '@/lib/types';
import { BRAZIL_STATES, SPECIALTIES } from '@/lib/types';
import CitySelectorSpMs from './CitySelectorSpMs';
import Logo from './Logo';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  defaultUserType?: UserType;
}

const userTypes: { value: UserType; label: string; description: string; icon: typeof HardHat }[] = [
  { value: 'professional', label: 'Sou Profissional', description: 'Pedreiro, eletricista, pintor…', icon: HardHat },
  { value: 'company', label: 'Sou Empresa', description: 'Construtora / Pessoa Jurídica', icon: Building2 },
  { value: 'client', label: 'Sou Cliente', description: 'Pessoa Física', icon: UserRound },
];

export default function AuthModal({ open, onClose, defaultMode = 'signup', defaultUserType = 'professional' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const { navigate } = useNav();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [userType, setUserType] = useState<UserType>(defaultUserType);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [experience, setExperience] = useState('0');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(defaultMode);
    setUserType(defaultUserType);
  }, [open, defaultMode, defaultUserType]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        setLoading(false);
        return;
      }
      if (userType === 'professional' && (!state || !city.trim())) {
        setError('Selecione o estado e informe sua cidade.');
        setLoading(false);
        return;
      }
      const [cityName, cityState] = city.split(' - ');
      const { error: signupError } = await signUp(email, password, userType, fullName, {
        specialty: userType === 'professional' ? specialty : undefined,
        state: cityState || state || undefined,
        city: cityName?.trim() || city.trim() || undefined,
        experience_years: userType === 'professional' ? Number(experience) : undefined,
        phone: phone || undefined,
        bio: userType === 'professional' ? bio : undefined,
        cnpj: userType === 'company' ? cnpj : undefined,
      });
      if (signupError) {
        setError(signupError);
        setLoading(false);
      } else {
        onClose();
        navigate({ name: 'dashboard' });
      }
    } else {
      const { error: signinError } = await signIn(email, password);
      if (signinError) {
        setError(signinError);
        setLoading(false);
      } else {
        onClose();
        navigate({ name: 'dashboard' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-slide-up max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-navy-700 transition-colors" aria-label="Fechar">
          <X size={22} />
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex justify-center"><Logo size="md" /></div>
          <h2 className="text-center font-display text-xl font-bold text-navy-900">
            {mode === 'signup' ? 'Crie sua conta' : 'Entrar na Prontobra'}
          </h2>
          <p className="mt-1 text-center text-sm text-gray-500">
            {mode === 'signup' ? 'Conecte-se à construção civil em todo o Brasil' : 'Acesse seu painel'}
          </p>

          {mode === 'signup' && (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {userTypes.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUserType(value)}
                  className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 text-center transition-all ${
                    userType === value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-[11px] leading-tight text-gray-500">{description}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy-700">Nome completo</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" className="input-field pl-10" />
                  </div>
                </div>
                {userType === 'professional' && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-navy-700">Especialidade</label>
                        <select required value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="input-field">
                          {SPECIALTIES.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-navy-700">Estado (UF)</label>
                        <select required value={state} onChange={(e) => setState(e.target.value)} className="input-field">
                          <option value="">Selecione o estado</option>
                          {BRAZIL_STATES.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-navy-700">Cidade</label>
                        <CitySelectorSpMs value={city} onChange={setCity} stateFilter={state} required placeholder="Busque sua cidade no estado selecionado..." />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-navy-700">Anos de experiência</label>
                        <div className="relative">
                          <Award size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="number" min="0" max="70" required value={experience} onChange={(e) => setExperience(e.target.value)} className="input-field pl-10" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-navy-700">WhatsApp</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="input-field pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-navy-700">Bio / resumo profissional</label>
                      <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Conte um pouco sobre sua experiência e serviços..." className="input-field resize-y" />
                    </div>
                  </>
                )}
                {userType === 'company' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy-700">CNPJ (opcional)</label>
                    <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className="input-field" />
                  </div>
                )}
              </>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="input-field pl-10" />
              </div>
            </div>

            {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {mode === 'signup' ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {mode === 'signup' ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
            <button type="button" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); }} className="font-semibold text-orange-600 hover:text-orange-700">
              {mode === 'signup' ? 'Entrar' : 'Criar conta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
