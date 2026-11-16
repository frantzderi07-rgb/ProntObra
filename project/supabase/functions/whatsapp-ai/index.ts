const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, x-hub-signature-256, x-api-key, client-token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

type JsonRecord = Record<string, unknown>;
type Category = 'professional' | 'empresa' | 'pessoa_fisica' | 'visitor';
type Provider = 'meta' | 'evolution' | 'zapi';

interface IncomingMessage {
  id: string;
  from: string;
  text: string;
  mediaType?: 'audio' | 'image' | 'video';
  mediaId?: string;
  mediaUrl?: string;
  mediaBase64?: string;
  mimeType?: string;
  mediaCaption?: string;
}

async function claimAlert(messageId: string, recipient: string) {
  const inserted = await dbRequest('whatsapp_ai_alerts?on_conflict=provider_message_id,recipient_number', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
    body: JSON.stringify({ provider_message_id: messageId, recipient_number: whatsappRecipient(recipient) }),
  }) as unknown[];
  return inserted.length > 0;
}

interface ProfileRow extends JsonRecord {
  id: string;
  user_id: string;
  user_type: string;
  full_name: string;
  city: string;
  state: string;
  specialty: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  whatsapp_alerts_enabled: boolean;
  whatsapp_feed_enabled: boolean;
  whatsapp_recommendations_enabled: boolean;
  is_available: boolean;
}

const record = (value: unknown): JsonRecord => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
const text = (value: unknown): string => typeof value === 'string' ? value : '';
const normalizePhone = (value: string) => value.replace(/\D/g, '');
const whatsappRecipient = (value: string) => {
  const digits = normalizePhone(value);
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function equalConstantTime(first: string, second: string) {
  if (first.length !== second.length) return false;
  let mismatch = 0;
  for (let index = 0; index < first.length; index += 1) mismatch |= first.charCodeAt(index) ^ second.charCodeAt(index);
  return mismatch === 0;
}

async function verifyMetaSignature(rawBody: string, signature: string) {
  const secret = requiredEnv('META_APP_SECRET');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody)));
  const expected = `sha256=${Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  return equalConstantTime(expected, signature);
}

async function readBodyLimited(request: Request, maximumBytes: number) {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > maximumBytes) throw new Error('Webhook body exceeds the allowed size.');
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maximumBytes) {
      await reader.cancel();
      throw new Error('Webhook body exceeds the allowed size.');
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function extractIncoming(payload: JsonRecord): IncomingMessage | null {
  const firstEntry = record((payload.entry as unknown[] | undefined)?.[0]);
  const firstChange = record((firstEntry.changes as unknown[] | undefined)?.[0]);
  const value = record(firstChange.value);
  const metaMessage = record((value.messages as unknown[] | undefined)?.[0]);
  if (Object.keys(metaMessage).length) {
    const type = text(metaMessage.type);
    const media = record(metaMessage[type]);
    const messageText = record(metaMessage.text);
    return {
      id: text(metaMessage.id),
      from: normalizePhone(text(metaMessage.from)),
      text: text(messageText.body) || text(media.caption),
      mediaType: type === 'audio' || type === 'image' || type === 'video' ? type : undefined,
      mediaId: text(media.id) || undefined,
      mediaUrl: text(media.url) || undefined,
      mimeType: text(media.mime_type) || undefined,
      mediaCaption: text(media.caption) || undefined,
    };
  }

  const data = record(payload.data);
  const key = record(data.key);
  const message = record(data.message);
  const messageType = text(data.messageType).toLowerCase();
  const audio = record(message.audioMessage);
  const image = record(message.imageMessage);
  const video = record(message.videoMessage);
  const zapiAudio = record(payload.audio);
  const zapiImage = record(payload.image);
  const zapiVideo = record(payload.video);
  const extended = record(message.extendedTextMessage);
  const caption = text(image.caption) || text(video.caption) || text(audio.caption)
    || text(zapiImage.caption) || text(zapiVideo.caption) || text(payload.caption);
  const mediaObject = messageType.includes('audio') ? audio : messageType.includes('video') ? video : messageType.includes('image') ? image : {};
  const rawFrom = text(key.remoteJid) || text(payload.phone) || text(payload.from) || text(record(payload.sender).id);
  const from = normalizePhone(rawFrom.split('@')[0]);
  const messageText = text(message.conversation) || text(extended.text) || text(record(payload.text).message)
    || text(payload.text) || text(payload.body) || caption;
  const inferredType = messageType.includes('audio') || Object.keys(audio).length || Object.keys(zapiAudio).length || text(payload.audioUrl) ? 'audio'
    : messageType.includes('video') || Object.keys(video).length || Object.keys(zapiVideo).length || text(payload.videoUrl) ? 'video'
      : messageType.includes('image') || Object.keys(image).length || Object.keys(zapiImage).length || text(payload.imageUrl) ? 'image' : undefined;
  if (!from || (!messageText && !inferredType)) return null;
  return {
    id: text(key.id) || text(payload.messageId) || text(payload.id) || crypto.randomUUID(),
    from,
    text: messageText,
    mediaType: inferredType,
    mediaId: text(mediaObject.id) || undefined,
    mediaUrl: text(mediaObject.url) || text(zapiAudio.audioUrl) || text(zapiImage.imageUrl) || text(zapiVideo.videoUrl)
      || text(payload.audioUrl) || text(payload.imageUrl) || text(payload.videoUrl) || undefined,
    mediaBase64: text(mediaObject.base64) || text(payload.mediaBase64) || undefined,
    mimeType: text(mediaObject.mimetype) || text(mediaObject.mimeType) || text(zapiAudio.mimeType)
      || text(zapiImage.mimeType) || text(zapiVideo.mimeType) || text(payload.mimeType) || undefined,
    mediaCaption: caption || undefined,
  };
}

const supabaseUrl = () => requiredEnv('SUPABASE_URL').replace(/\/$/, '');
const serviceKey = () => requiredEnv('SUPABASE_SERVICE_ROLE_KEY');

async function dbRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey(),
      Authorization: `Bearer ${serviceKey()}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const responseText = await response.text();
  if (!response.ok) throw new Error(`Supabase request failed (${response.status}): ${responseText.slice(0, 400)}`);
  return responseText ? JSON.parse(responseText) as unknown : null;
}

