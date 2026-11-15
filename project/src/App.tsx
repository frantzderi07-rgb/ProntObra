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
        return <HomePage professionals={professionals} jobs={jobs} />;
      case 'professionals':
        return <ProfessionalsPage />;
      case 'professional-detail':
        return <ProfessionalDetailPage id={'id' in page ? page.id : ''} />;
      case 'jobs':
        return <JobsPage />;
      case 'job-detail':
        return <JobDetailPage id={'id' in page ? page.id : ''} />;
      case 'post-job':
        return <PostJobPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'learn':
        return <LearnPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage professionals={professionals} jobs={jobs} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
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
