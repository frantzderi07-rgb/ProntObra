import { useEffect, useState } from 'react';
import { X, Mail, Lock, User as UserIcon, HardHat, Building2, UserRound, Loader2, Phone, Award, Camera, MapPin } from 'lucide-react';
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

type AuthMode = 'signin' | 'signup' | 'recovery';

const userTypes: { value: UserType; label: string; description: string; icon: typeof HardHat }[] = [
  { value: 'professional', label: 'Sou Profissional', description: 'Pedreiro, eletricista, pintor…', icon: HardHat },
  { value: 'company', label: 'Sou Empresa', description: 'Construtora / Pessoa Jurídica', icon: Building2 },
  { value: 'client', label: 'Sou Cliente', description: 'Pessoa Física', icon: UserRound },
];

export default function AuthModal({ open, onClose, defaultMode = 'signup', defaultUserType = 'professional' }: AuthModalProps) {
  const { signIn, signUp, sendPasswordReset, signOut } = useAuth();
  const { navigate } = useNav();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [userType, setUserType] = useState<UserType>(defaultUserType);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([SPECIALTIES[0]]);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [cep, setCep] = useState('');
  const [cepMessage, setCepMessage] = useState('');
  const [experience, setExperience] = useState('0');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [available, setAvailable] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(defaultMode);
    setUserType(defaultUserType);
    setError(null);
    setSuccess('');
  }, [open, defaultMode, defaultUserType]);

  useEffect(() => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) {
      setCepMessage('');
      return;
    }
    const controller = new AbortController();
    setCepMessage('Consultando CEP...');
    fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Não foi possível consultar o CEP.');
        return response.json() as Promise<{ erro?: boolean; uf: string; localidade: string }>;
      })
      .then((address) => {
        if (address.erro) {
          setCepMessage('CEP não encontrado. Confira os números e tente novamente.');
          return;
        }
        setState(address.uf);
        setCity(`${address.localidade} - ${address.uf}`);
        setCepMessage('Cidade e estado preenchidos pelo CEP.');
      })
      .catch((fetchError: unknown) => {
        if (!(fetchError instanceof DOMException && fetchError.name === 'AbortError')) {
          setCepMessage('Não foi possível consultar o CEP. Preencha cidade e estado manualmente.');
        }
      });
    return () => controller.abort();
  }, [cep]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview('');
      return;
    }
    const preview = URL.createObjectURL(avatarFile);
    setAvatarPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [avatarFile]);

  if (!open) return null;

  const selectSpecialty = (item: string) => {
    setSpecialties((selected) => selected.includes(item)
      ? selected.filter((specialty) => specialty !== item)
      : selected.length < 3 ? [...selected, item] : selected);
  };

  const handleAvatarChange = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Use uma imagem JPG, PNG, WebP ou GIF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 10 MB.');
      return;
    }
    setAvatarFile(file);
    setError(null);
  };

  const handleOtherAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut();
      setEmail('');
      setPassword('');
      setSuccess('');
    } catch {
      setError('Não foi possível sair da conta atual. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'recovery') {
        const { error: recoveryError } = await sendPasswordReset(email);
        if (recoveryError) setError(recoveryError);
        else setSuccess('Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada e spam.');
        return;
      }

      if (mode === 'signup') {
        if (!acceptedTerms) {
          setError('É necessário aceitar os Termos de Uso e a Política de Privacidade para continuar.');
          return;
        }
        if (password.length < 6) {
          setError('A senha deve ter no mínimo 6 caracteres.');
          return;
        }
        if (password !== confirmPassword) {
          setError('As senhas não conferem. Verifique os campos de senha.');
          return;
        }
        if (userType === 'professional' && specialties.length === 0) {
          setError('Selecione pelo menos uma especialidade.');
          return;
        }
        if (userType === 'professional' && (!state || !city.trim())) {
          setError('Selecione o estado e informe sua cidade.');
          return;
        }
        const [cityName, cityState] = city.split(' - ');
        const { error: signupError, requiresEmailConfirmation } = await signUp(email, password, userType, fullName, {
          specialty: userType === 'professional' ? specialties.join(', ') : undefined,
          specialties: userType === 'professional' ? specialties : undefined,
          avatar_file: avatarFile ?? undefined,
          is_available: available,
          state: cityState || state || undefined,
          city: cityName?.trim() || city.trim() || undefined,
          experience_years: userType === 'professional' ? Number(experience) : undefined,
          phone: phone || undefined,
          bio: userType === 'professional' ? bio : undefined,
          cnpj: userType === 'company' ? cnpj : undefined,
        });
        if (signupError) {
          setError(signupError);
          return;
        }
        if (requiresEmailConfirmation) {
          setSuccess('Cadastro criado. Confirme seu e-mail para entrar. Depois de acessar o painel, você poderá concluir o envio da foto de perfil.');
          return;
        }
      } else {
        const { error: signinError } = await signIn(email, password);
        if (signinError) {
          setError(signinError);
          return;
        }
      }
      onClose();
      navigate({ name: 'dashboard' });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível concluir a solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'signup' ? 'Crie sua conta' : mode === 'recovery' ? 'Recuperar senha' : 'Entrar na Prontobra';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-navy-700" aria-label="Fechar">
          <X size={22} />
        </button>
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex justify-center"><Logo size="md" /></div>
          <h2 className="text-center font-display text-xl font-bold text-navy-900">{title}</h2>
          <p className="mt-1 text-center text-sm text-gray-500">
            {mode === 'signup' ? 'Conecte-se à construção civil em todo o Brasil' : mode === 'recovery' ? 'Informe seu e-mail cadastrado para receber o link de redefinição' : 'Acesse seu painel'}
          </p>

          {mode === 'signup' && (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {userTypes.map(({ value, label, description, icon: Icon }) => (
                <button key={value} type="button" onClick={() => setUserType(value)}
                  className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 text-center transition-all ${userType === value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  <Icon size={24} /><span className="text-sm font-semibold">{label}</span><span className="text-[11px] leading-tight text-gray-500">{description}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <>
                {userType === 'professional' && (
                  <div className="flex flex-col items-center">
                    <label className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-orange-300 bg-orange-50 text-orange-600 hover:border-orange-500">
                      {avatarPreview ? <img src={avatarPreview} alt="Prévia da foto de perfil" className="h-full w-full object-cover" /> : <Camera size={28} />}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => handleAvatarChange(event.target.files?.[0])} />
                    </label>
                    <span className="mt-2 text-xs text-gray-500">{avatarFile ? 'Foto selecionada · clique para trocar' : 'Adicionar foto de perfil'}</span>
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy-700">Nome completo</label>
                  <div className="relative"><UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" className="input-field pl-10" />
                  </div>
                </div>
                {userType === 'professional' && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-navy-700">Especialidades <span className="font-normal text-gray-500">(selecione até 3)</span></label>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALTIES.map((item) => {
                          const selected = specialties.includes(item);
                          return <button key={item} type="button" aria-pressed={selected} onClick={() => selectSpecialty(item)}
                            className={`rounded-full border px-3 py-1.5 text-sm transition ${selected ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300'}`}>{item}</button>;
                        })}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-navy-700">CEP</label>
                        <div className="relative"><MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input inputMode="numeric" maxLength={9} value={cep} onChange={(event) => setCep(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="00000-000" className="input-field pl-10" aria-describedby="cep-status" />
                        </div>
                        {cepMessage && <p id="cep-status" role="status" className="mt-1 text-xs text-gray-500">{cepMessage}</p>}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-navy-700">Estado (UF)</label>
                        <select required value={state} onChange={(e) => setState(e.target.value)} className="input-field">
                          <option value="">Selecione o estado</option>{BRAZIL_STATES.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><label className="mb-1.5 block text-sm font-medium text-navy-700">Cidade</label>
                        <CitySelectorSpMs value={city} onChange={setCity} stateFilter={state} required placeholder="Busque sua cidade..." />
                      </div>
                      <div><label className="mb-1.5 block text-sm font-medium text-navy-700">Anos de experiência</label>
                        <div className="relative"><Award size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="number" min="0" max="70" required value={experience} onChange={(e) => setExperience(e.target.value)} className="input-field pl-10" />
                        </div>
                      </div>
                    </div>
                    <div><label className="mb-1.5 block text-sm font-medium text-navy-700">WhatsApp</label>
                      <div className="relative"><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="input-field pl-10" />
                      </div>
                    </div>
                    <div><label className="mb-1.5 block text-sm font-medium text-navy-700">Bio / resumo profissional</label>
                      <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Conte um pouco sobre sua experiência e serviços..." className="input-field resize-y" />
                    </div>
                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4">
                      <span><span className="block text-sm font-semibold text-navy-800">Disponível para novos serviços agora</span><span className="text-xs text-gray-500">Você pode alterar isso no painel a qualquer momento.</span></span>
                      <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="h-5 w-5 accent-orange-500" />
                    </label>
                  </>
                )}
                {userType === 'company' && <div><label className="mb-1.5 block text-sm font-medium text-navy-700">CNPJ (opcional)</label><input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className="input-field" /></div>}
              </>
            )}
            <div><label className="mb-1.5 block text-sm font-medium text-navy-700">E-mail</label>
              <div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="input-field pl-10" />
              </div>
            </div>
            {mode !== 'recovery' && <div><label className="mb-1.5 block text-sm font-medium text-navy-700">Senha</label>
              <div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="input-field pl-10" />
              </div>
            </div>}
            {mode === 'signup' && <>
              <div><label className="mb-1.5 block text-sm font-medium text-navy-700">Confirmar Senha</label>
                <div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Digite a senha novamente" className="input-field pl-10" />
                </div>
              </div>
              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input required type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-500" />
                <span>Li e concordo com os Termos de Uso e Política de Privacidade (LGPD).</span>
              </label>
            </>}
            {mode === 'signin' && <button type="button" onClick={() => { setMode('recovery'); setError(null); setSuccess(''); }} className="text-sm font-semibold text-orange-600 hover:text-orange-700">Esqueci minha senha</button>}
            {mode === 'signin' && <button type="button" onClick={() => void handleOtherAccount()} disabled={loading} className="ml-4 text-sm font-semibold text-orange-600 hover:text-orange-700">Entrar com outra conta</button>}
            {error && <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && <div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{success}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {mode === 'signup' ? 'Criar conta' : mode === 'recovery' ? 'Enviar link de recuperação' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {mode === 'recovery' ? <button type="button" onClick={() => { setMode('signin'); setError(null); setSuccess(''); }} className="font-semibold text-orange-600 hover:text-orange-700">Voltar para entrar</button> : <>
              {mode === 'signup' ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
              <button type="button" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); setSuccess(''); }}
                className="font-semibold text-orange-600 hover:text-orange-700">{mode === 'signup' ? 'Entrar' : 'Criar conta'}</button>
            </>}
          </p>
        </div>
      </div>
    </div>
  );
}
