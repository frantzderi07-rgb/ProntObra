import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Award, Eye, Handshake, HardHat, HeartHandshake, Lightbulb, LockKeyhole, ShieldCheck, Store, Target, Upload, UserRound, Users } from 'lucide-react';
import QuickVideos from '@/components/QuickVideos';

const principles = [
  {
    title: 'Missão',
    description: 'Valorizar quem constrói e aproximar profissionais, clientes e empresas com oportunidades acessíveis e relações transparentes.',
    icon: Target,
  },
  {
    title: 'Visão',
    description: 'Ser uma plataforma de referência nacional para encontrar talentos, desenvolver competências e realizar projetos com confiança.',
    icon: Eye,
  },
  {
    title: 'Valores',
    description: 'Respeito ao trabalhador, transparência, segurança, responsabilidade e qualificação contínua em cada etapa da construção.',
    icon: HeartHandshake,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf6] animate-fade-in">
      <section className="relative overflow-hidden bg-[#1C1917] px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="motion-safe:animate-slide-up">
            <span className="badge border border-orange-400/30 bg-orange-500/10 text-orange-300">Sobre a ProntObra</span>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Quem entende de obra, encontra na <span className="text-orange-400">ProntObra.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Nascemos em 2026 para conectar pessoas e oportunidades na construção civil, com atuação em todo o Brasil.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Valorização profissional</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Conexões transparentes</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Qualificação contínua</span>
            </div>
          </div>
          <BrandLogoUploader />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-600">Nosso propósito</p>
          <h2 className="mt-2 section-title">Construir confiança também faz parte da obra.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {principles.map(({ title, description, icon: Icon }) => (
            <article key={title} className="card p-6 sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon size={24} /></div>
              <h3 className="mt-5 font-display text-xl font-bold text-navy-900">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="connection-steps-title">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Um setor conectado</p>
            <h2 id="connection-steps-title" className="mt-2 section-title">Como a ProntObra conecta o setor em 3 passos</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <ConnectionStep number="01" title="Cliente ou empresa solicita" detail="A necessidade da obra encontra o canal certo para buscar soluções e profissionais." icon={UserRound} />
            <ConnectionStep number="02" title="Profissional atende" detail="Talentos apresentam seu trabalho, recebem contatos e transformam oportunidades em serviços." icon={HardHat} />
            <ConnectionStep number="03" title="Loja parceira fornece" detail="Marcas e fornecedores aproximam materiais e equipamentos de quem está construindo." icon={Store} />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-600">Gestão e Administração</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-navy-900">Tecnologia a serviço de boas oportunidades.</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
              Frantz Derifond, idealizador, administrador e desenvolvedor de sistemas da ProntObra, conduz o projeto com o compromisso de unir inovação tecnológica, organização e geração de oportunidades para os profissionais da construção civil.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-navy-900 p-6 text-white shadow-xl sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white"><Lightbulb size={27} /></div>
              <h3 className="mt-5 font-display text-xl font-bold">Gestão próxima e responsável</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">A plataforma evolui para facilitar conexões confiáveis, incentivar o desenvolvimento profissional e apoiar o crescimento do setor em todas as regiões do país.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-3xl bg-orange-50 p-5 sm:grid-cols-3 sm:p-7">
          <TrustItem icon={ShieldCheck} title="Selo ProntObra" detail="Incentivo à verificação de perfis" />
          <TrustItem icon={Users} title="Avaliações Reais" detail="Experiências compartilhadas pela comunidade" />
          <TrustItem icon={Award} title="Capacitação Contínua" detail="Aprendizado para evoluir na profissão" />
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-orange-400"><LockKeyhole size={23} /></span>
            <div>
              <h2 className="font-display text-xl font-bold text-navy-900">Privacidade e proteção de dados</h2>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-gray-600">A ProntObra trata os dados pessoais conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), utilizando as informações para operar a plataforma e conectar seus participantes. Para solicitar informações ou exercer seus direitos como titular, entre em contato pelo e-mail <a className="font-semibold text-orange-700 hover:underline" href="mailto:prontobra@gmail.com?subject=Privacidade%20e%20dados%20pessoais">prontobra@gmail.com</a>.</p>
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-3xl bg-navy-950 p-6 text-white sm:p-9 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-orange-400"><Handshake size={20} /><span className="text-sm font-bold uppercase tracking-wider">Parcerias</span></div>
            <h2 className="mt-3 font-display text-2xl font-bold">Vamos construir novas oportunidades juntos?</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70">Lojas de materiais, construtoras e instituições de ensino: fale com a administração da ProntObra.</p>
          </div>
          <a
            href="mailto:prontobra@gmail.com?subject=Parceria%20com%20a%20ProntObra"
            className="btn-primary shrink-0"
          >
            <Handshake size={18} /> Seja um Parceiro / Falar com a Administração
          </a>
        </div>
      </section>
      <QuickVideos />
    </div>
  );
}

function BrandLogoUploader() {
  const [logo, setLogo] = useState('');
  const [error, setError] = useState('');
  const [presentation, setPresentation] = useState<LogoPresentation>({ width: 240, frame: 'card' });
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      setLogo(window.localStorage.getItem('prontobra:brand-logo') ?? '');
      const savedPresentation = window.localStorage.getItem('prontobra:brand-logo-presentation');
      if (savedPresentation) {
        const parsed: unknown = JSON.parse(savedPresentation);
        if (typeof parsed !== 'object' || parsed === null) throw new Error('Preferências de logotipo inválidas.');
        const settings = parsed as Record<string, unknown>;
        if (
          typeof settings.width !== 'number'
          || !Number.isFinite(settings.width)
          || settings.width < 120
          || settings.width > 340
          || (settings.frame !== 'none' && settings.frame !== 'card')
        ) {
          throw new Error('Preferências de logotipo inválidas.');
        }
        setPresentation({ width: settings.width, frame: settings.frame });
      }
    } catch (storageError) {
      console.error('Não foi possível carregar o logotipo e suas preferências:', storageError);
      setError('Não foi possível carregar as preferências do logotipo neste navegador.');
    }
  }, []);

  const updatePresentation = (updates: Partial<LogoPresentation>) => {
    const next = { ...presentation, ...updates };
    setPresentation(next);
    try {
      window.localStorage.setItem('prontobra:brand-logo-presentation', JSON.stringify(next));
      setError('');
    } catch (storageError) {
      console.error('Não foi possível salvar as preferências do logotipo:', storageError);
      setError('Não foi possível salvar esta preferência no navegador.');
    }
  };

  const handleFile = (file?: File) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2 MB para ser salva neste navegador.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('Não foi possível pré-visualizar esta imagem.');
        return;
      }
      try {
        window.localStorage.setItem('prontobra:brand-logo', reader.result);
        setLogo(reader.result);
      } catch (storageError) {
        console.error('Não foi possível salvar o logotipo:', storageError);
        setError('Não foi possível salvar a imagem. Tente um arquivo menor ou libere espaço no navegador.');
      }
    };
    reader.onerror = () => {
      console.error('Não foi possível ler o arquivo de logotipo:', reader.error);
      setError('Não foi possível ler esta imagem. Tente outro arquivo.');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    try {
      window.localStorage.removeItem('prontobra:brand-logo');
      window.localStorage.removeItem('prontobra:brand-logo-presentation');
      setLogo('');
      setPresentation({ width: 240, frame: 'card' });
      setError('');
    } catch (storageError) {
      console.error('Não foi possível remover o logotipo salvo:', storageError);
      setError('Não foi possível remover o logotipo deste navegador.');
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm sm:p-7">
      <div className="flex flex-col items-center gap-5">
        <div className="flex w-full justify-center p-2">
          <div
            className={`group flex min-h-[220px] max-w-full flex-col items-center justify-center gap-3 overflow-hidden p-5 text-center transition duration-500 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(249,115,22,0.2)] motion-safe:animate-logo-reveal ${presentation.frame === 'card' ? 'rounded-3xl border border-slate-200 bg-white text-navy-900 shadow-lg' : 'rounded-3xl border border-transparent bg-transparent text-white'}`}
            style={{ width: `${presentation.width}px` }}
          >
            {logo ? (
              <img src={logo} alt="Pré-visualização do logotipo ProntObra" className="max-h-36 w-full max-w-full object-contain transition duration-300 group-hover:scale-[1.02]" />
            ) : (
              <div className="text-orange-300">
                <Upload size={30} className="mx-auto" />
                <p className="mt-2 text-sm font-semibold">Carregar logotipo ProntObra</p>
              </div>
            )}
            <p className={`font-display text-sm font-semibold leading-relaxed ${presentation.frame === 'card' ? 'text-navy-800' : 'text-white/85'}`}>
              Quem entende de obra, encontra na ProntObra
            </p>
          </div>
        </div>

        <div className="w-full border-t border-white/10 pt-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <label htmlFor="brand-logo-size" className="flex items-center justify-between gap-3 text-sm font-semibold text-white">
                <span>Tamanho do logotipo</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-orange-200">{presentation.width}px</span>
              </label>
              <input
                id="brand-logo-size"
                type="range"
                min={120}
                max={340}
                step={10}
                value={presentation.width}
                onChange={(event) => updatePresentation({ width: Number(event.target.value) })}
                className="mt-3 w-full accent-[#F97316]"
                aria-valuetext={`${presentation.width} pixels`}
              />
              <div className="flex justify-between text-[11px] text-white/50"><span>Compacto</span><span>Destaque</span></div>
            </div>
            <fieldset className="min-w-0">
              <legend className="mb-2 text-sm font-semibold text-white">Estilo de fundo</legend>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={presentation.frame === 'none'}
                  onClick={() => updatePresentation({ frame: 'none' })}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${presentation.frame === 'none' ? 'border-orange-400 bg-orange-500/15 text-orange-200' : 'border-white/15 text-white/65 hover:border-white/30'}`}
                >
                  Sem moldura
                </button>
                <button
                  type="button"
                  aria-pressed={presentation.frame === 'card'}
                  onClick={() => updatePresentation({ frame: 'card' })}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${presentation.frame === 'card' ? 'border-orange-400 bg-orange-500/15 text-orange-200' : 'border-white/15 text-white/65 hover:border-white/30'}`}
                >
                  Card Institucional
                </button>
              </div>
            </fieldset>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600">
              <Upload size={16} /> Trocar imagem
            </button>
            <button type="button" onClick={removeLogo} disabled={!logo} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:border-red-300/50 hover:bg-red-500/10 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40">
              Remover
            </button>
            <p className="text-xs text-white/50">Imagem até 2 MB · preferências salvas neste navegador.</p>
          </div>
        </div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-500/15 p-3 text-sm text-red-100">{error}</p>}
    </div>
  );
}

interface LogoPresentation {
  width: number;
  frame: 'none' | 'card';
}

function ConnectionStep({ number, title, detail, icon: Icon }: { number: string; title: string; detail: string; icon: typeof UserRound }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-[#fcfaf6] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg motion-safe:animate-slide-up">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold tracking-widest text-orange-600">{number}</span>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><Icon size={22} /></span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{detail}</p>
    </article>
  );
}

function TrustItem({ icon: Icon, title, detail }: { icon: typeof ShieldCheck; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-orange-400"><Icon size={20} /></span>
      <div><h3 className="font-display font-bold text-navy-900">{title}</h3><p className="mt-1 text-xs leading-relaxed text-gray-500">{detail}</p></div>
    </div>
  );
}
