import { useEffect, useState } from 'react';
import { ArrowRight, Play, X } from 'lucide-react';

const videos = [
  {
    title: 'Como funciona o ProntObra',
    description: 'Uma apresentação rápida de como encontrar profissionais e oportunidades.',
    storyboard: true,
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=960&q=80',
    alt: 'Equipe trabalhando em uma obra',
    tag: 'A plataforma',
  },
  {
    title: 'Transformação Antes e Depois',
    description: 'Inspire-se com etapas e resultados de projetos de reforma.',
    videoId: 'leUm1l7ovpo',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=960&q=80',
    alt: 'Ambiente residencial renovado',
    tag: 'Obras reais',
  },
  {
    title: 'Dica Rápida de Obra',
    description: 'Boas práticas de materiais e execução para o dia a dia.',
    videoId: 'EAkGRJQGWKY',
    thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=960&q=80',
    alt: 'Projeto técnico de construção',
    tag: 'Dica prática',
  },
];

export default function QuickVideos() {
  const [selected, setSelected] = useState<(typeof videos)[number] | null>(null);

  return (
    <>
      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-orange-600">ProntObra em ação</p>
              <h2 className="mt-2 section-title">Vídeos rápidos & reels da obra</h2>
              <p className="mt-2 text-sm text-gray-600">Conheça a plataforma, veja ideias de transformação e aprenda uma dica prática.</p>
            </div>
            <span className="badge self-start bg-navy-50 text-navy-700 sm:self-auto">Players carregam só ao clicar</span>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {videos.map((video) => (
              <button
                type="button"
                key={video.title}
                onClick={() => setSelected(video)}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="relative block aspect-video overflow-hidden bg-navy-900">
                  <img src={video.thumbnail} alt={video.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-navy-950/25 transition group-hover:bg-navy-950/40" />
                  <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-bold text-white">{video.tag}</span>
                  <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-orange-600 shadow-lg transition group-hover:scale-110"><Play size={23} fill="currentColor" /></span>
                </span>
                <span className="block p-5">
                  <span className="block font-display text-lg font-bold text-navy-900">{video.title}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-gray-600">{video.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
      {selected && <VideoModal video={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

export function PracticalVideoCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="group flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-lg sm:flex-row">
        <span className="relative block aspect-video shrink-0 overflow-hidden bg-navy-900 sm:aspect-auto sm:w-2/5">
          <img src={videos[2].thumbnail} alt={videos[2].alt} loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute inset-0 grid place-items-center bg-navy-950/20"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white"><Play size={20} fill="currentColor" /></span></span>
        </span>
        <span className="flex flex-1 flex-col justify-center p-5">
          <span className="text-xs font-bold uppercase tracking-wide text-orange-600">Vídeo prático</span>
          <span className="mt-2 font-display text-lg font-bold text-navy-900">{videos[2].title}</span>
          <span className="mt-1 text-sm text-gray-600">Assista a orientações rápidas sobre materiais e execução.</span>
        </span>
      </button>
      {open && <VideoModal video={videos[2]} onClose={() => setOpen(false)} />}
    </>
  );
}

function VideoModal({ video, onClose }: { video: (typeof videos)[number]; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { title: 'Encontre profissionais', description: 'Busque por cidade, estado e especialidade para descobrir talentos perto da sua obra.' },
    { title: 'Compare perfis e trabalhos', description: 'Confira experiência, disponibilidade, avaliações e portfólio antes de conversar.' },
    { title: 'Conecte-se e construa', description: 'Solicite um orçamento ou publique uma oportunidade diretamente na plataforma.' },
  ];

  useEffect(() => {
    if (!video.storyboard) return;
    const timer = window.setInterval(() => setStep((current) => (current + 1) % steps.length), 4500);
    return () => window.clearInterval(timer);
  }, [video.storyboard, steps.length]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={video.title} className="w-full max-w-4xl overflow-hidden rounded-2xl bg-navy-950 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 px-4 py-3 text-white sm:px-6">
          <h2 className="font-display font-bold">{video.title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar vídeo" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><X size={21} /></button>
        </div>
        <div className="aspect-video bg-black">
          {video.videoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
              title={video.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            <div className="relative flex h-full flex-col justify-end overflow-hidden bg-cover bg-center p-6 text-white sm:p-10" style={{ backgroundImage: `linear-gradient(90deg, rgba(9,19,38,.96), rgba(9,19,38,.56)), url(${video.thumbnail})` }}>
              <span className="absolute right-6 top-6 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold">APRESENTAÇÃO DEMONSTRATIVA</span>
              <span className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-300">Passo {step + 1} de {steps.length}</span>
              <h3 className="max-w-2xl font-display text-2xl font-extrabold sm:text-4xl">{steps[step].title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{steps[step].description}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex gap-2" aria-label="Etapas da apresentação">
                  {steps.map((item, index) => <button key={item.title} type="button" aria-label={`Etapa ${index + 1}`} onClick={() => setStep(index)} className={`h-2.5 rounded-full transition-all ${step === index ? 'w-8 bg-orange-400' : 'w-2.5 bg-white/40'}`} />)}
                </div>
                <button type="button" onClick={() => setStep((current) => (current + 1) % steps.length)} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-navy-900">Próxima etapa <ArrowRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
        <p className="px-4 py-3 text-xs text-white/60 sm:px-6">{video.videoId ? 'Vídeo hospedado no YouTube. O conteúdo é de responsabilidade do canal de origem.' : 'Apresentação leve da plataforma; nenhum vídeo é carregado no dispositivo.'}</p>
      </div>
    </div>
  );
}