async function findProfile(phone: string): Promise<ProfileRow | null> {
  const lastTen = phone.slice(-10);
  const params = new URLSearchParams({
    select: '*',
    or: `(whatsapp_number.eq.${phone},phone.ilike.*${lastTen}*)`,
    limit: '1',
  });
  const result = await dbRequest(`profiles?${params.toString()}`) as ProfileRow[];
  return result[0] ?? null;
}

function categoryOf(profile: ProfileRow | null): Category {
  if (!profile) return 'visitor';
  if (profile.user_type === 'company') return 'empresa';
  if (profile.user_type === 'professional') return 'professional';
  return 'pessoa_fisica';
}

async function consumeRateLimit(phone: string) {
  const result = await dbRequest('rpc/consume_whatsapp_rate_limit', {
    method: 'POST',
    body: JSON.stringify({ p_sender_number: phone, p_limit: 20, p_window_seconds: 60 }),
  });
  return result === true;
}

async function sendWhatsAppMessage(to: string, message: string) {
  to = whatsappRecipient(to);
  const provider = (Deno.env.get('WHATSAPP_PROVIDER') ?? 'evolution') as Provider;
  const baseUrl = requiredEnv('WHATSAPP_API_URL').replace(/\/$/, '');
  const token = requiredEnv('WHATSAPP_TOKEN');
  let url = '';
  let headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let body: JsonRecord;
  if (provider === 'meta') {
    const phoneNumberId = requiredEnv('WHATSAPP_PHONE_NUMBER_ID');
    url = `${baseUrl}/${phoneNumberId}/messages`;
    headers.Authorization = `Bearer ${token}`;
    body = { messaging_product: 'whatsapp', to, type: 'text', text: { body: message } };
  } else if (provider === 'zapi') {
    url = `${baseUrl}/send-text`;
    headers['Client-Token'] = Deno.env.get('WHATSAPP_CLIENT_TOKEN') ?? token;
    body = { phone: to, message };
  } else {
    const instance = requiredEnv('WHATSAPP_INSTANCE');
    url = `${baseUrl}/message/sendText/${encodeURIComponent(instance)}`;
    headers.apikey = token;
    body = { number: to, text: message };
  }
  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`WhatsApp provider returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
}

function escapeFilter(value: string) {
  return value.trim().replace(/[^\p{L}\p{N}\s-]/gu, '').slice(0, 80);
}

async function searchProfessionals(city: string, state: string, specialty: string) {
  const params = new URLSearchParams({
    select: 'id,user_id,user_type,full_name,city,state,specialty,phone,whatsapp_number,whatsapp_alerts_enabled,is_available',
    user_type: 'in.(professional,company)',
    is_available: 'eq.true',
    limit: '100',
  });
  const cityFilter = escapeFilter(city);
  const stateFilter = escapeFilter(state);
  const specialtyFilter = escapeFilter(specialty);
  if (cityFilter) params.set('city', `ilike.*${cityFilter}*`);
  if (stateFilter) params.set('state', `eq.${stateFilter}`);
  if (specialtyFilter) params.set('specialty', `ilike.*${specialtyFilter}*`);
  const profiles = await dbRequest(`profiles?${params.toString()}`) as ProfileRow[];
  if (!profiles.length) return [];
  const ids = profiles.map((profile) => profile.id);
  const reviewParams = new URLSearchParams({
    select: 'profile_id,rating',
    profile_id: `in.(${ids.join(',')})`,
  });
  const reviews = await dbRequest(`reviews?${reviewParams.toString()}`) as Array<{ profile_id: string; rating: number }>;
  const stats = new Map<string, { total: number; count: number }>();
  for (const review of reviews) {
    const current = stats.get(review.profile_id) ?? { total: 0, count: 0 };
    current.total += Number(review.rating) || 0;
    current.count += 1;
    stats.set(review.profile_id, current);
  }
  const ranked = profiles.map((profile) => {
    const stat = stats.get(profile.id) ?? { total: 0, count: 0 };
    return { ...profile, rating: stat.count ? stat.total / stat.count : 0, reviews: stat.count };
  }).sort((first, second) => second.rating - first.rating || second.reviews - first.reviews);
  const appUrl = (Deno.env.get('PUBLIC_APP_URL') ?? 'https://prontobra.vercel.app').replace(/\/$/, '');
  return ranked.map((profile) => ({
    id: profile.id,
    user_id: profile.user_id,
    user_type: profile.user_type,
    full_name: profile.full_name,
    city: profile.city,
    state: profile.state,
    specialty: profile.specialty,
    rating: profile.rating,
    reviews: profile.reviews,
    link: `${appUrl}/profissionais/${profile.id}`,
    whatsapp_number: profile.whatsapp_number || normalizePhone(profile.phone ?? ''),
    whatsapp_alerts_enabled: profile.whatsapp_alerts_enabled,
  }));
}

function estimateMaterials(args: JsonRecord) {
  const wallArea = Math.max(0, Number(args.wall_area_m2) || 0);
  const floorArea = Math.max(0, Number(args.floor_area_m2) || 0);
  const paintArea = Math.max(0, Number(args.paint_area_m2) || wallArea);
  const brickCount = wallArea ? Math.ceil(wallArea * 25 * 1.1) : 0;
  const cementBags = wallArea ? Math.ceil(wallArea * 0.15) : 0;
  const sandCubicMeters = wallArea ? Number((wallArea * 0.02).toFixed(2)) : 0;
  const paintLiters = paintArea ? Math.ceil(paintArea * 0.2 * 1.1) : 0;
  const floorTilesArea = floorArea ? Number((floorArea * 1.1).toFixed(2)) : 0;
  return {
    estimate: {
      bricks_units: brickCount,
      cement_bags_50kg: cementBags,
      sand_m3: sandCubicMeters,
      paint_liters_two_coats: paintLiters,
      floor_covering_m2_with_waste: floorTilesArea,
    },
    note: 'Estimativa preliminar: consumo varia conforme dimensões, espessura, técnica, perdas e fabricante. Confirme com um profissional antes da compra.',
  };
}

function pdfEscape(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^\x20-\x7E]/g, '?').replace(/[\\()]/g, '\\$&').slice(0, 110);
}

function makeQuotePdf(lines: string[]) {
  const textLines = lines.slice(0, 25);
  const commands = ['BT', '/F1 16 Tf', '50 790 Td'];
  textLines.forEach((line, index) => {
    if (index > 0) commands.push('0 -25 Td');
    commands.push(`(${pdfEscape(line)}) Tj`);
    if (index === 0) commands.push('/F1 11 Tf');
  });
  commands.push('ET');
  const stream = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

async function uploadPrivatePdf(userId: string, bytes: Uint8Array) {
  const path = `${userId}/${crypto.randomUUID()}.pdf`;
  const uploadResponse = await fetch(`${supabaseUrl()}/storage/v1/object/quotes/${path}`, {
    method: 'POST',
    headers: { apikey: serviceKey(), Authorization: `Bearer ${serviceKey()}`, 'Content-Type': 'application/pdf', 'x-upsert': 'false' },
    body: bytes,
  });
  if (!uploadResponse.ok) throw new Error(`Não foi possível salvar o PDF: ${(await uploadResponse.text()).slice(0, 300)}`);
  const signedResponse = await fetch(`${supabaseUrl()}/storage/v1/object/sign/quotes/${path}`, {
    method: 'POST',
    headers: { apikey: serviceKey(), Authorization: `Bearer ${serviceKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: 3600 }),
  });
  if (!signedResponse.ok) throw new Error('Não foi possível gerar um link seguro para o orçamento.');
  const signedData = await signedResponse.json() as { signedURL: string };
  return signedData.signedURL.startsWith('http') ? signedData.signedURL : `${supabaseUrl()}/storage/v1${signedData.signedURL}`;
}

