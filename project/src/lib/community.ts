const STORAGE_KEY = 'prontobra:community-posts';

export interface CommunityComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  specialty: string;
  title: string;
  city: string;
  state: string;
  description: string;
  photoUrl: string;
  videoUrl: string;
  createdAt: string;
  likedBy: string[];
  comments: CommunityComment[];
  isDemo?: boolean;
}

const demoPosts: CommunityPost[] = [
  {
    id: 'demo-eletrica-andradina',
    author: 'Carlos Oliveira',
    specialty: 'Eletricista',
    title: 'Reforma elétrica residencial concluída',
    city: 'Andradina',
    state: 'SP',
    description: 'Quadro revisado, circuitos identificados e novos pontos de iluminação instalados.',
    photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=960&q=80',
    videoUrl: '',
    createdAt: '2026-10-12T12:00:00.000Z',
    likedBy: [],
    comments: [],
    isDemo: true,
  },
  {
    id: 'demo-porcelanato-tres-lagoas',
    author: 'Mariana Santos',
    specialty: 'Azulejista',
    title: 'Acabamento em porcelanato',
    city: 'Três Lagoas',
    state: 'MS',
    description: 'Assentamento com paginação alinhada e atenção especial aos recortes e rejuntes.',
    photoUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=960&q=80',
    videoUrl: '',
    createdAt: '2026-10-10T12:00:00.000Z',
    likedBy: [],
    comments: [],
    isDemo: true,
  },
];

function readPosts(): CommunityPost[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const posts = JSON.parse(stored) as CommunityPost[];
      if (Array.isArray(posts)) return posts;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoPosts));
    return demoPosts;
  } catch (error) {
    console.warn('Não foi possível carregar o feed salvo neste dispositivo:', error);
    return demoPosts;
  }
}

function writePosts(posts: CommunityPost[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent('prontobra:community-changed'));
  } catch (error) {
    console.error('Não foi possível salvar o feed neste dispositivo:', error);
    throw new Error('Não foi possível salvar no armazenamento local. Verifique o espaço disponível no navegador.');
  }
}

export function getCommunityPosts(): CommunityPost[] {
  return readPosts().sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export function createCommunityPost(
  post: Omit<CommunityPost, 'id' | 'createdAt' | 'likedBy' | 'comments' | 'isDemo'>,
): CommunityPost {
  const created: CommunityPost = {
    ...post,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    likedBy: [],
    comments: [],
  };
  writePosts([created, ...readPosts()]);
  return created;
}

export function toggleCommunityLike(postId: string, visitorId: string): CommunityPost[] {
  const posts = readPosts().map((post) => {
    if (post.id !== postId) return post;
    const likedBy = post.likedBy.includes(visitorId)
      ? post.likedBy.filter((id) => id !== visitorId)
      : [...post.likedBy, visitorId];
    return { ...post, likedBy };
  });
  writePosts(posts);
  return posts;
}

export function addCommunityComment(postId: string, author: string, text: string): CommunityPost[] {
  const comment: CommunityComment = {
    id: crypto.randomUUID(),
    author,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  const posts = readPosts().map((post) =>
    post.id === postId ? { ...post, comments: [...post.comments, comment] } : post,
  );
  writePosts(posts);
  return posts;
}

export function getYoutubeEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase();
    let videoId = '';
    if (hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] ?? '';
    } else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
      videoId = url.searchParams.get('v') ?? url.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/)?.[1] ?? '';
    }
    return /^[\w-]{11}$/.test(videoId) ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}
