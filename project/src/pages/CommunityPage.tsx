import { HardHat, MessageCircle } from 'lucide-react';
import CommunityFeed from '@/components/CommunityFeed';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-navy-950 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-300"><HardHat size={17} /> Comunidade ProntObra</span>
          <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">O trabalho bem-feito merece ser compartilhado.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">Publique atualizações da sua obra, compartilhe fotos e vídeos e reconheça os bons trabalhos com um “Obra Top”.</p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2 text-sm text-slate-600"><MessageCircle size={17} className="text-orange-500" /> Feed atualizado e salvo neste dispositivo.</div>
        <CommunityFeed />
      </div>
    </div>
  );
}
