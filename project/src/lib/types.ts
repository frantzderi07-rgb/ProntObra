export type UserType = 'professional' | 'company' | 'client';
export type WhatsAppUserCategory = 'professional' | 'empresa' | 'pessoa_fisica' | 'visitor';

export type ContractType = 'diaria' | 'empreitada' | 'clt';

export type JobStatus = 'open' | 'closed';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';
export type CommunityMediaType = 'image' | 'video';

export interface Profile {
  id: string;
  user_id: string | null;
  user_type: UserType;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  specialty: string | null;
  specialties?: string[];
  experience_years: number | null;
  city: string;
  state: string;
  service_radius: string | null;
  bio: string | null;
  is_featured: boolean;
  created_at: string;
  is_available?: boolean;
  certifications?: string[];
  company_cnpj?: string | null;
  whatsapp_number?: string | null;
  whatsapp_alerts_enabled?: boolean;
  whatsapp_feed_enabled?: boolean;
  whatsapp_recommendations_enabled?: boolean;
  tax_document_private?: string;
}

export interface PortfolioPhoto {
  id: string;
  profile_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  user_id: string | null;
  company_name: string;
  company_phone: string | null;
  title: string;
  description: string;
  specialty: string;
  city: string;
  state: string;
  contract_type: ContractType;
  deadline: string | null;
  status: JobStatus;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  professional_id: string;
  user_id: string | null;
  message: string | null;
  proposed_value: string | null;
  status: ApplicationStatus;
  created_at: string;
}

export interface Review {
  id: string;
  profile_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface CommunityPostRecord {
  id: string;
  user_id: string;
  author: string;
  specialty: string;
  title: string;
  city: string;
  state: string;
  description: string;
  media_url: string | null;
  media_type: CommunityMediaType | null;
  video_url: string | null;
  created_at: string;
}

export interface ProfessionalWithStats extends Profile {
  portfolio_photos: PortfolioPhoto[];
  reviews: Review[];
  avg_rating: number | null;
  review_count: number;
}

export const CITIES_SP = [
  'Andradina',
  'Castilho',
  'Murutinga do Sul',
  'Ilha Solteira',
  'Pereira Barreto',
  'Mirandópolis',
  'Nova Independência',
  'Sud Mennucci',
  'Guaraçaí',
  'Auriflama',
];

export const CITIES_MS = [
  'Três Lagoas',
  'Brasilândia',
  'Água Clara',
  'Selvíria',
  'Ribas do Rio Pardo',
];

export const ALL_CITIES = [...CITIES_SP, ...CITIES_MS].sort();

export const BRAZIL_STATES = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
] as const;

export const SPECIALTIES = [
  'Pedreiro',
  'Eletricista',
  'Encanador',
  'Pintor',
  'Mestre de Obras',
  'Arquiteto',
  'Engenheiro',
  'Gesseiro',
  'Reforma Geral',
  'Azulejista',
  'Marceneiro',
  'Serralheiro',
];

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  diaria: 'Diária',
  empreitada: 'Empreitada',
  clt: 'CLT',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Pendente',
  accepted: 'Aceita',
  rejected: 'Recusada',
};
