import { useEffect, useState } from 'react';
import { CalendarDays, Heart, Image as ImageIcon, MessageCircle, Send, Video } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { BRAZIL_STATES } from '@/lib/types';
import { addCommunityComment, createCommunityPost, getCommunityPosts, getYoutubeEmbedUrl, toggleCommunityLike, type CommunityPost } from '@/lib/community';
import CitySelectorSpMs from './CitySelectorSpMs';
import AuthModal from './AuthModal';

const emptyForm = { title: '', city: '', state: '', description: '', photoUrl: '', videoUrl: '' };

export default function CommunityFeed() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const syncPosts = () => setPosts(getCommunityPosts());
    syncPosts();
    window.addEventListener('prontobra:community-changed', syncPosts);
    window.addEventListener('storage', syncPosts);
    return () => {
      window.removeEventListener('prontobra:community-changed', syncPosts);
      window.removeEventListener('storage', syncPosts);
    };
  }, []);

  const updatePosts = (next: CommunityPost[]) => setPosts([...next].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  const authorName = profile?.full_name || 'Profissional da comunidade';
  const visitorId = user?.id ?? 'prontobra-visitor';
  const canPublish = profile?.user_type === 'professional';

  const handlePublish = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!canPublish) {
      setAuthOpen(true);
      return;
    }
    if (!form.city.trim() || !form.state) {
      setError('Selecione uma cidade e um estado.');
      return;
    }
    if (form.videoUrl && !getYoutubeEmbedUrl(form.videoUrl)) {
      setError('Informe um link válido do YouTube ou YouTube Shorts.');
      return;
    }
    try {
      createCommunityPost({
        author: authorName,
        specialty: profile.specialty || 'Profissional da construção',
        title: form.title.trim(),
        city: form.city.split(' - ')[0],
        state: form.city.split(' - ')[1] || form.state,
        description: form.description.trim(),
        photoUrl: form.photoUrl.trim(),
        videoUrl: form.videoUrl.trim(),
      });
      setForm(emptyForm);
      setPosts(getCommunityPosts());
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Não foi possível publicar.');
    }
  };

  const handleComment = (postId: string) => {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;
    try {
      updatePosts(addCommunityComment(postId, authorName, text));
      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : 'Não foi possível comentar.');
    }
  };

  return (
    <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-600">Comunidade ProntObra</p>
            <h2 className="mt-2 section-title">Feed da obra</h2>
            <p className="mt-2 text-sm text-gray-600">Compartilhe serviços recentes, reconheça bons trabalhos e troque dicas com a comunidade.</p>
          </div>
          <span className="badge self-start bg-navy-50 text-navy-700 sm:self-auto"><CalendarDays size={14} /> Atualizado na hora</span>
        </div>

        {canPublish ? (
          <form onSubmit={handlePublish} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="font-display text-lg font-bold text-navy-900">Compartilhe um serviço recente</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-navy-700">Título do serviço
                <input required maxLength={90} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="input-field mt-1" placeholder="Ex.: Instalação elétrica concluída" />
              </label>
              <label className="text-sm font-medium text-navy-700">Estado (UF)
                <select required value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value, city: '' })} className="input-field mt-1">
                  <option value="">Selecione o estado</option>
                  {BRAZIL_STATES.map(([uf, name]) => <option key={uf} value={uf}>{name} ({uf})</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-navy-700">Cidade
                <CitySelectorSpMs value={form.city} onChange={(city) => setForm({ ...form, city })} stateFilter={form.state} required placeholder="Busque sua cidade..." />
              </label>
              <label className="text-sm font-medium text-navy-700">Foto (URL opcional)
                <span className="relative mt-1 block"><ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="url" value={form.photoUrl} onChange={(event) => setForm({ ...form, photoUrl: event.target.value })} className="input-field pl-9" placeholder="https://..." /></span>
              </label>
              <label className="text-sm font-medium text-navy-700 sm:col-span-2">Descrição curta
                <textarea required maxLength={350} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="input-field mt-1 resize-y" placeholder="Conte o que foi feito, materiais ou uma dica para a comunidade." />
              </label>
              <label className="text-sm font-medium text-navy-700 sm:col-span-2">Link de vídeo YouTube / Shorts (opcional)
                <span className="relative mt-1 block"><Video size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="url" value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} className="input-field pl-9" placeholder="https://youtube.com/shorts/..." /></span>
              </label>
            </div>
            {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button type="submit" className="btn-primary mt-4"><Send size={16} /> Publicar na comunidade</button>
          </form>
        ) : (
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-navy-900 p-5 text-white sm:flex-row sm:items-center sm:p-6">
            <div><h3 className="font-display font-bold">Mostre seu trabalho para todo o Brasil</h3><p className="mt-1 text-sm text-white/70">Crie um perfil profissional para publicar serviços no feed.</p></div>
            <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary shrink-0">Cadastrar como profissional</button>
          </div>
        )}

        {error && !canPublish && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {posts.map((post) => {
            const embedUrl = post.videoUrl ? getYoutubeEmbedUrl(post.videoUrl) : null;
            const isLiked = post.likedBy.includes(visitorId);
            return (
              <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-3 p-5 pb-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-orange-600">{post.specialty} · {post.city}/{post.state}</p>
                    <h3 className="mt-1 font-display text-lg font-bold text-navy-900">{post.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">Por {post.author}</p>
                  </div>
                  {post.isDemo && <span className="badge shrink-0 bg-slate-100 text-slate-600">Exemplo</span>}
                </div>
                <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">{post.description}</p>
                {embedUrl ? (
                  <div className="aspect-video bg-black"><iframe src={embedUrl} title={`Vídeo: ${post.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="h-full w-full border-0" /></div>
                ) : post.photoUrl ? (
                  <img src={post.photoUrl} alt={post.title} loading="lazy" className="max-h-80 w-full bg-slate-100 object-cover" />
                ) : null}
                <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-3">
                  <button type="button" aria-pressed={isLiked} onClick={() => updatePosts(toggleCommunityLike(post.id, visitorId))} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${isLiked ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} /> Obra Top <span>({post.likedBy.length})</span>
                  </button>
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500"><MessageCircle size={16} /> {post.comments.length} comentários</span>
                </div>
                <div className="space-y-2 border-t border-slate-100 px-5 py-3">
                  {post.comments.slice(-3).map((comment) => (
                    <p key={comment.id} className="text-xs text-gray-600"><strong className="text-navy-800">{comment.author}:</strong> {comment.text}</p>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={commentDrafts[post.id] ?? ''}
                      onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handleComment(post.id); } }}
                      maxLength={240}
                      placeholder="Escreva um comentário..."
                      aria-label={`Comentar em ${post.title}`}
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                    />
                    <button type="button" onClick={() => handleComment(post.id)} className="btn-outline !px-3 !py-2" aria-label="Enviar comentário"><Send size={15} /></button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" defaultUserType="professional" />
    </section>
  );
}
