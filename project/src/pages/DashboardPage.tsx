import { useState, useEffect } from 'react';
import { User as UserIcon, Briefcase, FileText, Image as ImageIcon, MessageCircle, Plus, Trash2, Check, X, Clock, Bot } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNav } from '@/lib/nav';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchJobsByUser, fetchApplicationsForJob, fetchApplicationsByUser } from '@/lib/queries';
import { BRAZIL_STATES, SPECIALTIES, CONTRACT_TYPE_LABELS, APPLICATION_STATUS_LABELS } from '@/lib/types';
import { addLocalPortfolioPhoto, getActiveLocalUser, removeLocalPortfolioPhoto, updateLocalProfile } from '@/lib/localStore';
import type { Job, Application, Profile, PortfolioPhoto } from '@/lib/types';
import CitySelectorSpMs from '@/components/CitySelectorSpMs';

const statusBadgeColors: Record<string, string> = {
  pending: 'bg-gold-50 text-gold-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Não foi possível ler a imagem.'));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

export default function DashboardPage() {
  const { user, profile, signOut, refreshProfile, updateEmail } = useAuth();
  const { navigate } = useNav();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicationsByJob, setApplicationsByJob] = useState<Record<string, (Application & { professional: Profile })[]>>({});
  const [myApplications, setMyApplications] = useState<(Application & { job: Job })[]>([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState<PortfolioPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', specialties: [] as string[], city: '', state: '', experience_years: 0, phone: '', bio: '', service_radius: '', avatar_url: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileAvatarFile, setProfileAvatarFile] = useState<File | null>(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'portfolio' | 'applications' | 'jobs'>('overview');
  const [newEmail, setNewEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [taxDocument, setTaxDocument] = useState('');
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  const [whatsappFeed, setWhatsappFeed] = useState(false);
  const [whatsappRecommendations, setWhatsappRecommendations] = useState(false);
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');

  const isProfessional = profile?.user_type === 'professional';
  const isCompany = profile?.user_type === 'company';

  useEffect(() => {
    if (!profileAvatarFile) {
      setProfileAvatarPreview('');
      return;
    }
    const preview = URL.createObjectURL(profileAvatarFile);
    setProfileAvatarPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [profileAvatarFile]);

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
      if (profile.id && isSupabaseConfigured) {
        supabase.from('portfolio_photos').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) console.error('Não foi possível carregar o portfólio:', error);
            else setPortfolioPhotos((data as PortfolioPhoto[]) ?? []);
          });
      } else {
        setPortfolioPhotos((profile as Profile & { portfolio_photos?: PortfolioPhoto[] }).portfolio_photos ?? []);
      }
    } else {
      setLoading(false);
    }

    if (profile) {
      setEditForm({
        full_name: profile.full_name,
        specialties: profile.specialties ?? (profile.specialty ? profile.specialty.split(', ') : []),
        city: profile.city,
        state: profile.state,
        experience_years: profile.experience_years ?? 0,
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
        service_radius: profile.service_radius ?? '',
        avatar_url: profile.avatar_url ?? '',
      });
      setWhatsappNumber(profile.whatsapp_number ?? profile.phone ?? '');
      setTaxDocument(profile.tax_document_private ?? '');
      setWhatsappAlerts(profile.whatsapp_alerts_enabled ?? false);
      setWhatsappFeed(profile.whatsapp_feed_enabled ?? false);
      setWhatsappRecommendations(profile.whatsapp_recommendations_enabled ?? false);
      if (isSupabaseConfigured && !getActiveLocalUser()) {
        void supabase.from('profile_private_data').select('tax_document').eq('user_id', user.id).maybeSingle()
          .then(({ data, error }) => {
            if (error) console.error('Não foi possível carregar o documento privado do perfil:', error);
            else setTaxDocument(data?.tax_document ?? '');
          });
      }
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
    let avatarUrl = editForm.avatar_url;
    if (profileAvatarFile) {
      if (isSupabaseConfigured && !getActiveLocalUser()) {
        const path = `${user.id}/${crypto.randomUUID()}-${profileAvatarFile.name.replace(/[^\w.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, profileAvatarFile, {
          contentType: profileAvatarFile.type,
          upsert: false,
        });
        if (uploadError) {
          setProfileMessage('Não foi possível enviar a foto. Confira o bucket "avatars" e tente novamente.');
          setSavingProfile(false);
          return;
        }
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
      } else {
        try {
          avatarUrl = await readImageAsDataUrl(profileAvatarFile);
        } catch (error) {
          setProfileMessage(error instanceof Error ? error.message : 'Não foi possível ler a imagem selecionada.');
          setSavingProfile(false);
          return;
        }
      }
    }
    const [city, cityState] = editForm.city.split(' - ');
    const updates = {
      full_name: editForm.full_name,
      specialty: editForm.specialties.join(', '),
      specialties: editForm.specialties,
      city,
      state: cityState || editForm.state,
      experience_years: editForm.experience_years,
      phone: editForm.phone,
      bio: editForm.bio,
      service_radius: editForm.service_radius,
      avatar_url: avatarUrl,
    };
    let savedRemotely = false;
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
        if (error) throw error;
        savedRemotely = true;
      } catch (error) {
        console.warn('Não foi possível salvar o perfil online; salvando neste dispositivo:', error);
      }
    }
    if (!savedRemotely) updateLocalProfile(profile.id, updates);
    setSavingProfile(false);
    setProfileAvatarFile(null);
    setProfileMessage(savedRemotely ? 'Perfil atualizado.' : 'Perfil salvo neste dispositivo.');
    setEditingProfile(false);
    await refreshProfile();
  };

  const handleAddPhoto = async () => {
    if (!newPhotoUrl || !profile) return;
    let photo: PortfolioPhoto | null = null;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('portfolio_photos').insert({
          profile_id: profile.id,
          image_url: newPhotoUrl,
          caption: newPhotoCaption || null,
        }).select().single();
        if (error) throw error;
        photo = data as PortfolioPhoto;
      } catch (error) {
        console.warn('Não foi possível salvar a foto online; salvando neste dispositivo:', error);
      }
    }
    if (!photo) photo = addLocalPortfolioPhoto(profile.id, newPhotoUrl, newPhotoCaption);
    setPortfolioPhotos((prev) => [photo as PortfolioPhoto, ...prev]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    await refreshProfile();
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('portfolio_photos').delete().eq('id', photoId);
      if (error) console.error('Não foi possível excluir a foto online:', error);
    } else {
      removeLocalPortfolioPhoto(profile.id, photoId);
    }
    setPortfolioPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const toggleAvailability = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update({ is_available: profile.is_available === false }).eq('id', profile.id);
      if (error) {
        setProfileMessage('Não foi possível atualizar sua disponibilidade. Tente novamente.');
        return;
      }
    }
    updateLocalProfile(profile.id, { is_available: profile.is_available === false });
    await refreshProfile();
  };

  const handleUpdateEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingEmail(true);
    setEmailMessage('');
    const { error, requiresConfirmation } = await updateEmail(newEmail);
    setSavingEmail(false);
    if (error) {
      setEmailMessage(error);
      return;
    }
    setEmailMessage(requiresConfirmation
      ? 'Enviamos um link de confirmação para o novo endereço. Confirme a alteração pelo e-mail recebido.'
      : 'E-mail atualizado com sucesso.');
    setNewEmail('');
  };

  const handleSwitchAccount = async () => {
    await signOut();
    navigate({ name: 'home' });
  };

  const handleSaveWhatsAppSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setWhatsappMessage('');
    const digits = whatsappNumber.replace(/\D/g, '');
    const nationalNumber = digits.startsWith('55') ? digits.slice(2) : digits;
    if (nationalNumber.length !== 10 && nationalNumber.length !== 11) {
      setWhatsappMessage('Informe um número brasileiro válido com DDD.');
      return;
    }
    const taxDigits = taxDocument.replace(/\D/g, '');
    if ((isProfessional || isCompany) && taxDigits && taxDigits.length !== 11 && taxDigits.length !== 14) {
      setWhatsappMessage('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos.');
      return;
    }
    const updates = {
      whatsapp_number: digits.startsWith('55') ? digits : `55${digits}`,
      whatsapp_alerts_enabled: isProfessional || isCompany ? whatsappAlerts : false,
      whatsapp_feed_enabled: isProfessional || isCompany ? whatsappFeed : false,
      whatsapp_recommendations_enabled: !isProfessional && !isCompany ? whatsappRecommendations : false,
    };
    setSavingWhatsApp(true);
    if (isSupabaseConfigured && !getActiveLocalUser()) {
      if (isProfessional || isCompany) {
        const { error: documentError } = await supabase.from('profile_private_data').upsert({
          user_id: user.id,
          tax_document: taxDigits || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        if (documentError) {
          setWhatsappMessage('Não foi possível salvar o CPF/CNPJ privado. Tente novamente.');
          setSavingWhatsApp(false);
          return;
        }
      }
      const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
      if (error) {
        setWhatsappMessage(error.code === '23505'
          ? 'Este número de WhatsApp já está vinculado a outra conta.'
          : 'Não foi possível salvar as preferências. Confira as migrations e tente novamente.');
        setSavingWhatsApp(false);
        return;
      }
    } else {
      updateLocalProfile(profile.id, { ...updates, tax_document_private: taxDigits || undefined });
    }
    await refreshProfile();
    setWhatsappMessage('Preferências de WhatsApp salvas.');
    setSavingWhatsApp(false);
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
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.full_name} className="h-16 w-16 rounded-2xl border-2 border-white/20 object-cover bg-navy-700" />
              : <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/20 bg-navy-700 text-xl font-bold text-white">{profile.full_name.slice(0, 1).toUpperCase()}</div>}
            <div>
              <h1 className="font-display text-xl font-bold text-white">{profile.full_name}</h1>
              <p className="text-white/60 text-sm">
                {isProfessional ? `${profile.specialty} · ${profile.city}/${profile.state}` : profile.user_type === 'company' ? 'Conta Empresarial' : 'Conta de Cliente'}
              </p>
            </div>
            {isProfessional && (
              <button
                type="button"
                onClick={() => void toggleAvailability()}
                className={`ml-auto rounded-xl px-3 py-2 text-xs font-semibold transition ${profile.is_available === false ? 'bg-white/10 text-white' : 'bg-green-500/20 text-green-200'}`}
              >
                {profile.is_available === false ? 'Agenda ocupada · Ativar disponibilidade' : 'Disponível Agora · Agenda Livre'}
              </button>
            )}
            <div className="flex shrink-0 gap-2">
              <button onClick={() => void handleSwitchAccount()} className="btn-ghost text-sm text-white hover:bg-white/10">Entrar com outra conta</button>
              <button onClick={() => void signOut()} className="btn-ghost text-white hover:bg-white/10">Sair</button>
            </div>
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
              <div className="space-y-5">
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
              <section className="card p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700"><Bot size={22} /></span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-navy-900">WhatsApp &amp; Automação IA</h2>
                    <p className="mt-1 text-sm text-gray-500">Valide seu número e escolha quais mensagens deseja receber da ProntObra.</p>
                  </div>
                </div>
                <form onSubmit={(event) => void handleSaveWhatsAppSettings(event)} className="mt-5 space-y-4">
                  <label className="block text-sm font-medium text-navy-700">Número de WhatsApp
                    <input type="tel" required inputMode="tel" autoComplete="tel" value={whatsappNumber} onChange={(event) => setWhatsappNumber(event.target.value)} placeholder="(11) 99999-9999" className="input-field mt-1.5 max-w-md" />
                  </label>
                  {(isProfessional || isCompany) && <label className="block text-sm font-medium text-navy-700">CPF/CNPJ para orçamentos (opcional)
                    <input type="text" inputMode="numeric" value={taxDocument} onChange={(event) => setTaxDocument(event.target.value.replace(/\D/g, '').slice(0, 14))} placeholder="Somente números" className="input-field mt-1.5 max-w-md" />
                    <span className="mt-1 block text-xs font-normal text-gray-500">Armazenado em tabela privada e usado apenas nos seus PDFs de orçamento.</span>
                  </label>}
                  <div className="space-y-3">
                    {(isProfessional || isCompany) ? (
                      <>
                        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                          <span><span className="block text-sm font-semibold text-navy-800">{isProfessional ? 'Receber alertas de clientes na minha cidade' : 'Receber alertas de pedidos e obras na minha região'}</span><span className="text-xs text-gray-500">Enviaremos avisos relacionados à sua cidade e especialidades.</span></span>
                          <button type="button" role="switch" aria-checked={whatsappAlerts} aria-label="Receber alertas do WhatsApp" onClick={() => setWhatsappAlerts((enabled) => !enabled)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${whatsappAlerts ? 'bg-orange-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${whatsappAlerts ? 'left-5' : 'left-0.5'}`} /></button>
                        </label>
                        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                          <span><span className="block text-sm font-semibold text-navy-800">Publicar fotos/vídeos no feed enviando direto pelo WhatsApp</span><span className="text-xs text-gray-500">Publicações só serão feitas quando você enviar a mídia e solicitar a publicação.</span></span>
                          <button type="button" role="switch" aria-checked={whatsappFeed} aria-label="Permitir publicação de mídia no feed pelo WhatsApp" onClick={() => setWhatsappFeed((enabled) => !enabled)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${whatsappFeed ? 'bg-orange-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${whatsappFeed ? 'left-5' : 'left-0.5'}`} /></button>
                        </label>
                      </>
                    ) : (
                      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                        <span><span className="block text-sm font-semibold text-navy-800">Receber recomendações de profissionais/empresas e status de orçamentos no WhatsApp</span><span className="text-xs text-gray-500">Você pode revogar esta autorização a qualquer momento.</span></span>
                        <button type="button" role="switch" aria-checked={whatsappRecommendations} aria-label="Receber recomendações pelo WhatsApp" onClick={() => setWhatsappRecommendations((enabled) => !enabled)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${whatsappRecommendations ? 'bg-orange-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${whatsappRecommendations ? 'left-5' : 'left-0.5'}`} /></button>
                      </label>
                    )}
                  </div>
                  {whatsappMessage && <p role="status" className={`rounded-lg p-3 text-sm ${whatsappMessage.startsWith('Não') || whatsappMessage.startsWith('Informe') || whatsappMessage.startsWith('Este número') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}>{whatsappMessage}</p>}
                  <button type="submit" disabled={savingWhatsApp} className="btn-primary">{savingWhatsApp ? 'Salvando...' : 'Salvar preferências de WhatsApp'}</button>
                </form>
              </section>
              </div>
            )}

            {/* PROFILE (edit) */}
            {activeTab === 'profile' && (
              <div className="card p-6 sm:p-8">
                {profileMessage && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{profileMessage}</p>}
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
                            <label className="mb-2 block text-sm font-medium text-navy-700">Especialidades <span className="font-normal text-gray-500">(até 3)</span></label>
                            <div className="flex flex-wrap gap-2">
                              {SPECIALTIES.map((specialty) => {
                                const selected = editForm.specialties.includes(specialty);
                                return <button key={specialty} type="button" aria-pressed={selected}
                                  onClick={() => setEditForm((prev) => ({ ...prev, specialties: selected
                                    ? prev.specialties.filter((item) => item !== specialty)
                                    : prev.specialties.length < 3 ? [...prev.specialties, specialty] : prev.specialties }))}
                                  className={`rounded-full border px-3 py-1.5 text-sm ${selected ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200 text-gray-600'}`}>{specialty}</button>;
                              })}
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-navy-700">Anos de experiência</label>
                            <input type="number" className="input-field" value={editForm.experience_years} onChange={(e) => setEditForm({ ...editForm, experience_years: parseInt(e.target.value) || 0 })} />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy-700">Cidade</label>
                        <CitySelectorSpMs
                          value={editForm.city}
                          onChange={(location) => {
                            const [, state] = location.split(' - ');
                            setEditForm((prev) => ({ ...prev, city: location, state: state || prev.state }));
                          }}
                          stateFilter={editForm.state}
                          placeholder="Busque sua cidade..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy-700">Estado (UF)</label>
                        <select className="input-field" value={editForm.state} onChange={(e) => setEditForm((prev) => ({ ...prev, state: e.target.value, city: '' }))}>
                          <option value="">Selecione o estado</option>
                          {BRAZIL_STATES.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
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
                          <label className="mt-3 block text-sm font-medium text-navy-700">Ou envie uma foto
                            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              if (file && (file.size > 10 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type))) {
                                setProfileMessage('Use uma imagem JPG, PNG, WebP ou GIF de até 10 MB.');
                                event.target.value = '';
                                return;
                              }
                              setProfileAvatarFile(file);
                              setProfileMessage('');
                            }} className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:font-semibold file:text-orange-700" />
                          </label>
                          {profileAvatarPreview && <img src={profileAvatarPreview} alt="Prévia da nova foto de perfil" className="mt-3 h-20 w-20 rounded-full object-cover" />}
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
                        <InfoRow label="Especialidades" value={profile.specialties?.join(', ') || profile.specialty || '—'} />
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
                    <div className="mt-8 border-t border-gray-100 pt-6">
                      <h3 className="font-display text-base font-bold text-navy-900">E-mail da conta</h3>
                      <p className="mt-1 text-sm text-gray-500">Altere o endereço principal usado para entrar na ProntObra.</p>
                      {emailMessage && <p role="status" className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{emailMessage}</p>}
                      <form onSubmit={(event) => void handleUpdateEmail(event)} className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <input type="email" required value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder={user.email} className="input-field flex-1" aria-label="Novo e-mail" />
                        <button type="submit" disabled={savingEmail || !newEmail.trim()} className="btn-primary shrink-0">
                          {savingEmail ? 'Enviando...' : 'Alterar e-mail cadastrado'}
                        </button>
                      </form>
                    </div>
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