function validateMediaUrl(url: string) {
  const parsed = new URL(url);
  const allowedHosts = (Deno.env.get('WHATSAPP_MEDIA_ALLOWED_HOSTS') ?? '').split(',').map((host) => host.trim().toLowerCase()).filter(Boolean);
  if (parsed.protocol !== 'https:' || !allowedHosts.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))) {
    throw new Error('A URL de mídia não corresponde a um host HTTPS permitido.');
  }
  if (parsed.username || parsed.password || parsed.hostname === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) {
    throw new Error('A URL de mídia não é permitida.');
  }
  return parsed;
}

async function downloadIncomingMedia(incoming: IncomingMessage) {
  if (incoming.mediaBase64) {
    const decoded = Uint8Array.from(atob(incoming.mediaBase64.replace(/^data:[^,]+,/, '')), (char) => char.charCodeAt(0));
    if (decoded.byteLength > 50 * 1024 * 1024) throw new Error('A mídia ultrapassa o limite de 50 MB.');
    return { bytes: decoded, mimeType: incoming.mimeType || 'application/octet-stream' };
  }
  let url = incoming.mediaUrl;
  if (incoming.mediaId && Deno.env.get('WHATSAPP_PROVIDER') === 'meta') {
    const graphBase = (Deno.env.get('META_GRAPH_URL') ?? 'https://graph.facebook.com/v21.0').replace(/\/$/, '');
    const metadataResponse = await fetch(`${graphBase}/${encodeURIComponent(incoming.mediaId)}`, {
      headers: { Authorization: `Bearer ${requiredEnv('WHATSAPP_TOKEN')}` },
    });
    if (!metadataResponse.ok) throw new Error('Não foi possível obter a mídia recebida no WhatsApp.');
    const metadata = await metadataResponse.json() as { url?: string; mime_type?: string };
    url = metadata.url;
    incoming.mimeType = metadata.mime_type || incoming.mimeType;
  }
  if (!url) throw new Error('A mensagem não contém um link de mídia acessível.');
  const parsed = validateMediaUrl(url);
  const mediaHeaders: Record<string, string> = {};
  if ((Deno.env.get('WHATSAPP_PROVIDER') ?? 'evolution') === 'meta') {
    mediaHeaders.Authorization = `Bearer ${requiredEnv('WHATSAPP_TOKEN')}`;
  }
  const response = await fetch(parsed.toString(), { headers: mediaHeaders, redirect: 'error' });
  if (!response.ok) throw new Error('Não foi possível baixar a mídia enviada.');
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 50 * 1024 * 1024) throw new Error('A mídia ultrapassa o limite de 50 MB.');
  return { bytes, mimeType: incoming.mimeType || response.headers.get('content-type') || 'application/octet-stream' };
}

