import { useState } from 'react';
import { ArrowRight, Award, BookOpen, CheckCircle2, GraduationCap } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNav } from '@/lib/nav';
import { updateLocalProfile } from '@/lib/localStore';
import AuthModal from '@/components/AuthModal';
import { PracticalVideoCard } from '@/components/QuickVideos';

const courses = [
  { id: 'projetos', title: 'Leitura de Projetos', description: 'Interprete plantas, cortes, escalas e especificações da obra.', duration: '2 horas', category: 'Planejamento' },
  { id: 'nr10', title: 'Segurança NR-10', description: 'Fundamentos de segurança para atividades com instalações elétricas.', duration: '4 horas', category: 'Segurança' },
  { id: 'nr35', title: 'Segurança NR-35', description: 'Práticas essenciais para trabalho seguro em altura.', duration: '4 horas', category: 'Segurança' },
  { id: 'eletrica', title: 'Elétrica Residencial', description: 'Dimensionamento básico, circuitos e boas práticas de instalação.', duration: '3 horas', category: 'Instalações' },
  { id: 'acabamento', title: 'Acabamento Fino', description: 'Técnicas de preparação, nivelamento e acabamento de superfícies.', duration: '2 horas', category: 'Acabamento' },
];

export default function LearnPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { navigate } = useNav();
  const enrolled = profile?.certifications ?? [];

  const enroll = async (courseId: string) => {
    if (!user || !profile) {
      setAuthOpen(true);
      return;
    }
    if (profile.user_type !== 'professional') {
      setMessage('Os selos de conclusão ficam disponíveis no perfil de profissionais.');
      return;
    }
    updateLocalProfile(profile.id, { certifications: [...new Set([...enrolled, courseId])] });
    await refreshProfile();
    setMessage('Inscrição concluída! O selo foi adicionado ao seu perfil.');
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      <section className="bg-navy-900 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 text-orange-400"><GraduationCap size={24} /><span className="text-sm font-semibold">PARA APRENDER</span></div>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Conhecimento que constrói</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">Capacitações práticas e ferramentas para apoiar cada etapa da sua obra, em todo o Brasil.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        <section>
          <div className="mb-5 flex items-center gap-2"><BookOpen className="text-orange-500" size={21} /><h2 className="section-title">Cursos e capacitações rápidas</h2></div>
          {message && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const isEnrolled = enrolled.includes(course.id);
              return (
                <article key={course.id} className="card flex flex-col p-5">
                  <span className="badge self-start bg-orange-50 text-orange-700">{course.category}</span>
                  <h3 className="mt-3 font-display text-lg font-bold text-navy-900">{course.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{course.description}</p>
                  <p className="mt-4 text-xs font-medium text-gray-500">{course.duration} • conteúdo autoguiado</p>
                  <button type="button" disabled={isEnrolled} onClick={() => void enroll(course.id)} className={`${isEnrolled ? 'btn-outline' : 'btn-primary'} mt-4 w-full`}>
                    {isEnrolled ? <><CheckCircle2 size={17} /> Concluído · Profissional Certificado</> : <><Award size={17} /> Inscrever-se gratuitamente</>}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-bold text-navy-900">Vídeo prático da semana</h2>
          <PracticalVideoCard />
        </section>

        <section>
          <div className="mb-5 flex items-center gap-2"><BookOpen className="text-orange-500" size={21} /><h2 className="section-title">Guias práticos e e-books</h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[['Planejamento de uma reforma', 'Organize etapas, prazos e escolhas antes de começar.'], ['Segurança no canteiro', 'Boas práticas para reduzir riscos nas atividades do dia a dia.'], ['Acabamentos sem desperdício', 'Cuidados com preparação, aplicação e conservação dos materiais.']].map(([title, detail]) => <article key={title} className="card p-5"><span className="badge bg-orange-50 text-orange-700">Guia Prático</span><h3 className="mt-3 font-display font-bold text-navy-900">{title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-600">{detail}</p></article>)}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-bold text-navy-900">Glossário da Construção Civil</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[['Alvenaria', 'Sistema de construção com blocos, tijolos ou pedras unidos por argamassa.'], ['Contrapiso', 'Camada de regularização aplicada sobre a base para receber o revestimento.'], ['Reboco', 'Camada de acabamento aplicada sobre o emboço para nivelar e preparar a superfície.']].map(([term, definition]) => <div key={term} className="rounded-xl bg-slate-50 p-4"><dt className="font-bold text-orange-700">{term}</dt><dd className="mt-1 text-sm leading-relaxed text-gray-600">{definition}</dd></div>)}
          </dl>
        </section>

        <section className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-navy-950 p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div><p className="text-sm font-bold uppercase tracking-wider text-orange-300">Recursos gratuitos</p><h2 className="mt-2 font-display text-xl font-bold">Use as ferramentas para planejar sua próxima obra.</h2><p className="mt-2 text-sm text-white/65">Orçamento, diário e cálculo de materiais em um só lugar.</p></div>
          <button type="button" onClick={() => navigate({ name: 'tools' })} className="btn-primary shrink-0">Abrir Ferramentas <ArrowRight size={17} /></button>
        </section>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" defaultUserType="professional" />
    </div>
  );
}

