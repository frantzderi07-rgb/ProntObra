import { useMemo, useState } from 'react';
import { Award, BookOpen, Calculator, CheckCircle2, GraduationCap, Ruler } from 'lucide-react';
import { useAuth } from '@/lib/auth';
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
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [message, setMessage] = useState('');
  const area = useMemo(() => Math.max(0, Number(width) * Number(height)), [width, height]);
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

        <section className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2 text-orange-500"><Calculator size={22} /><span className="text-sm font-bold uppercase">Ferramenta prática</span></div>
            <h2 className="font-display text-2xl font-bold text-navy-900">Calculadora rápida de materiais</h2>
            <p className="mt-2 text-sm text-gray-600">Informe as medidas da área para uma estimativa inicial. O cálculo considera uma parede/revestimento simples e não substitui a orientação de um profissional.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-navy-700">Largura (m)
                <input type="number" min="0" step="0.01" value={width} onChange={(event) => setWidth(event.target.value)} placeholder="Ex.: 4" className="input-field mt-1" />
              </label>
              <label className="text-sm font-medium text-navy-700">Altura (m)
                <input type="number" min="0" step="0.01" value={height} onChange={(event) => setHeight(event.target.value)} placeholder="Ex.: 2,8" className="input-field mt-1" />
              </label>
            </div>
          </div>
          <div className="rounded-2xl bg-navy-50 p-5">
            <h3 className="flex items-center gap-2 font-display font-bold text-navy-900"><Ruler size={18} className="text-orange-500" /> Estimativa para {area.toFixed(2)} m²</h3>
            <div className="mt-4 space-y-3">
              <Estimate label="Tijolos cerâmicos" quantity={area > 0 ? `${Math.ceil(area * 25)} unidades` : '—'} />
              <Estimate label="Cimento (sacos de 50 kg)" quantity={area > 0 ? `${Math.ceil(area * 0.18)} sacos` : '—'} />
              <Estimate label="Tinta (2 demãos)" quantity={area > 0 ? `${Math.ceil(area * 0.2)} litros` : '—'} />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-gray-500">Referências aproximadas: 25 tijolos/m², 0,18 saco de cimento/m² e cobertura de 10 m²/L por demão. Considere perdas e as especificações do fabricante.</p>
          </div>
        </section>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" defaultUserType="professional" />
    </div>
  );
}

function Estimate({ label, quantity }: { label: string; quantity: string }) {
  return <div className="flex items-center justify-between gap-3 border-b border-navy-100 pb-2 text-sm last:border-0"><span className="text-gray-600">{label}</span><strong className="text-navy-900">{quantity}</strong></div>;
}