async function transcribeAudio(incoming: IncomingMessage) {
  const media = await downloadIncomingMedia(incoming);
  if (media.bytes.byteLength > 25 * 1024 * 1024) throw new Error('Áudios para transcrição devem ter no máximo 25 MB.');
  const form = new FormData();
  form.append('model', 'whisper-1');
  form.append('file', new Blob([media.bytes], { type: media.mimeType }), 'audio-message');
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${requiredEnv('OPENAI_API_KEY')}` },
    body: form,
  });
  if (!response.ok) throw new Error(`Falha na transcrição do áudio (${response.status}).`);
  const result = await response.json() as { text?: string };
  if (!result.text?.trim()) throw new Error('Não foi possível entender o áudio recebido.');
  return result.text.trim();
}

async function publishWhatsAppMedia(profile: ProfileRow, incoming: IncomingMessage, title: string, description: string) {
  if (!profile.whatsapp_feed_enabled) throw new Error('Ative a opção de publicação pelo WhatsApp no painel antes de publicar.');
  if (!incoming.mediaType || incoming.mediaType === 'audio') throw new Error('Envie uma foto ou vídeo junto com o comando publicar.');
  const existingPost = await dbRequest(`community_posts?select=id&source_whatsapp_message_id=eq.${encodeURIComponent(incoming.id)}&limit=1`) as Array<{ id: string }>;
  if (existingPost[0]) return existingPost[0].id;
  const media = await downloadIncomingMedia(incoming);
  const maximum = incoming.mediaType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (media.bytes.byteLength > maximum) throw new Error(`A mídia excede o limite de ${incoming.mediaType === 'video' ? '50 MB' : '10 MB'}.`);
  const extension = media.mimeType.includes('webm') ? 'webm' : media.mimeType.includes('quicktime') ? 'mov'
    : media.mimeType.includes('png') ? 'png' : media.mimeType.includes('jpeg') ? 'jpg' : incoming.mediaType === 'video' ? 'mp4' : 'jpg';
  const path = `${profile.user_id}/${crypto.randomUUID()}.${extension}`;
  const upload = await fetch(`${supabaseUrl()}/storage/v1/object/posts/${path}`, {
    method: 'POST',
    headers: { apikey: serviceKey(), Authorization: `Bearer ${serviceKey()}`, 'Content-Type': media.mimeType, 'x-upsert': 'false' },
    body: media.bytes,
  });
  if (!upload.ok) throw new Error('Não foi possível enviar a mídia para o feed.');
  const mediaUrl = `${supabaseUrl()}/storage/v1/object/public/posts/${path}`;
  const insert = await dbRequest('community_posts', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      user_id: profile.user_id,
      profile_id: profile.id,
      author: profile.full_name,
      specialty: profile.specialty || (profile.user_type === 'company' ? 'Empresa' : 'Construção Civil'),
      title: title.slice(0, 90),
      city: profile.city,
      state: profile.state,
      description: description.slice(0, 1000),
      media_url: mediaUrl,
      media_type: incoming.mediaType,
      source_whatsapp_message_id: incoming.id,
    }),
  });
  return (insert as Array<{ id: string }>)[0]?.id;
}

async function runTool(name: string, args: JsonRecord, context: {
  profile: ProfileRow | null;
  category: Category;
  incoming: IncomingMessage;
  alertsSent: { value: boolean };
}) {
  if (name === 'search_professionals') {
    const city = text(args.city);
    const state = text(args.state);
    const specialty = text(args.specialty);
    const matches = await searchProfessionals(city, state, specialty);
    if (context.category === 'pessoa_fisica' || context.category === 'empresa') {
      if (!context.alertsSent.value) {
        context.alertsSent.value = true;
        const alerts = matches.filter((match) => match.whatsapp_alerts_enabled && match.whatsapp_number).slice(0, 3);
        await Promise.all(alerts.map(async (match) => {
          if (!await claimAlert(context.incoming.id, match.whatsapp_number)) return;
          await sendWhatsAppMessage(
            match.whatsapp_number,
            `Novo pedido em ${city}/${state}: alguém procura ${specialty || 'serviços de construção'}. Veja oportunidades na ProntObra: ${match.link}`,
          );
        }));
      }
    }
    return matches.length
    ? matches.slice(0, 10).map((match, index) => `${index + 1}. ${match.full_name} (${match.user_type === 'company' ? 'Empresa' : match.specialty || 'Profissional'}) — ${match.city}/${match.state} — ${match.rating.toFixed(1)} estrelas (${match.reviews} avaliações) — ${match.link}`).join('\n')
      : `Não encontrei profissionais disponíveis em ${city}/${state}.`;
  }
  if (name === 'calculate_materials') {
    return JSON.stringify(estimateMaterials(args));
  }
  if (name === 'generate_quote') {
    if (!context.profile || !['professional', 'empresa'].includes(context.category)) throw new Error('A geração de orçamento está disponível apenas para profissionais e empresas cadastrados.');
    const amount = Number(args.total_value);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) throw new Error('Informe um valor válido para o orçamento.');
    const customer = text(args.customer_name).slice(0, 80) || 'Cliente';
    const description = text(args.description).slice(0, 250);
    const privateData = await dbRequest(`profile_private_data?select=tax_document&user_id=eq.${encodeURIComponent(context.profile.user_id)}&limit=1`) as Array<{ tax_document: string | null }>;
    const taxDocument = normalizePhone(privateData[0]?.tax_document ?? '');
    const document = taxDocument.length === 11 || taxDocument.length === 14
      ? taxDocument
      : text(context.profile.company_cnpj) || 'Não informado no cadastro';
    const appUrl = Deno.env.get('PUBLIC_APP_URL') ?? 'https://prontobra.vercel.app';
    const pdf = makeQuotePdf([
      'PRONTOBRA — ORCAMENTO DE SERVICO',
      `Prestador: ${context.profile.full_name}`,
      `CPF/CNPJ: ${document}`,
      `Cliente: ${customer}`,
      `Servico: ${description}`,
      `Valor total: R$ ${amount.toFixed(2).replace('.', ',')}`,
      `Cidade: ${context.profile.city}/${context.profile.state}`,
      `Emitido em: ${new Date().toLocaleDateString('pt-BR')}`,
      `Plataforma: ${appUrl}`,
      'Orcamento estimativo sujeito a aprovacao entre as partes.',
    ]);
    const link = await uploadPrivatePdf(context.profile.user_id, pdf);
    return `Orçamento gerado em PDF (link privado expira em 1 hora): ${link}. Documento do prestador: ${document}.`;
  }
  if (name === 'publish_community_post') {
    if (!context.profile || !['professional', 'empresa'].includes(context.category)) throw new Error('Somente profissionais e empresas cadastrados podem publicar.');
    if (!/\bpublicar\b/i.test(context.incoming.text) && !context.incoming.mediaCaption?.toLowerCase().includes('publicar')) {
      throw new Error('Para confirmar a publicação, envie a mídia com uma legenda começando por "publicar:".');
    }
    const id = await publishWhatsAppMedia(context.profile, context.incoming, text(args.title) || 'Trabalho realizado', text(args.description) || context.incoming.mediaCaption || '');
    return `Publicação criada no feed da comunidade: ${(Deno.env.get('PUBLIC_APP_URL') ?? 'https://prontobra.vercel.app').replace(/\/$/, '')}/comunidade (ID ${id}).`;
  }
  return `Olá! ${context.category === 'visitor' ? 'No cadastro, escolha Profissional se oferece serviços, Empresa se representa uma construtora ou negócio, ou Cliente/Pessoa Física se procura serviços.' : 'Posso ajudar a encontrar profissionais, estimar materiais, explicar a plataforma e, para profissionais/empresas, gerar orçamentos ou publicar mídias autorizadas.'}`;
}

const aiTools = [
  {
    type: 'function',
    function: {
      name: 'search_professionals',
      description: 'Busca profissionais e empresas disponíveis por cidade, estado e especialidade.',
      parameters: { type: 'object', properties: { city: { type: 'string' }, state: { type: 'string' }, specialty: { type: 'string' } }, required: ['city', 'state', 'specialty'], additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_materials',
      description: 'Calcula uma estimativa preliminar de materiais para obra com as áreas em m² informadas.',
      parameters: { type: 'object', properties: { wall_area_m2: { type: 'number' }, floor_area_m2: { type: 'number' }, paint_area_m2: { type: 'number' } }, required: ['wall_area_m2', 'floor_area_m2', 'paint_area_m2'], additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_quote',
      description: 'Gera um PDF privado de orçamento para o profissional/empresa autenticado no WhatsApp.',
      parameters: { type: 'object', properties: { customer_name: { type: 'string' }, description: { type: 'string' }, total_value: { type: 'number' } }, required: ['customer_name', 'description', 'total_value'], additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'publish_community_post',
      description: 'Publica no feed uma imagem/vídeo recebido, somente após comando explicito publicar e consentimento ativo no perfil.',
      parameters: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } }, required: ['title', 'description'], additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'provide_guidance',
      description: 'Orienta novos usuários e responde dúvidas sobre o funcionamento do ProntObra.',
      parameters: { type: 'object', properties: { question: { type: 'string' } }, required: ['question'], additionalProperties: false },
    },
  },
];

async function askAssistant(incoming: IncomingMessage, profile: ProfileRow | null, category: Category) {
  const messages: JsonRecord[] = [
    {
      role: 'system',
      content: `Você é a IA de suporte da ProntObra, em português brasileiro. Categoria detectada: ${category}. Responda com clareza, sem inventar dados. Use ferramentas para consultas, cálculos, orçamentos e publicação. Nunca revele números de telefone de terceiros. Alertas a profissionais só podem ser enviados aos que ativaram whatsapp_alerts_enabled. Para publicar, exija consentimento ativo no perfil e o comando textual explícito publicar. Para orçamento, use somente dados do prestador autenticado; diga quando CPF/CNPJ não estiver cadastrado. Estimativas de materiais não substituem avaliação técnica.`,
    },
    { role: 'user', content: incoming.text },
  ];
  const alertsSent = { value: false };
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${requiredEnv('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: Deno.env.get('OPENAI_CHAT_MODEL') ?? 'gpt-4o-mini', messages, tools: aiTools, tool_choice: 'auto', temperature: 0.2 }),
    });
    if (!response.ok) throw new Error(`A API de IA retornou ${response.status}.`);
    const result = await response.json() as { choices?: Array<{ message?: JsonRecord }> };
    const assistantMessage = result.choices?.[0]?.message;
    if (!assistantMessage) throw new Error('A IA não retornou uma resposta válida.');
    const calls = assistantMessage.tool_calls as Array<{ id: string; function: { name: string; arguments: string } }> | undefined;
    messages.push(assistantMessage);
    if (!calls?.length) return text(assistantMessage.content) || 'Não consegui concluir essa solicitação. Pode explicar de outra forma?';
    for (const call of calls) {
      try {
        const args = JSON.parse(call.function.arguments) as JsonRecord;
        const output = await runTool(call.function.name, args, { profile, category, incoming, alertsSent });
        messages.push({ role: 'tool', tool_call_id: call.id, content: typeof output === 'string' ? output : JSON.stringify(output) });
      } catch (toolError) {
        messages.push({ role: 'tool', tool_call_id: call.id, content: toolError instanceof Error ? toolError.message : 'Não foi possível concluir a ferramenta.' });
      }
    }
  }
  return 'Concluí a consulta, mas não consegui montar uma resposta final. Tente novamente com mais detalhes.';
}

async function processMessage(incoming: IncomingMessage): Promise<{ reply: string | null; messageId: string | null }> {
  const existing = await dbRequest(`whatsapp_ai_messages?select=id,status,created_at&provider_message_id=eq.${encodeURIComponent(incoming.id)}&limit=1`) as Array<{ status: string; created_at: string }>;
  if (existing[0]?.status === 'complete') return { reply: null, messageId: null };
  if (existing[0]?.status === 'processing' && Date.now() - new Date(existing[0].created_at).getTime() < 5 * 60 * 1000) {
    return { reply: null, messageId: null };
  }
  const limitOk = await consumeRateLimit(incoming.from);
  if (!limitOk) return { reply: 'Recebi muitas mensagens em pouco tempo. Aguarde um minuto e tente novamente.', messageId: null };
  const messageId = incoming.id;
  if (existing.length) {
    await dbRequest(`whatsapp_ai_messages?provider_message_id=eq.${encodeURIComponent(messageId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'processing', created_at: new Date().toISOString() }),
    });
  } else {
    const inserted = await dbRequest('whatsapp_ai_messages?on_conflict=provider_message_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify({ provider_message_id: incoming.id, sender_number: incoming.from }),
    }) as unknown[];
    if (!inserted.length) return { reply: null, messageId: null };
  }

  try {
    const profile = await findProfile(incoming.from);
    const category = categoryOf(profile);
    let message = incoming.text || incoming.mediaCaption || '';
    if (incoming.mediaType === 'audio') message = await transcribeAudio(incoming);
    if (!message.trim()) message = 'Recebi sua mídia. Se quiser publicá-la, envie a legenda começando com "publicar:".';
    const assistantMessage = { ...incoming, text: message };
    return { reply: await askAssistant(assistantMessage, profile, category), messageId };
  } catch (error) {
    await dbRequest(`whatsapp_ai_messages?provider_message_id=eq.${encodeURIComponent(messageId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'failed' }),
    });
    throw error;
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    if (mode === 'subscribe' && challenge && equalConstantTime(token ?? '', requiredEnv('WHATSAPP_VERIFY_TOKEN'))) {
      return new Response(challenge, { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
    }
    return jsonResponse({ error: 'Webhook verification failed.' }, 403);
  }
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405);

  try {
    const rawBody = await readBodyLimited(request, 75 * 1024 * 1024);
    const provider = (Deno.env.get('WHATSAPP_PROVIDER') ?? 'evolution') as Provider;
    if (provider === 'meta') {
      const signature = request.headers.get('x-hub-signature-256') ?? '';
      if (!await verifyMetaSignature(rawBody, signature)) return jsonResponse({ error: 'Invalid webhook signature.' }, 401);
    } else {
      const expected = requiredEnv('WHATSAPP_WEBHOOK_SECRET');
      const received = request.headers.get('x-webhook-secret')
        ?? request.headers.get('x-api-key')
        ?? request.headers.get('client-token')
        ?? request.headers.get('apikey')
        ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
        ?? '';
      if (!equalConstantTime(received, expected)) return jsonResponse({ error: 'Invalid webhook credentials.' }, 401);
    }
    const payload = JSON.parse(rawBody) as JsonRecord;
    if (payload.event === 'messages.upsert' && record(payload.data).key && record(record(payload.data).key).fromMe === true) {
      return jsonResponse({ ok: true, ignored: true });
    }
    const incoming = extractIncoming(payload);
    if (!incoming?.from) return jsonResponse({ ok: true, ignored: true });
    const processed = await processMessage(incoming);
    try {
      if (processed.reply) await sendWhatsAppMessage(incoming.from, processed.reply);
      if (processed.messageId) {
        await dbRequest(`whatsapp_ai_messages?provider_message_id=eq.${encodeURIComponent(processed.messageId)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ status: 'complete' }),
        });
      }
    } catch (error) {
      if (processed.messageId) {
        await dbRequest(`whatsapp_ai_messages?provider_message_id=eq.${encodeURIComponent(processed.messageId)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ status: 'failed' }),
        });
      }
      throw error;
    }
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('WhatsApp AI webhook error:', error);
    return jsonResponse({ error: 'Não foi possível processar a mensagem agora.' }, 500);
  }
});
