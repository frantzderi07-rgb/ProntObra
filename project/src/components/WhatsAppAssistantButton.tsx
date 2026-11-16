import { useEffect, useState } from 'react';
import { MessageCircle, X, ExternalLink } from 'lucide-react';
import { whatsappAssistantNumber } from '@/lib/supabase';

export default function WhatsAppAssistantButton() {
  const [open, setOpen] = useState(false);
  const assistantNumber = whatsappAssistantNumber.replace(/\D/g, '')|| '5567996936753';
  const whatsappUrl = assistantNumber
    ? `https://wa.me/${assistantNumber}?text=${encodeURIComponent('Olá! Quero conversar com a IA do ProntObra.')}`
    : '';

  useEffect(() => {
    const showAssistant = () => setOpen(true);
    window.addEventListener('prontobra:open-whatsapp-assistant', showAssistant);
    return () => window.removeEventListener('prontobra:open-whatsapp-assistant', showAssistant);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div role="dialog" aria-label="Assistente IA do ProntObra" className="w-[min(21rem,calc(100vw-2.5rem))] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display font-bold text-navy-900">Fale com a IA do ProntObra</p>
              <p className="mt-1 text-sm text-slate-600">Tire dúvidas sobre a plataforma, encontre profissionais ou calcule materiais pelo WhatsApp.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
          </div>
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary mt-4 w-full">
              <MessageCircle size={17} /> Abrir WhatsApp <ExternalLink size={15} />
            </a>
          ) : (
            <p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">O número oficial do assistente ainda não foi configurado.</p>
          )}
        </div>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}
        className="group flex items-center gap-3 rounded-full bg-green-600 px-4 py-3 text-white shadow-xl transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300">
        <MessageCircle size={23} />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all group-hover:max-w-52 sm:max-w-52">Fale com a IA do ProntObra</span>
      </button>
    </div>
  );
}
