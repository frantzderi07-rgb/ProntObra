import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Star,
  Briefcase,
  Building2,
  UserCheck,
  GraduationCap,
  Search,
  MapPin,
  Phone,
  CheckCircle2,
  X,
  HardHat,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNav } from '../lib/nav';
import type { Job, ProfessionalWithStats } from '../lib/types';
import CitySelectorSpMs from '../components/CitySelectorSpMs';

interface HomePageProps {
  professionals?: ProfessionalWithStats[];
  jobs?: Job[];
}

const slidesHero = [
  {
    src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    alt: 'Profissionais trabalhando em uma obra',
    selo: 'Profissionais qualificados',
    titulo: 'Encontre quem entende da sua obra',
    descricao: 'Conecte-se a profissionais preparados para cada etapa da construção.',
  },
  {
    src: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Projeto arquitetônico de uma construção',
    selo: 'Sua obra, do projeto à entrega',
    titulo: 'Planeje com mais confiança',
    descricao: 'Encontre especialistas para tirar seus planos do papel.',
  },
  {
    src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    alt: 'Ambiente residencial concluído',
    selo: 'Qualidade em cada detalhe',
    titulo: 'Construa e reforme com segurança',
    descricao: 'Compare profissionais e escolha a melhor opção para o seu projeto.',
  },
];

