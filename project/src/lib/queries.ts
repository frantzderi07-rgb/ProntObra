import { supabase } from './supabase';
import type { Profile, PortfolioPhoto, Review, Job, Application, ProfessionalWithStats } from './types';

export async function fetchProfessionals(filters?: { specialty?: string; city?: string }): Promise<ProfessionalWithStats[]> {
  let query = supabase
    .from('profiles')
    .select('*, portfolio_photos(*), reviews(*)')
    .eq('user_type', 'professional')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters?.specialty && filters.specialty !== 'all') {
    query = query.eq('specialty', filters.specialty);
  }
  if (filters?.city && filters.city !== 'all') {
    query = query.eq('city', filters.city);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((p) => {
    const reviews = p.reviews as Review[];
    const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    return {
      ...(p as Profile),
      portfolio_photos: (p.portfolio_photos as PortfolioPhoto[]) ?? [],
      reviews,
      avg_rating: reviews.length > 0 ? ratingSum / reviews.length : null,
      review_count: reviews.length,
    };
  });
}

export async function fetchProfessionalById(id: string): Promise<ProfessionalWithStats | null> {
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
    portfolio_photos: (data.portfolio_photos as PortfolioPhoto[]) ?? [],
    reviews,
    avg_rating: reviews.length > 0 ? ratingSum / reviews.length : null,
    review_count: reviews.length,
  };
}

export async function fetchJobs(filters?: { specialty?: string; city?: string; status?: string }): Promise<Job[]> {
  let query = supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.specialty && filters.specialty !== 'all') {
    query = query.eq('specialty', filters.specialty);
  }
  if (filters?.city && filters.city !== 'all') {
    query = query.eq('city', filters.city);
  }
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'open');
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Job[];
}

export async function fetchJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as Job;
}

export async function fetchApplicationsForJob(jobId: string): Promise<(Application & { professional: Profile })[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*, professional:profiles!applications_professional_id(*)')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as (Application & { professional: Profile })[];
}

export async function fetchApplicationsByUser(userId: string): Promise<(Application & { job: Job })[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*, job:jobs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as (Application & { job: Job })[];
}

export async function fetchJobsByUser(userId: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Job[];
}
