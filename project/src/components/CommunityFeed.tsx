import { useEffect, useState } from 'react';
import { CalendarDays, Heart, Image as ImageIcon, MessageCircle, Send, Video, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { BRAZIL_STATES, type CommunityMediaType, type CommunityPostRecord } from '@/lib/types';
import { addCommunityComment, cacheCommunityPosts, createCommunityPost, getCommunityPosts, getYoutubeEmbedUrl, toggleCommunityLike, type CommunityPost } from '@/lib/community';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import CitySelectorSpMs from './CitySelectorSpMs';
import AuthModal from './AuthModal';

const emptyForm = { title: '', city: '', state: '', description: '', photoUrl: '', videoUrl: '' };
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

function isVideoMedia(mediaUrl: string, mediaType?: CommunityMediaType) {
  return mediaType === 'video' || /\.(mp4|webm|mov)(?:$|[?#])/i.test(mediaUrl);
}

export default function CommunityFeed() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const syncPosts = async () => {
      if (!isSupabaseConfigured) {
        setPosts(getCommunityPosts());
        return;
      }
      const { data, error: loadError } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false });
      if (loadError) {
        console.error('Não foi possível carregar as publicações da comunidade:', loadError);
        setError('Não foi possível carregar as publicações do servidor. Exibindo o conteúdo salvo neste dispositivo.');
        setPosts(getCommunityPosts());
        return;
      }
      const remotePosts = ((data ?? []) as CommunityPostRecord[]).map((post): CommunityPost => ({
        id: post.id,
        author: post.author,
        specialty: post.specialty,
        title: post.title,
        city: post.city,
        state: post.state,
        description: post.description,
        photoUrl: post.media_type === 'image' ? post.media_url ?? '' : '',
        videoUrl: post.video_url ?? '',
        mediaUrl: post.media_url ?? undefined,
        mediaType: post.media_type ?? undefined,
        createdAt: post.created_at,
        likedBy: [],
        comments: [],
      }));
      if (!active) return;
      try {
        cacheCommunityPosts([...getCommunityPosts(), ...remotePosts]);
        setPosts(getCommunityPosts());
      } catch (cacheError) {
        setError(cacheError instanceof Error ? cacheError.message : 'Não foi possível atualizar o feed local.');
        setPosts([...getCommunityPosts(), ...remotePosts]);
      }
    };
    void syncPosts();
    window.addEventListener('prontobra:community-changed', syncPosts);
    window.addEventListener('storage', syncPosts);
    return () => {
      active = false;
      window.removeEventListener('prontobra:community-changed', syncPosts);
      window.removeEventListener('storage', syncPosts);
    };
  }, []);

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreview('');
      return;
    }
    const preview = URL.createObjectURL(mediaFile);
    setMediaPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [mediaFile]);

  const updatePosts = (next: CommunityPost[]) => setPosts([...next].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  const authorName = profile?.full_name || 'Profissional da comunidade';
  const visitorId = user?.id ?? 'prontobra-visitor';
  const canPublish = profile?.user_type === 'professional';

  const handlePublish = async (event: React.FormEvent) => {
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
    if (mediaFile?.type.startsWith('video/') && mediaFile.size > MAX_VIDEO_SIZE) {
      setError('O vídeo deve ter no máximo 50 MB. Selecione um arquivo menor.');
      return;
    }
    if (mediaFile?.type.startsWith('image/') && mediaFile.size > MAX_IMAGE_SIZE) {
      setError('A imagem deve ter no máximo 10 MB. Selecione um arquivo menor.');
      return;
    }
    if (mediaFile && !mediaFile.type.startsWith('image/') && !['video/mp4', 'video/webm', 'video/quicktime'].includes(mediaFile.type)) {
      setError('Formato não suportado. Envie uma imagem ou vídeo MP4, WebM ou MOV.');
      return;
    }
    setPublishing(true);
    try {
      let mediaUrl = '';
      let mediaType: CommunityMediaType | undefined;
      let storagePath = '';
      if (mediaFile) {
        if (!isSupabaseConfigured || !user) {
          setError('Configure o Supabase e entre na sua conta para enviar fotos e vídeos.');
          return;
        }
        mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image';
        const safeName = mediaFile.name.replace(/[^\w.-]/g, '_');
        storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from('posts').upload(storagePath, mediaFile, {
          contentType: mediaFile.type,
          upsert: false,
        });
        if (uploadError) throw new Error(`Não foi possível enviar a mídia. Confira o bucket "posts" e as políticas de upload. (${uploadError.message})`);
        mediaUrl = supabase.storage.from('posts').getPublicUrl(storagePath).data.publicUrl;
      }
      const postDetails = {
        author: authorName,
        specialty: profile.specialty || 'Profissional da construção',
        title: form.title.trim(),
        city: form.city.split(' - ')[0],
        state: form.city.split(' - ')[1] || form.state,
        description: form.description.trim(),
        photoUrl: form.photoUrl.trim(),
        videoUrl: form.videoUrl.trim(),
        mediaUrl: mediaUrl || undefined,
        mediaType,
      };
      if (isSupabaseConfigured) {
        if (!user) throw new Error('Entre na sua conta para publicar no feed.');
        const [city, cityState] = form.city.split(' - ');
        const { data, error: insertError } = await supabase.from('community_posts').insert({
          user_id: user.id,
          profile_id: profile?.id ?? null,
          author: postDetails.author,
          specialty: postDetails.specialty,
          title: postDetails.title,
          city: city?.trim() || form.city.trim(),
          state: cityState || form.state,
          description: postDetails.description,
          media_url: mediaUrl || (postDetails.photoUrl || null),
          media_type: mediaType || (postDetails.photoUrl ? 'image' : null),
          video_url: postDetails.videoUrl || null,
        }).select('*').single();
        if (insertError) {
          if (storagePath) await supabase.storage.from('posts').remove([storagePath]);
          throw new Error(`Não foi possível salvar a publicação: ${insertError.message}`);
        }
        const saved = data as CommunityPostRecord;
        const created: CommunityPost = {
          ...postDetails,
          id: saved.id,
          city: saved.city,
          state: saved.state,
          createdAt: saved.created_at,
          likedBy: [],
          comments: [],
        };
        cacheCommunityPosts([...getCommunityPosts(), created]);
      } else {
        createCommunityPost(postDetails);
      }
      setForm(emptyForm);
      setMediaFile(null);
      setPosts(getCommunityPosts());
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Não foi possível publicar.');
    } finally {
      setPublishing(false);
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
              <label className="text-sm font-medium text-navy-700">Enviar foto ou vídeo
                <input type="file" accept="image/*, video/mp4, video/webm, video/quicktime" onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (file?.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE) {
                    setMediaFile(null);
                    setError('O vídeo deve ter no máximo 50 MB. Selecione um arquivo menor.');
                    event.target.value = '';
                    return;
                  }
                  if (file?.type.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
                    setMediaFile(null);
                    setError('A imagem deve ter no máximo 10 MB. Selecione um arquivo menor.');
                    event.target.value = '';
                    return;
                  }
                  setError('');
                  setMediaFile(file);
                }} className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:font-semibold file:text-orange-700" />
                <span className="mt-1 block text-xs font-normal text-gray-500">Imagens até 10 MB · vídeos MP4, WebM ou MOV até 50 MB.</span>
              </label>
              {mediaPreview && <div className="overflow-hidden rounded-xl border border-slate-200 sm:col-span-2">
                {mediaFile?.type.startsWith('video/')
                  ? <video src={mediaPreview} controls playsInline className="max-h-64 w-full bg-black object-contain" />
                  : <img src={mediaPreview} alt="Prévia da mídia selecionada" className="max-h-64 w-full object-contain" />}
              </div>}
              <label className="text-sm font-medium text-navy-700 sm:col-span-2">Descrição curta
                <textarea required maxLength={350} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="input-field mt-1 resize-y" placeholder="Conte o que foi feito, materiais ou uma dica para a comunidade." />
              </label>
              <label className="text-sm font-medium text-navy-700 sm:col-span-2">Link de vídeo YouTube / Shorts (opcional)
                <span className="relative mt-1 block"><Video size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="url" value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} className="input-field pl-9" placeholder="https://youtube.com/shorts/..." /></span>
              </label>
            </div>
            {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={publishing} className="btn-primary mt-4">
              {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Publicar na comunidade
            </button>
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
            const mediaUrl = post.mediaUrl || post.photoUrl;
            const directVideo = isVideoMedia(mediaUrl, post.mediaType);
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
                {directVideo ? (
                  <video src={mediaUrl} controls playsInline className="h-64 w-full rounded-t-lg bg-black object-cover" />
                ) : embedUrl ? (
                  <div className="aspect-video bg-black"><iframe src={embedUrl} title={`Vídeo: ${post.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="h-full w-full border-0" /></div>
                ) : mediaUrl ? (
                  <img src={mediaUrl} alt={post.title} loading="lazy" className="max-h-80 w-full bg-slate-100 object-cover" />
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
