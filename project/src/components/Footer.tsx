import { useState } from 'react';
import { ArrowRight, HardHat, Mail } from 'lucide-react';
import { useNav, type Page } from '@/lib/nav';

const footerLinks: { title: string; links: { label: string; page: Page }[] }[] = [
  { title: 'Institucional', links: [{ label: 'Sobre Nós', page: { name: 'about' } }, { label: 'Lojas Parceiras', page: { name: 'partners' } }, { label: 'Comunidade', page: { name: 'community' } }] },
  { title: 'Plataforma', links: [{ label: 'Início', page: { name: 'home' } }, { label: 'Profissionais', page: { name: 'professionals' } }, { label: 'Vagas & Imóveis', page: { name: 'jobs' } }, { label: 'Para Aprender', page: { name: 'learn' } }] },
  { title: 'Ferramentas', links: [{ label: 'Gerador de Orçamento', page: { name: 'tools' } }, { label: 'Diário de Obra', page: { name: 'tools' } }, { label: 'Calculadora de Materiais', page: { name: 'tools' } }] },
  { title: 'Transparência / LGPD', links: [{ label: 'Privacidade e dados pessoais', page: { name: 'about' } }, { label: 'Gestão e Administração', page: { name: 'about' } }, { label: 'Contato', page: { name: 'partners' } }] },
];

export default function Footer() {
  const { navigate } = useNav();
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');

  const subscribe = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = encodeURIComponent('Novidades ProntObra');
    const body = encodeURIComponent(`Quero receber novidades da ProntObra neste e-mail: ${email}`);
    window.location.href = `mailto:contato@prontobra.com.br?subject=${subject}&body=${body}`;
    setNotice('Seu aplicativo de e-mail foi solicitado para concluir a inscrição.');
  };

  return (
    <footer className="mt-auto bg-navy-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600"><HardHat className="h-5 w-5 text-white" strokeWidth={2.5} /></span>
              <span className="font-display text-xl font-extrabold">Pronto<span className="text-orange-400">bra</span></span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/65">Conectando quem constrói a quem precisa em todo o Brasil.</p>
          </div>
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h2 className="mb-3 text-sm font-bold text-white">{column.title}</h2>
              <ul className="space-y-2.5">
                {column.links.map((link) => <li key={link.label}><button type="button" onClick={() => navigate(link.page)} className="text-left text-sm text-white/65 transition hover:text-orange-300">{link.label}</button></li>)}
              </ul>
            </div>
          ))}
        </div>

        <form onSubmit={subscribe} className="mt-9 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-display font-bold">Receba novidades da ProntObra</h2><p className="mt-1 text-sm text-white/60">Conteúdos, oportunidades e atualizações da plataforma.</p></div>
          <div className="flex w-full gap-2 sm:max-w-md"><label htmlFor="newsletter-email" className="sr-only">Seu e-mail</label><input id="newsletter-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-orange-400" placeholder="voce@email.com" /><button className="btn-primary !px-4 !py-2.5"><Mail size={16} /><span className="hidden sm:inline">Inscrever</span><ArrowRight size={16} /></button></div>
          {notice && <p role="status" className="text-xs text-orange-200 sm:basis-full">{notice}</p>}
        </form>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-xs font-bold uppercase tracking-wider text-white/70">Empresas e Lojas Parceiras</h2><div className="mt-3 flex flex-wrap items-center gap-2"><PartnerChip>Materiais</PartnerChip><PartnerChip>Equipamentos</PartnerChip><PartnerChip>Construção</PartnerChip></div></div>
            <button type="button" onClick={() => navigate({ name: 'partners' })} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-orange-400/50 px-4 py-3 text-sm font-bold text-orange-300 transition hover:bg-orange-500/10">+ Sua Marca Aqui · Anuncie <ArrowRight size={16} /></button>
          </div>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 text-center text-xs text-white/50">
          © 2026 ProntObra — Todos os direitos reservados <span className="mx-1 hidden sm:inline">|</span><br className="sm:hidden" /> Gestão: Frantz Derifond
        </div>
      </div>
    </footer>
  );
}

function PartnerChip({ children }: { children: string }) {
  return <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold tracking-wide text-white/65">{children}</span>;
}
