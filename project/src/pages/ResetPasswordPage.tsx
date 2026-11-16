import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import { useNav } from '@/lib/nav';

export default function ResetPasswordPage() {
  const { updatePassword, passwordRecovery, clearPasswordRecovery } = useAuth();
  const { navigate } = useNav();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem. Verifique os campos.');
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) {
        setError('O link de redefinição é inválido ou expirou. Solicite um novo link de recuperação.');
        return;
      }
      clearPasswordRecovery();
      setSuccess('Senha alterada com sucesso. Você já pode entrar com sua nova senha.');
    } catch {
      setError('Não foi possível alterar a senha. Solicite um novo link de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex justify-center"><Logo size="md" /></div>
        <h1 className="text-center font-display text-xl font-bold text-navy-900">Crie uma nova senha</h1>
        <p className="mt-2 text-center text-sm text-gray-500">Escolha uma senha segura para sua conta ProntObra.</p>
        {!passwordRecovery && !success ? (
          <div className="mt-6">
            <p role="alert" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Este link de redefinição é inválido ou expirou. Solicite um novo link na tela de login.</p>
            <button type="button" onClick={() => navigate({ name: 'home' })} className="btn-primary mt-4 w-full">Voltar ao início</button>
          </div>
        ) : success ? (
          <div className="mt-6">
            <p role="status" className="rounded-lg bg-green-50 p-4 text-sm text-green-800">{success}</p>
            <button type="button" onClick={() => navigate({ name: 'home' })} className="btn-primary mt-4 w-full">Voltar ao início</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-navy-700">Nova senha
              <span className="relative mt-1.5 block"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" className="input-field pl-10" />
              </span>
            </label>
            <label className="block text-sm font-medium text-navy-700">Confirmar nova senha
              <span className="relative mt-1.5 block"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Digite novamente" className="input-field pl-10" />
              </span>
            </label>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null} Alterar senha
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