export default function HomePage({ professionals = [], jobs = [] }: HomePageProps) {
  const { navigate } = useNav();
  const [slideAtual, setSlideAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const proximoSlide = () => {
    setSlideAtual((atual) => (atual + 1) % slidesHero.length);
  };

  const slideAnterior = () => {
    setSlideAtual((atual) => (atual - 1 + slidesHero.length) % slidesHero.length);
  };

  useEffect(() => {
    if (pausado) return;

    const intervalo = window.setInterval(() => {
      setSlideAtual((atual) => (atual + 1) % slidesHero.length);
    }, 5000);

    return () => window.clearInterval(intervalo);
  }, [pausado]);

  // Filtro de cidade SP / MS
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState('');

  // Controle dos modais (Cliente Particular vs Empresa)
  const [modalTipo, setModalTipo] = useState<'cliente' | 'empresa' | null>(null);
  const [enviado, setEnviado] = useState(false);

  // Dados formulário Cliente Particular (Pessoa Física)
  const [clienteForm, setClienteForm] = useState({
    nome: '',
    whatsapp: '',
    cidade: '',
    especialidade: 'Pedreiro',
    urgencia: 'Esta semana',
    descricao: '',
  });

  // Dados formulário Empresa (CNPJ)
  const [empresaForm, setEmpresaForm] = useState({
    nomeEmpresa: '',
    cnpj: '',
    responsavel: '',
    whatsapp: '',
    cidade: '',
    tituloVaga: '',
    pagamento: 'A combinar',
  });

  // Lista extra criada na sessão
  const [pedidosExtras, setPedidosExtras] = useState<any[]>([]);

  const formatarCNPJ = (valor: string) => {
    const nums = valor.replace(/\D/g, '').slice(0, 14);
    return nums
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const abrirModal = (tipo: 'cliente' | 'empresa') => {
    setEnviado(false);
    if (cidadeFiltro) {
      if (tipo === 'cliente') setClienteForm((p) => ({ ...p, cidade: cidadeFiltro }));
      if (tipo === 'empresa') setEmpresaForm((p) => ({ ...p, cidade: cidadeFiltro }));
    }
    setModalTipo(tipo);
  };

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalTipo === 'cliente') {
      setPedidosExtras((prev) => [
        {
          id: Date.now(),
          tipo: 'Cliente Particular',
          titulo: `Orçamento: ${clienteForm.especialidade}`,
          autor: clienteForm.nome,
          cidade: clienteForm.cidade || 'SP / MS',
          detalhe: clienteForm.descricao,
          contato: clienteForm.whatsapp,
        },
        ...prev,
      ]);
    } else if (modalTipo === 'empresa') {
      setPedidosExtras((prev) => [
        {
          id: Date.now(),
          tipo: 'Empresa Verificada',
          titulo: empresaForm.tituloVaga,
          autor: `${empresaForm.nomeEmpresa} (CNPJ: ${empresaForm.cnpj})`,
          cidade: empresaForm.cidade || 'SP / MS',
          detalhe: `Responsável: ${empresaForm.responsavel} • Pagamento: ${empresaForm.pagamento}`,
          contato: empresaForm.whatsapp,
        },
        ...prev,
      ]);
    }
    setEnviado(true);
  };

  const listaProfissionais =
    professionals.length > 0
      ? professionals.slice(0, 6).map((p: any) => ({
          id: p.id,
          nome: p.full_name || p.name || 'Profissional ProntObra',
          especialidade: p.specialty || 'Construção Civil',
          cidade: p.city ? `${p.city} - ${p.state || 'SP'}` : 'Andradina - SP',
          nota: p.avg_rating || 4.9,
          avaliacoes: p.review_count || 18,
          verificado: true,
        }))
      : [
          {
            id: '1',
            nome: 'Carlos Eduardo Silva',
            especialidade: 'Pedreiro & Mestre de Obras',
            cidade: 'Andradina - SP',
            nota: 4.9,
            avaliacoes: 32,
            verificado: true,
          },
          {
            id: '2',
            nome: 'Marcos Vinícius Souza',
            especialidade: 'Eletricista Residencial e Predial',
            cidade: 'Três Lagoas - MS',
            nota: 5.0,
            avaliacoes: 27,
            verificado: true,
          },
          {
            id: '3',
            nome: 'Roberto Almeida',
            especialidade: 'Pintor & Acabamento Fino',
            cidade: 'Ilha Solteira - SP',
            nota: 4.8,
            avaliacoes: 19,
            verificado: true,
          },
        ];

  const profissionaisFiltrados = listaProfissionais.filter((prof) => {
    const matchCidade =
      !cidadeFiltro ||
      prof.cidade.toLowerCase().includes(cidadeFiltro.toLowerCase());
    const matchEsp =
      !especialidadeFiltro ||
      prof.especialidade.toLowerCase().includes(especialidadeFiltro.toLowerCase()) ||
      prof.nome.toLowerCase().includes(especialidadeFiltro.toLowerCase());
    return matchCidade && matchEsp;
  });

  return (
    <>
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* HERO SECTION - Mantendo exatamente as cores da segunda foto (#0B1F3A, #0F172A e Laranja) */}
        <section className="relative overflow-hidden bg-[#091326] text-white">
        {/* Imagem de obra em background suave */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity"
          style={{
            backgroundImage:
              "url('https://pexels.com')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#091326] via-[#0B1F3A]/95 to-[#091326]/85" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

 
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Coluna Esquerda */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-400">
                <MapPin className="h-3.5 w-3.5 text-orange-500" />
                Atendendo todas as cidades de São Paulo (SP) e Mato Grosso do Sul (MS)
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Encontre o profissional certo para sua{' '}
                <span className="text-orange-500">obra ou reforma.</span>
              </h1>

              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                A ProntObra conecta pedreiros, eletricistas, pintores e mestres de obras
                qualificados diretamente a clientes particulares e construtoras de SP e MS.
              </p>

              {/* Barra de Busca por Cidade (SP / MS) e Especialidade */}
              <div className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-3 backdrop-blur-md">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                  <div className="sm:col-span-6">
                    <CitySelectorSpMs
                      value={cidadeFiltro}
                      onChange={setCidadeFiltro}
                      placeholder="Selecione a cidade (SP ou MS)..."
                      dark
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={especialidadeFiltro}
                      onChange={(e) => setEspecialidadeFiltro(e.target.value)}
                      placeholder="Ex: Pedreiro, Eletricista..."
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('resultados-busca');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex h-full w-full items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600"
                    >
                      <Search className="h-4 w-4" />
                      Buscar
                    </button>
                  </div>
                </div>
              </div>

              {/* Botões Principais */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => navigate({ name: 'professionals' })}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
                >
                  Encontrar Profissional
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => abrirModal('cliente')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Solicitar Orçamento Grátis
                </button>
              </div>

              {/* 4 Selos de Confiança */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-500">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold leading-snug text-slate-200">
                    Profissionais Verificados
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-500">
                    <Lock className="h-5 w-5" />
                  </div>
                                   <span className="text-xs font-semibold leading-snug text-slate-200">
                    Segurança e Confiança
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-500">
                    <Star className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold leading-snug text-slate-200">
                    Avaliações Reais
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-500">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold leading-snug text-slate-200">
                    Oportunidades de Trabalho
                  </span>
                </div>
              </div>
            </div>

               {/* Coluna Direita: Carrossel Automático em Loop com Mensagem Explicativa */}
            <div
              className="relative lg:col-span-5"
              onMouseEnter={() => setPausado(true)}
              onMouseLeave={() => setPausado(false)}
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#0F172A] shadow-2xl">
                {/* Imagem do Slide Atual */}
                <img
                  key={slideAtual}
                  src={slidesHero[slideAtual].src}
                  alt={slidesHero[slideAtual].alt}
                  className="h-[420px] w-full object-cover object-top transition-all duration-700"
                />

                {/* Degradê escuro para leitura perfeita do texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#091326] via-[#091326]/40 to-transparent" />

                {/* Selo Superior Esquerdo + Indicadores (Bolinhas) à Direita */}
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                    {slidesHero[slideAtual].selo}
                  </span>

                  <div className="flex items-center gap-1.5 rounded-full bg-[#0F172A]/80 px-2.5 py-1.5 backdrop-blur-sm">
                    {slidesHero.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSlideAtual(idx)}
                        aria-label={`Ir para slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          slideAtual === idx
                            ? 'w-6 bg-orange-500'
                            : 'w-2 bg-white/50 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Setas Laterais para Navegação Manual */}
                <button
                  type="button"
                  onClick={slideAnterior}
                  aria-label="Imagem anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#0F172A]/75 p-2 text-white backdrop-blur-sm transition hover:bg-orange-500"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={proximoSlide}
                  aria-label="Próxima imagem"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#0F172A]/75 p-2 text-white backdrop-blur-sm transition hover:bg-orange-500"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Card Explicativo na Base da Imagem */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-[#0F172A]/95 p-4 backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                      <HardHat className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-white">
                          {slidesHero[slideAtual].titulo}
                        </p>
                        <span className="shrink-0 text-[11px] font-semibold text-orange-400">
                          {slideAtual + 1}/{slidesHero.length}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">
                        {slidesHero[slideAtual].descricao}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            </div>

          {/* 3 CARDS INFERIORES */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-2xl bg-white p-6 text-[#0F172A] shadow-xl">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Para Clientes (Pessoa Física)
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Precisa reformar, construir ou fazer um reparo em casa? Peça orçamentos
                  sem precisar de CNPJ e fale direto com profissionais da sua cidade.
                </p>
              </div>
              <button
                type="button"
                onClick={() => abrirModal('cliente')}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Solicitar Orçamento
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-white p-6 text-[#0F172A] shadow-xl">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">Para Empresas</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Construtoras, engenharias e comércios: cadastre sua empresa com CNPJ,
                  defina a cidade da obra em SP ou MS e contrate equipes verificadas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => abrirModal('empresa')}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Cadastrar Empresa / Vaga
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-white p-6 text-[#0F172A] shadow-xl">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Para Profissionais & Capacitação
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Crie seu perfil profissional gratuito, receba chamadas de obras em SP e
                  MS e acesse conteúdos de qualificação técnica.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate({ name: 'jobs' })}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-[#F8FAFC] px-4 py-3 text-sm font-bold text-[#0F172A] transition hover:bg-slate-100"
              >
                Ver Vagas e Oportunidades
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTADOS FILTRADOS */}
      <section id="resultados-busca" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A]">
              Profissionais em Destaque{' '}
              {cidadeFiltro ? `em ${cidadeFiltro}` : 'em todo brasil'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Filtre pela barra acima para encontrar especialistas na sua cidade.
            </p>
          </div>
          {cidadeFiltro && (
            <button
              type="button"
              onClick={() => setCidadeFiltro('')}
              className="text-sm font-semibold text-orange-500 hover:underline"
            >
              Limpar filtro de cidade ({cidadeFiltro})
            </button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {profissionaisFiltrados.map((prof) => (
            <div
              key={prof.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verificado
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-[#0F172A]">{prof.nome}</h3>
                  <p className="text-sm font-medium text-orange-500">
                    {prof.especialidade}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-[#0F172A]">
                  <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                  {prof.nota} ({prof.avaliacoes})
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="h-4 w-4 text-orange-500" />
                {prof.cidade}
              </div>

              <button
                type="button"
                onClick={() => navigate({ name: 'professionals' })}
                className="mt-5 w-full rounded-xl bg-[#0F172A] py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
              >
                Ver Perfil Completo
              </button>
            </div>
          ))}
        </div>

        {pedidosExtras.length > 0 && (
          <div className="mt-14">
            <h3 className="text-xl font-extrabold text-[#0F172A]">
              Solicitações e Vagas Publicadas Agora
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {pedidosExtras.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-orange-500 px-3 py-0.5 text-xs font-bold text-white">
                      {item.tipo}
                    </span>
                    
                    
                             <span className="text-xs font-semibold text-slate-600">
                      {item.cidade}
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-[#0F172A]">
                    {item.titulo}
                  </h4>
                  <p className="text-xs font-semibold text-slate-700">{item.autor}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.detalhe}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold text-orange-600">
                    <Phone className="h-3.5 w-3.5" />
                    Contato: {item.contato}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* MODAL: CLIENTE PARTICULAR vs EMPRESA */}
      {modalTipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setModalTipo(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            {enviado ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-orange-500" />
                <h3 className="mt-4 text-xl font-bold text-[#0F172A]">
                  {modalTipo === 'empresa'
                    ? 'Cadastro de Empresa e Vaga Publicado!'
                    : 'Pedido de Orçamento Enviado!'}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Profissionais verificados da cidade selecionada em SP/MS já podem
                  visualizar sua solicitação.
                </p>
                <button
                  type="button"
                  onClick={() => setModalTipo(null)}
                  className="mt-6 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Concluir
                </button>
              </div>
            ) : modalTipo === 'cliente' ? (
              <form onSubmit={handleEnviar} className="space-y-4">
                <div>
                  <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600">
                    Cliente Particular • Pessoa Física
                  </span>
                  <h3 className="mt-2 text-xl font-extrabold text-[#0F172A]">
                    Solicitar Orçamento Sem CNPJ
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ideal para reformas residenciais, reparos e serviços rápidos.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Seu Nome Completo *
                  </label>
                  <input
                    required
                    type="text"
                    value={clienteForm.nome}
                    onChange={(e) =>
                      setClienteForm({ ...clienteForm, nome: e.target.value })
                    }
                    placeholder="Ex: Maria Oliveira"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      WhatsApp para Contato *
                    </label>
                    <input
                      required
                      type="tel"
                      value={clienteForm.whatsapp}
                      onChange={(e) =>
                        setClienteForm({ ...clienteForm, whatsapp: e.target.value })
                      }
                      placeholder="(18) 99999-0000"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Especialidade Necessária *
                    </label>
                    <select
                      value={clienteForm.especialidade}
                      onChange={(e) =>
                        setClienteForm({ ...clienteForm, especialidade: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
                    >
                      <option>Pedreiro</option>
                      <option>Eletricista</option>
                      <option>Encanador</option>
                      <option>Pintor</option>
                      <option>Gesseiro</option>
                      <option>Mestre de Obras</option>
                      <option>Marido de Aluguel</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Cidade do Serviço (SP ou MS) *
                  </label>
                  <CitySelectorSpMs
                    value={clienteForm.cidade}
                    onChange={(cidade : string) => setClienteForm({ ...clienteForm, cidade })}
                    placeholder="Digite sua cidade em SP ou MS..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    O que você precisa fazer? *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={clienteForm.descricao}
                    onChange={(e) =>
                      setClienteForm({ ...clienteForm, descricao: e.target.value })
                    }
                    placeholder="Ex: Preciso construir um muro de 15 metros e rebocar a área externa..."
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600"
                >
                  Enviar Pedido de Orçamento
                </button>
              </form>
            ) : (
              <form onSubmit={handleEnviar} className="space-y-4">
                <div>
                  <span className="rounded-full bg-[#0F172A]/10 px-3 py-1 text-xs font-bold text-[#0F172A]">
                    Perfil Empresarial • Pessoa Jurídica
                  </span>
                  <h3 className="mt-2 text-xl font-extrabold text-[#0F172A]">
                    Cadastrar Empresa & Contratar Equipe
                  </h3>
                  <p className="text-xs text-slate-500">
                    Para construtoras, engenharias, condomínios e empresas em SP ou MS.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Nome da Empresa / Razão Social *
                    </label>
                    <input
                      required
                      type="text"
                      value={empresaForm.nomeEmpresa}
                      onChange={(e) =>
                        setEmpresaForm({ ...empresaForm, nomeEmpresa: e.target.value })
                      }
                      placeholder="Ex: Construtora Horizonte Ltda"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      CNPJ *
                    </label>
                    <input
                      required
                      type="text"
                      value={empresaForm.cnpj}
                      onChange={(e) =>
                        setEmpresaForm({
                          ...empresaForm,
                          cnpj: formatarCNPJ(e.target.value),
                        })
                      }
                      placeholder="00.000.000/0001-00"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Nome do Responsável / RH *
                    </label>
                    <input
                      required
                      type="text"
                      value={empresaForm.responsavel}
                      onChange={(e) =>
                        setEmpresaForm({ ...empresaForm, responsavel: e.target.value })
                      }
                      placeholder="Ex: Eng. Ricardo Mendes"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
                    />
                  </div>

 
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      WhatsApp Comercial *
                    </label>
                    <input
                      required
                      type="tel"
                      value={empresaForm.whatsapp}
                      onChange={(e) =>
                        setEmpresaForm({ ...empresaForm, whatsapp: e.target.value })
                      }
                      placeholder="(18) 3722-0000"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Localização da Empresa / Obra (SP ou MS) *
                  </label>
                  <CitySelectorSpMs
                    value={empresaForm.cidade}
                    onChange={(cidade : string) => setEmpresaForm({ ...empresaForm, cidade })}
                    placeholder="Selecione a cidade em SP ou MS..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Vaga ou Demanda da Obra *
                  </label>
                  <input
                    required
                    type="text"
                    value={empresaForm.tituloVaga}
                    onChange={(e) =>
                      setEmpresaForm({ ...empresaForm, tituloVaga: e.target.value })
                    }
                    placeholder="Ex: Contratação de 4 Pedreiros e 2 Serventes - Obra Comercial"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#0F172A] py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-500"
                >
                  Publicar Vaga Empresarial
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  </>);
}



                    
                    
