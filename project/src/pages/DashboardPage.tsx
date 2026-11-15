import { useState, useEffect } from 'react';
import { User as UserIcon, Briefcase, FileText, Image as ImageIcon, Phone, MessageCircle, Plus, Trash2, Check, X, Clock, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNav } from '@/lib/nav';
import { supabase } from '@/lib/supabase';
import { fetchJobsByUser, fetchApplicationsForJob, fetchApplicationsByUser } from '@/lib/queries';
import { ALL_CITIES, SPECIALTIES, CONTRACT_TYPE_LABELS, APPLICATION_STATUS_LABELS } from '@/lib/types';
import type { Job, Application, Profile, PortfolioPhoto } from '@/lib/types';

const statusBadgeColors: Record<string, string> = {
  pending: 'bg-gold-50 text-gold-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

export default function DashboardPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { navigate } = useNav();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicationsByJob, setApplicationsByJob] = useState<Record<string, (Application & { professional: Profile })[]>>({});
  const [myApplications, setMyApplications] = useState<(Application & { job: Job })[]>([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState<PortfolioPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', specialty: '', city: '', experience_years: 0, phone: '', bio: '', service_radius: '', avatar_url: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'portfolio' | 'applications' | 'jobs'>('overview');

  const isProfessional = profile?.user_type === 'professional';
  const isCompany = profile?.user_type === 'company';

  useEffect(() => {
    if (!user || !profile) return;
    setLoading(true);

    if (isCompany) {
      fetchJobsByUser(user.id).then(async (userJobs) => {
        setJobs(userJobs);
        const appsMap: Record<string, (Application & { professional: Profile })[]> = {};
        for (const job of userJobs) {
          appsMap[job.id] = await fetchApplicationsForJob(job.id);
        }
        setApplicationsByJob(appsMap);
        setLoading(false);
      });
    } else if (isProfessional) {
      fetchApplicationsByUser(user.id).then((apps) => {
        setMyApplications(apps);
        setLoading(false);
      });
      if (profile.id) {
        supabase.from('portfolio_photos').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false })
          .then(({ data }) => setPortfolioPhotos((data as PortfolioPhoto[]) ?? []));
      }
    }

    if (profile) {
      setEditForm({
        full_name: profile.full_name,
        specialty: profile.specialty ?? '',
        city: profile.city,
        experience_years: profile.experience_years ?? 0,
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
        service_radius: profile.service_radius ?? '',
        avatar_url: profile.avatar_url ?? '',
      });
    }
  }, [user, profile, isCompany, isProfessional]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-gray-500">Você precisa estar logado para acessar o painel.</p>
        <button onClick={() => navigate({ name: 'home' })} className="btn-primary">Voltar ao início</button>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({
      full_name: editForm.full_name,
      specialty: editForm.specialty,
      city: editForm.city,
      experience_years: editForm.experience_years,
      phone: editForm.phone,
      bio: editForm.bio,
      service_radius: editForm.service_radius,
      avatar_url: editForm.avatar_url,
    }).eq('id', profile.id);
    setSavingProfile(false);
    if (!error) {
      setEditingProfile(false);
      await refreshProfile();
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhotoUrl || !profile) return;
    const { data } = await supabase.from('portfolio_photos').insert({
      profile_id: profile.id,
      image_url: newPhotoUrl,
      caption: newPhotoCaption || null,
    }).select().single();
    if (data) {
      setPortfolioPhotos((prev) => [data as PortfolioPhoto, ...prev]);
      setNewPhotoUrl('');
      setNewPhotoCaption('');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    await supabase.from('portfolio_photos').delete().eq('id', photoId);
    setPortfolioPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleUpdateApplicationStatus = async (appId: string, status: 'accepted' | 'rejected') => {
    await supabase.from('applications').update({ status }).eq('id', appId);
    if (isCompany) {
      const updated = await fetchJobsByUser(user.id);
      const appsMap: Record<string, (Application & { professional: Profile })[]> = {};
      for (const job of updated) {
        appsMap[job.id] = await fetchApplicationsForJob(job.id);
      }
      setJobs(updated);
      setApplicationsByJob(appsMap);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Deseja realmente excluir esta vaga?')) return;
    await supabase.from('jobs').delete().eq('id', jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const tabs = isProfessional
    ? [
        { id: 'overview' as const, label: 'Visão Geral', icon: UserIcon },
        { id: 'profile' as const, label: 'Meu Perfil', icon: FileText },
        { id: 'portfolio' as const, label: 'Portfólio', icon: ImageIcon },
        { id: 'applications' as const, label: 'Propostas Enviadas', icon: Briefcase },
      ]
    : [
        { id: 'overview' as const, label: 'Visão Geral', icon: UserIcon },
        { id: 'jobs' as const, label: 'Minhas Vagas', icon: Briefcase },
        { id: 'profile' as const, label: 'Dados da Empresa', icon: FileText },
      ];

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="bg-navy-900 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <img src={profile.avatar_url ?? ''} alt={profile.full_name} className="h-16 w-16 rounded-2xl border-2 border-white/20 object-cover bg-navy-700" />
            <div>
              <h1 className="font-display text-xl font-bold text-white">{profile.full_name}</h1>
              <p className="text-white/60 text-sm">
                {isProfessional ? `${profile.specialty} · ${profile.city}/${profile.state}` : 'Conta Empresarial'}
              </p>
            </div>
            <button onClick={signOut} className="ml-auto btn-ghost text-white hover:bg-white/10">
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-navy-700'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isProfessional ? (
                  <>
                    <StatCard icon={Briefcase} label="Propostas enviadas" value={myApplications.length} />
                    <StatCard icon={ImageIcon} label="Fotos no portfólio" value={portfolioPhotos.length} />
                    <StatCard icon={Check} label="Propostas aceitas" value={myApplications.filter((a) => a.status === 'accepted').length} />
                    <div className="card p-5 sm:col-span-2 lg:col-span-3">
                      <h3 className="font-display text-base font-bold text-navy-900">Ações rápidas</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => setActiveTab('profile')} className="btn-outline !text-xs">Editar perfil</button>
                        <button onClick={() => setActiveTab('portfolio')} className="btn-outline !text-xs">Adicionar fotos</button>
                        <button onClick={() => navigate({ name: 'jobs' })} className="btn-primary !text-xs">Buscar vagas</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <StatCard icon={Briefcase} label="Vagas publicadas" value={jobs.length} />
                    <StatCard icon={FileText} label="Total de candidaturas" value={Object.values(applicationsByJob).flat().length} />
                    <StatCard icon={Clock} label="Vagas abertas" value={jobs.filter((j) => j.status === 'open').length} />
                    <div className="card p-5 sm:col-span-2 lg:col-span-3">
                      <h3 className="font-display text-base font-bold text-navy-900">Ações rápidas</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => navigate({ name: 'post-job' })} className="btn-primary !text-xs"><Plus size={14} /> Publicar nova vaga</button>
                        <button onClick={() => setActiveTab('jobs')} className="btn-outline !text-xs">Gerenciar vagas</button>
                        <button onClick={() => navigate({ name: 'professionals' })} className="btn-outline !text-xs">Buscar profissionais</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PROFILE (edit) */}
            {activeTab === 'profile' && (
              <div className="card p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-navy-900">{isProfessional ? 'Editar Perfil' : 'Dados da Empresa'}</h2>
                  {!editingProfile && <button onClick={() => setEditingProfile(true)} className="btn-outline !text-xs">Editar</button>}
                </div>

                {editingProfile ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy-700">Nome</label>
                        <input className="input-field" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy-700">Telefone / WhatsApp</label>
                        <input className="input-field" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="(18) 99999-9999" />
                      </div>
                      {isProfessional && (
                        <>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-navy-700">Especialidade</label>
                            <select className="input-field" value={editForm.specialty} onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}>
                              {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-navy-700">Anos de experiência</label>
                            <input type="number" className="input-field" value={editForm.experience_years} onChange={(e) => setEditForm({ ...editForm, experience_years: parseInt(e.target.value) || 0 })} />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy-700">Cidade</label>
                        <select className="input-field" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}>
                          {ALL_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      {isProfessional && (
                        <div>
                          <label className="mb-1 block text-sm font-medium text-navy-700">Raio de atendimento</label>
                          <input className="input-field" value={editForm.service_radius} onChange={(e) => setEditForm({ ...editForm, service_radius: e.target.value })} placeholder="Ex: Até 60 km" />
                        </div>
                      )}
                    </div>
                    {isProfessional && (
                      <>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-navy-700">URL da foto de perfil</label>
                          <input className="input-field" value={editForm.avatar_url} onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })} placeholder="https://..." />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-navy-700">Bio / Descrição</label>
                          <textarea rows={4} className="input-field resize-none" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
                        </div>
                      </>
                    )}
                    <div className="flex gap-3">
                      <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary">{savingProfile ? 'Salvando...' : 'Salvar alterações'}</button>
                      <button onClick={() => setEditingProfile(false)} className="btn-outline">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <InfoRow label="Nome" value={profile.full_name} />
                    <InfoRow label="E-mail" value={profile.email ?? '—'} />
                    <InfoRow label="Telefone" value={profile.phone ?? '—'} />
                    <InfoRow label="Cidade" value={`${profile.city}/${profile.state}`} />
                    {isProfessional && (
                      <>
                        <InfoRow label="Especialidade" value={profile.specialty ?? '—'} />
                        <InfoRow label="Experiência" value={`${profile.experience_years ?? 0} anos`} />
                        <InfoRow label="Raio de atendimento" value={profile.service_radius ?? '—'} />
                      </>
                    )}
                    {profile.bio && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-gray-500">Bio</p>
                        <p className="mt-1 text-sm text-navy-700">{profile.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PORTFOLIO (professional only) */}
            {activeTab === 'portfolio' && isProfessional && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h2 className="font-display text-lg font-bold text-navy-900">Adicionar foto ao portfólio</h2>
                  <p className="mt-1 text-sm text-gray-500">Cole o link (URL) de uma foto de sua obra ou reforma.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input className="input-field" value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} placeholder="https://..." />
                    <input className="input-field" value={newPhotoCaption} onChange={(e) => setNewPhotoCaption(e.target.value)} placeholder="Legenda (ex: Reforma de cozinha)" />
                  </div>
                  <button onClick={handleAddPhoto} disabled={!newPhotoUrl} className="btn-primary mt-3">
                    <Plus size={16} /> Adicionar foto
                  </button>
                </div>

                <div className="card p-6">
                  <h2 className="font-display text-lg font-bold text-navy-900">Fotos do portfólio ({portfolioPhotos.length})</h2>
                  {portfolioPhotos.length === 0 ? (
                    <p className="mt-3 text-sm text-gray-400">Ainda não há fotos. Adicione fotos de suas obras para destacar seu trabalho.</p>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {portfolioPhotos.map((photo) => (
                        <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                          <img src={photo.image_url} alt={photo.caption ?? ''} className="h-full w-full object-cover" />
                          {photo.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <p className="text-[10px] text-white line-clamp-2">{photo.caption}</p>
                            </div>
                          )}
                          <button onClick={() => handleDeletePhoto(photo.id)} className="absolute right-2 top-2 rounded-lg bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* APPLICATIONS (professional: sent) */}
            {activeTab === 'applications' && isProfessional && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-bold text-navy-900">Propostas Enviadas</h2>
                {myApplications.length === 0 ? (
                  <div className="card p-8 text-center">
                    <Briefcase size={36} className="mx-auto text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">Você ainda não enviou propostas.</p>
                    <button onClick={() => navigate({ name: 'jobs' })} className="btn-primary mt-4">Buscar vagas</button>
                  </div>
                ) : (
                  myApplications.map((app) => (
                    <div key={app.id} className="card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <button onClick={() => navigate({ name: 'job-detail', id: app.job.id })} className="text-left">
                            <h3 className="font-display text-base font-bold text-navy-900 hover:text-orange-600">{app.job.title}</h3>
                          </button>
                          <p className="mt-0.5 text-xs text-gray-500">{app.job.company_name} · {app.job.city}/{app.job.state} · {CONTRACT_TYPE_LABELS[app.job.contract_type]}</p>
                          {app.message && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{app.message}</p>}
                          {app.proposed_value && <p className="mt-1 text-sm font-semibold text-navy-700">Valor proposto: {app.proposed_value}</p>}
                        </div>
                        <span className={`badge ${statusBadgeColors[app.status]}`}>{APPLICATION_STATUS_LABELS[app.status]}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* JOBS (company: manage) */}
            {activeTab === 'jobs' && isCompany && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-navy-900">Minhas Vagas</h2>
                  <button onClick={() => navigate({ name: 'post-job' })} className="btn-primary !text-xs"><Plus size={14} /> Nova vaga</button>
                </div>
                {jobs.length === 0 ? (
                  <div className="card p-8 text-center">
                    <Briefcase size={36} className="mx-auto text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">Você ainda não publicou vagas.</p>
                    <button onClick={() => navigate({ name: 'post-job' })} className="btn-primary mt-4">Publicar primeira vaga</button>
                  </div>
                ) : (
                  jobs.map((job) => {
                    const apps = applicationsByJob[job.id] ?? [];
                    return (
                      <div key={job.id} className="card p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <button onClick={() => navigate({ name: 'job-detail', id: job.id })} className="text-left">
                              <h3 className="font-display text-base font-bold text-navy-900 hover:text-orange-600">{job.title}</h3>
                            </button>
                            <p className="mt-0.5 text-xs text-gray-500">{job.specialty} · {job.city}/{job.state} · {CONTRACT_TYPE_LABELS[job.contract_type]}</p>
                            <span className={`badge mt-2 ${job.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {job.status === 'open' ? 'Aberta' : 'Encerrada'}
                            </span>
                          </div>
                          <button onClick={() => handleDeleteJob(job.id)} className="btn-ghost text-red-500 hover:bg-red-50">
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Applications for this job */}
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <p className="text-xs font-semibold text-navy-700">Candidaturas ({apps.length})</p>
                          {apps.length === 0 ? (
                            <p className="mt-2 text-sm text-gray-400">Nenhuma candidatura ainda.</p>
                          ) : (
                            <div className="mt-3 space-y-3">
                              {apps.map((app) => (
                                <div key={app.id} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                                  <img src={app.professional.avatar_url ?? ''} alt={app.professional.full_name} className="h-10 w-10 rounded-lg object-cover bg-gray-200" />
                                  <div className="flex-1 min-w-0">
                                    <button onClick={() => navigate({ name: 'professional-detail', id: app.professional.id })} className="text-sm font-semibold text-navy-900 hover:text-orange-600">
                                      {app.professional.full_name}
                                    </button>
                                    <p className="text-xs text-gray-500">{app.professional.specialty} · {app.professional.city}/{app.professional.state}</p>
                                    {app.message && <p className="mt-1 text-xs text-gray-600 line-clamp-2">{app.message}</p>}
                                    {app.proposed_value && <p className="mt-0.5 text-xs font-semibold text-navy-600">Proposta: {app.proposed_value}</p>}
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      {app.professional.phone && (
                                        <a href={`https://wa.me/55${app.professional.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="badge bg-green-50 text-green-700 hover:bg-green-100">
                                          <MessageCircle size={12} /> WhatsApp
                                        </a>
                                      )}
                                      <button onClick={() => navigate({ name: 'professional-detail', id: app.professional.id })} className="badge bg-navy-50 text-navy-700 hover:bg-navy-100">
                                        <FileText size={12} /> Ver perfil
                                      </button>
                                      {app.status === 'pending' && (
                                        <>
                                          <button onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')} className="badge bg-green-100 text-green-800 hover:bg-green-200">
                                            <Check size={12} /> Aceitar
                                          </button>
                                          <button onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')} className="badge bg-red-100 text-red-800 hover:bg-red-200">
                                            <X size={12} /> Recusar
                                          </button>
                                        </>
                                      )}
                                      {app.status !== 'pending' && (
                                        <span className={`badge ${statusBadgeColors[app.status]}`}>{APPLICATION_STATUS_LABELS[app.status]}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
          <Icon size={20} className="text-orange-600" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-navy-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-navy-700">{value}</p>
    </div>
  );
}
