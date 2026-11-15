import type { Job, PortfolioPhoto, Profile, ProfessionalWithStats } from './types';

const PROFILE_KEY = 'prontobra:profiles';
const JOB_KEY = 'prontobra:jobs';
const ACCOUNT_KEY = 'prontobra:accounts';
const ACTIVE_USER_KEY = 'prontobra:active-user';
const REACTION_KEY = 'prontobra:reactions';
const PROFILE_EXTRA_KEY = 'prontobra:profile-extras';

export interface LocalUser {
  id: string;
  email: string;
}

interface LocalAccount extends LocalUser {
  passwordHash: string;
}

function read<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('prontobra:data-changed'));
}

export function notifyDataChanged() {
  window.dispatchEvent(new CustomEvent('prontobra:data-changed'));
}

export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function createLocalAccount(
  email: string,
  password: string,
  profileData: Omit<Profile, 'id' | 'user_id' | 'created_at' | 'is_featured'>,
): Promise<{ user: LocalUser; profile: Profile }> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = read<LocalAccount[]>(ACCOUNT_KEY, []);
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error('Já existe uma conta com este e-mail.');
  }

  const user = { id: crypto.randomUUID(), email: normalizedEmail };
  const profile: Profile = {
    ...profileData,
    id: crypto.randomUUID(),
    user_id: user.id,
    email: normalizedEmail,
    created_at: new Date().toISOString(),
    is_featured: false,
    is_available: true,
    certifications: [],
  };
  write(ACCOUNT_KEY, [...accounts, { ...user, passwordHash: await hashPassword(password) }]);
  write(PROFILE_KEY, [...read<Profile[]>(PROFILE_KEY, []), profile]);
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  notifyDataChanged();
  return { user, profile };
}

export async function signInLocal(email: string, password: string): Promise<LocalUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = read<LocalAccount[]>(ACCOUNT_KEY, []);
  const account = accounts.find((item) => item.email === normalizedEmail);
  if (!account || account.passwordHash !== await hashPassword(password)) return null;
  const user = { id: account.id, email: account.email };
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  notifyDataChanged();
  return user;
}

export function getActiveLocalUser(): LocalUser | null {
  return read<LocalUser | null>(ACTIVE_USER_KEY, null);
}

export function clearActiveLocalUser() {
  localStorage.removeItem(ACTIVE_USER_KEY);
  notifyDataChanged();
}

export function getLocalProfile(userId: string): Profile | null {
  const profile = read<Profile[]>(PROFILE_KEY, []).find((item) => item.user_id === userId);
  return profile ? { ...profile, ...getProfileExtras(profile.id) } : null;
}

export function getProfileExtras(id: string): Partial<Profile> {
  return read<Record<string, Partial<Profile>>>(PROFILE_EXTRA_KEY, {})[id] ?? {};
}

export function saveProfileExtras(id: string, updates: Partial<Profile>) {
  const extras = read<Record<string, Partial<Profile>>>(PROFILE_EXTRA_KEY, {});
  extras[id] = { ...extras[id], ...updates };
  write(PROFILE_EXTRA_KEY, extras);
}

export function updateLocalProfile(id: string, updates: Partial<Profile>): Profile | null {
  const profiles = read<Profile[]>(PROFILE_KEY, []);
  const index = profiles.findIndex((profile) => profile.id === id);
  if (index < 0) {
    saveProfileExtras(id, updates);
    return null;
  }
  profiles[index] = { ...profiles[index], ...updates };
  write(PROFILE_KEY, profiles);
  return profiles[index];
}

export function addLocalPortfolioPhoto(profileId: string, imageUrl: string, caption: string): PortfolioPhoto {
  const profiles = read<Profile[]>(PROFILE_KEY, []);
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) throw new Error('Perfil profissional não encontrado.');
  const photo: PortfolioPhoto = {
    id: crypto.randomUUID(),
    profile_id: profileId,
    image_url: imageUrl,
    caption: caption || null,
    created_at: new Date().toISOString(),
  };
  const current = read<ProfessionalWithStats[]>(PROFILE_KEY, []);
  const updatedProfiles = current.map((item) =>
    item.id === profileId ? { ...item, portfolio_photos: [photo, ...(item.portfolio_photos ?? [])] } : item,
  );
  if (updatedProfiles.some((item) => item.id === profileId)) {
    write(PROFILE_KEY, updatedProfiles);
  } else {
    write(PROFILE_KEY, profiles.map((item) =>
      item.id === profileId ? { ...item, portfolio_photos: [photo] } : item,
    ));
  }
  return photo;
}

export function removeLocalPortfolioPhoto(profileId: string, photoId: string) {
  const profiles = read<Profile[]>(PROFILE_KEY, []);
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) return;
  const photos = (profile as Profile & { portfolio_photos?: PortfolioPhoto[] }).portfolio_photos ?? [];
  write(PROFILE_KEY, profiles.map((item) =>
    item.id === profileId ? { ...item, portfolio_photos: photos.filter((photo) => photo.id !== photoId) } : item,
  ));
}

export function saveLocalJob(job: Job) {
  write(JOB_KEY, [job, ...read<Job[]>(JOB_KEY, [])]);
}

export function getLocalJobs(userId?: string): Job[] {
  const jobs = read<Job[]>(JOB_KEY, []);
  return userId ? jobs.filter((job) => job.user_id === userId) : jobs;
}

export function getLocalProfessionals(filters?: { specialty?: string; city?: string; state?: string }): ProfessionalWithStats[] {
  const city = filters?.city?.trim().toLocaleLowerCase();
  return read<Profile[]>(PROFILE_KEY, [])
    .filter((profile) => profile.user_type === 'professional')
    .filter((profile) => !filters?.specialty || filters.specialty === 'all' || profile.specialty === filters.specialty)
    .filter((profile) => !filters?.state || filters.state === 'all' || profile.state === filters.state)
    .filter((profile) => !city || city === 'all' || `${profile.city} - ${profile.state}`.toLocaleLowerCase().includes(city))
    .map((profile) => ({
      ...profile,
      ...getProfileExtras(profile.id),
      portfolio_photos: ((profile as Profile & { portfolio_photos?: PortfolioPhoto[] }).portfolio_photos ?? []),
      reviews: [],
      avg_rating: null,
      review_count: 0,
    }));
}

export function getLocalProfessionalById(id: string): ProfessionalWithStats | null {
  return getLocalProfessionals().find((profile) => profile.id === id) ?? null;
}

export function savePhotoReaction(photoId: string, reaction: string) {
  const reactions = read<Record<string, string[]>>(REACTION_KEY, {});
  const selected = reactions[photoId] ?? [];
  reactions[photoId] = selected.includes(reaction)
    ? selected.filter((item) => item !== reaction)
    : [...selected, reaction];
  write(REACTION_KEY, reactions);
  return reactions[photoId];
}

export function getPhotoReactions(photoId: string): string[] {
  return read<Record<string, string[]>>(REACTION_KEY, {})[photoId] ?? [];
}
