import { useState } from 'react';
import { MessageCircle, UserRound, X } from 'lucide-react';
import type { Profile } from '@/lib/types';

interface QuickContactModalProps {
  professional: Profile;
  open: boolean;
  onClose: () => void;
}

export default function QuickContactModal({ professional, open, onClose }: QuickContactModalProps) {
  const [message, setMessage] = useState(`Olá ${professional.full_name}, encontrei seu perfil na ProntObra e gostaria de solicitar um orçamento.`);
  const [referring, setReferring] = useState(false);
  const [colleague, setColleague] = useState('');
  const [status, setStatus] = useState('');

  if (!open) return null;

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const referralText = referring ? ` Estou indicando ${colleague || 'um colega'} para este serviço.` : '';
    const composedMessage = `${message.trim()}${referralText}`;
    if (professional.phone) {
      const phone = professional.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(composedMessage)}`, '_blank', 'noopener,noreferrer');
      setStatus('Conversa aberta no WhatsApp em uma nova aba.');
    } else if (professional.email) {
      window.location.href = `mailto:${professional.email}?subject=${encodeURIComponent('Contato pela ProntObra')}&body=${encodeURIComponent(composedMessage)}`;
      setStatus('Seu aplicativo de e-mail foi aberto.');
    } else {
      setStatus('Este profissional ainda não cadastrou telefone ou e-mail para contato.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/65 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="quick-contact-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="quick-contact-title" className="font-display text-xl font-bold text-navy-900">Contato direto</h2>
            <p className="mt-1 text-sm text-gray-500">Mensagem para {professional.full_name}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>
        <form onSubmit={send} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-navy-700">Sua mensagem
            <textarea required rows={4} value={message} onChange={(event) => setMessage(event.target.value)} className="input-field mt-1 resize-y" />
          </label>
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input type="checkbox" checked={referring} onChange={(event) => setReferring(event.target.checked)} className="h-4 w-4 accent-orange-500" />
            Indicar um colega
          </label>
          {referring && (
            <label className="block text-sm font-medium text-navy-700">Nome do colega (opcional)
              <input value={colleague} onChange={(event) => setColleague(event.target.value)} className="input-field mt-1" placeholder="Nome da pessoa indicada" />
            </label>
          )}
          {status && <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{status}</p>}
          <button type="submit" className="btn-primary w-full"><MessageCircle size={17} /> Abrir conversa</button>
          <p className="flex items-center justify-center gap-1 text-center text-xs text-gray-400"><UserRound size={13} /> Sem recarregar a página</p>
        </form>
      </div>
    </div>
  );
}
