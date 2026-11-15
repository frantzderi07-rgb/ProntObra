import { supabase, isSupabaseConfigured } from './supabase';
import { getLocalJobs, getLocalProfessionalById, getLocalProfessionals, getProfileExtras } from './localStore';
import type { Profile, PortfolioPhoto, Review, Job, Application, ProfessionalWithStats } from './types';

export async function fetchProfessionals(filters?: { specialty?: string; city?: string; state?: string }): Promise<ProfessionalWithStats[]> {
  const local = getLocalProfessionals(filters);
  if (!isSupabaseConfigured) return local;
  try {
    let query = supabase
    .from('profiles')
    .select('*, portfolio_photos(*), reviews(*)')
    .eq('user_type', 'professional')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters?.specialty && filters.specialty !== 'all') {
    query = query.eq('specialty', filters.specialty);
  }
    const city = filters?.city?.split(' - ')[0];
    if (city && city !== 'all') {
      query = query.eq('city', city);
    }
    if (filters?.state && filters.state !== 'all') query = query.eq('state', filters.state);

    const { data, error } = await query;
    if (error) throw error;

    const remote = (data ?? []).map((p) => {
      const reviews = (p.reviews as Review[]) ?? [];
      const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
      return {
        ...(p as Profile),
        ...getProfileExtras(p.id),
        portfolio_photos: (p.portfolio_photos as PortfolioPhoto[]) ?? [],
        reviews,
        avg_rating: reviews.length > 0 ? ratingSum / reviews.length : null,
        review_count: reviews.length,
      };
    });
    const byId = new Map([...remote, ...local].map((profile) => [profile.id, profile]));
    return [...byId.values()].filter((profile) =>
      !filters?.city || filters.city === 'all'
      || `${profile.city} - ${profile.state}`.toLocaleLowerCase().includes(filters.city.toLocaleLowerCase()),
    ).filter((profile) => !filters?.state || filters.state === 'all' || profile.state === filters.state);
  } catch (error) {
    console.warn('Não foi possível consultar profissionais online; exibindo dados locais:', error);
    return local;
  }
}

export async function fetchProfessionalById(id: string): Promise<ProfessionalWithStats | null> {
  const local = getLocalProfessionalById(id);
  if (local || !isSupabaseConfigured) return local;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, portfolio_photos(*), reviews(*)')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    const reviews = (data.reviews as Review[]) ?? [];
    const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    return {
      ...(data as Profile),
      ...getProfileExtras(data.id),
      portfolio_photos: (data.portfolio_photos as PortfolioPhoto[]) ?? [],
      reviews,
      avg_rating: reviews.length > 0 ? ratingSum / reviews.length : null,
      review_count: reviews.length,
    };
  } catch (error) {
    console.warn('Não foi possível carregar o profissional:', error);
    return null;
  }
}

export async function fetchJobs(filters?: { specialty?: string; city?: string; state?: string; status?: string }): Promise<Job[]> {
  const local = getLocalJobs().filter((job) =>
    (!filters?.specialty || filters.specialty === 'all' || job.specialty === filters.specialty)
    && (!filters?.city || filters.city === 'all' || `${job.city} - ${job.state}`.toLocaleLowerCase().includes(filters.city.toLocaleLowerCase()))
    && (!filters?.state || filters.state === 'all' || job.state === filters.state)
    && (filters?.status === 'all' || job.status === (filters?.status ?? 'open')),
  );
  if (!isSupabaseConfigured) return local;
  try {
    let query = supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.specialty && filters.specialty !== 'all') {
    query = query.eq('specialty', filters.specialty);
  }
    const city = filters?.city?.split(' - ')[0];
    if (city && city !== 'all') {
      query = query.eq('city', city);
  }
  if (filters?.state && filters.state !== 'all') query = query.eq('state', filters.state);
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'open');
  }

    const { data, error } = await query;
    if (error) throw error;
    const byId = new Map([...(data ?? []) as Job[], ...local].map((job) => [job.id, job]));
    return [...byId.values()].filter((job) =>
      !filters?.city || filters.city === 'all'
      || `${job.city} - ${job.state}`.toLocaleLowerCase().includes(filters.city.toLocaleLowerCase()),
    ).filter((job) => !filters?.state || filters.state === 'all' || job.state === filters.state);
  } catch (error) {
    console.warn('Não foi possível consultar vagas online; exibindo dados locais:', error);
    return local;
  }
}

export async function fetchJobById(id: string): Promise<Job | null> {
  const local = getLocalJobs().find((job) => job.id === id);
  if (local || !isSupabaseConfigured) return local ?? null;
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as Job;
}

export async function fetchApplicationsForJob(jobId: string): Promise<(Application & { professional: Profile })[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('applications')
    .select('*, professional:profiles!applications_professional_id(*)')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as (Application & { professional: Profile })[];
}

export async function fetchApplicationsByUser(userId: string): Promise<(Application & { job: Job })[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('applications')
    .select('*, job:jobs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as (Application & { job: Job })[];
}

export async function fetchJobsByUser(userId: string): Promise<Job[]> {
  const local = getLocalJobs(userId);
  if (!isSupabaseConfigured) return local;
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  const byId = new Map([...(data ?? []) as Job[], ...local].map((job) => [job.id, job]));
  return [...byId.values()];
}
