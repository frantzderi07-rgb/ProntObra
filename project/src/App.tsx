import { useEffect, useState } from 'react';
import { AuthProvider } from './lib/auth';
import { NavProvider, useNav } from './lib/nav';
import * as queries from './lib/queries';
import type { Job, ProfessionalWithStats } from './lib/types';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProfessionalsPage from './pages/ProfessionalsPage';
import ProfessionalDetailPage from './pages/ProfessionalDetailPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import PostJobPage from './pages/PostJobPage';
import DashboardPage from './pages/DashboardPage';
import LearnPage from './pages/LearnPage';
import AboutPage from './pages/AboutPage';
import PartnersPage from './pages/PartnersPage';
import ToolsPage from './pages/ToolsPage';
import CommunityPage from './pages/CommunityPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import WhatsAppAssistantButton from './components/WhatsAppAssistantButton';

function AppContent() {
  const { page } = useNav();
  const [professionals, setProfessionals] = useState<ProfessionalWithStats[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (typeof queries.fetchProfessionals === 'function') {
          const profData = await queries.fetchProfessionals();
          if (Array.isArray(profData)) setProfessionals(profData);
        }
        const fetchJobsFn = (queries as Record<string, unknown>).fetchJobs;
        if (typeof fetchJobsFn === 'function') {
          const jobData = await (fetchJobsFn as () => Promise<Job[]>)();
          if (Array.isArray(jobData)) setJobs(jobData);
        }
      } catch (err) {
        console.warn('Aguardando configuração do Supabase:', err);
      }
    };
    void loadInitialData();
    window.addEventListener('prontobra:data-changed', loadInitialData);
    window.addEventListener('storage', loadInitialData);
    return () => {
      window.removeEventListener('prontobra:data-changed', loadInitialData);
      window.removeEventListener('storage', loadInitialData);
    };
  }, []);

  const renderPage = () => {
    switch (page.name) {
      case 'home':
        return <HomePage professionals={professionals} />;
      case 'professionals':
        return <ProfessionalsPage
          initialSpecialty={'specialty' in page ? page.specialty ?? 'all' : 'all'}
          initialCity={'city' in page ? page.city ?? 'all' : 'all'}
        />;
      case 'professional-detail':
        return <ProfessionalDetailPage id={'id' in page ? page.id : ''} />;
      case 'jobs':
        return <JobsPage
          initialSpecialty={'specialty' in page ? page.specialty ?? 'all' : 'all'}
          initialCity={'city' in page ? page.city ?? 'all' : 'all'}
        />;
      case 'job-detail':
        return <JobDetailPage id={'id' in page ? page.id : ''} />;
      case 'post-job':
        return <PostJobPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'reset-password':
        return <ResetPasswordPage />;
      case 'learn':
        return <LearnPage />;
      case 'tools':
        return <ToolsPage />;
      case 'community':
        return <CommunityPage professionals={professionals} jobs={jobs} />;
      case 'about':
        return <AboutPage />;
      case 'partners':
        return <PartnersPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-slate-900">
      <Header />
      {!['home', 'professionals', 'jobs', 'tools', 'learn', 'community', 'about', 'partners'].includes(page.name) && <Breadcrumbs />}
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
      <WhatsAppAssistantButton />
    </div>
  );
}

function Breadcrumbs() {
  const { page, navigate } = useNav();
  const labels: Record<string, string> = {
    professionals: 'Profissionais',
    'professional-detail': 'Perfil profissional',
    jobs: 'Vagas & Imóveis',
    'job-detail': 'Detalhes da oportunidade',
    'post-job': 'Publicar vaga',
    dashboard: 'Painel',
    'reset-password': 'Redefinir senha',
    learn: 'Para Aprender',
    tools: 'Ferramentas da Obra',
    community: 'Comunidade',
    about: 'Sobre Nós',
    partners: 'Lojas Parceiras',
  };
  const section = page.name === 'professional-detail' ? 'professionals'
    : page.name === 'job-detail' || page.name === 'post-job' ? 'jobs'
      : page.name;
  const sectionLabel = labels[section];
  const currentLabel = labels[page.name];
  const backPage = page.name === 'professional-detail' ? { name: 'professionals' as const }
    : page.name === 'job-detail' || page.name === 'post-job' ? { name: 'jobs' as const }
      : { name: 'home' as const };

  return (
    <nav aria-label="Caminho de navegação" className="border-b border-slate-100 bg-white">
      <ol className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs sm:px-6 lg:px-8">
        <li><button type="button" onClick={() => navigate(backPage)} className="inline-flex items-center gap-1 font-semibold text-[#D95D24] transition hover:text-[#C24E1B]">← Voltar</button></li>
        <li aria-hidden="true" className="mr-1 text-slate-300">|</li>
        <li><button type="button" onClick={() => navigate({ name: 'home' })} className="font-medium text-slate-500 hover:text-orange-600">Início</button></li>
        <li aria-hidden="true" className="text-slate-300">›</li>
        {section !== page.name && <><li><button type="button" onClick={() => navigate(section === 'professionals' ? { name: 'professionals' } : { name: 'jobs' })} className="font-medium text-slate-500 hover:text-orange-600">{sectionLabel}</button></li><li aria-hidden="true" className="text-slate-300">›</li></>}
        <li aria-current="page" className="font-semibold text-navy-800">{currentLabel}</li>
      </ol>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavProvider>
        <AppContent />
      </NavProvider>
    </AuthProvider>
  );
}
