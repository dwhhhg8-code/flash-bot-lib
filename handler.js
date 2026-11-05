import settings from './settings.js';
import logger from './lib/logger.js';
import { serialize } from './lib/serialize.js';
import { t, isUrl } from './lib/function.js';
import { db } from './lib/database.js';

const cooldowns = new Map();

/** يستخرج الأمر من نص الرسالة، أو null لو مش أمر */
function parseCommand(text) {
  if (!text) return null;
  const prefix = settings.prefix.find((p) => text.startsWith(p));
  if (!prefix) return null;

  const body = text.slice(prefix.length).trim();
  if (!body) return null;

  const [name, ...args] = body.split(/\s+/);
  return { name: name.toLowerCase(), args, prefix };
}

/** هل المرسل مالك؟ */
function isOwner(m) {
  return m.senderNumber === settings.ownerNumber;
}

/** هل المرسل أدمن في الجروب؟ */
async function isAdmin(sock, m) {
  if (!m.isGroup) return false;
  try {
    const meta = await sock.groupMetadata(m.chat);
    const participant = meta.participants.find((p) => p.id === m.sender);
    return ['admin', 'superadmin'].includes(participant?.admin);
  } catch {
    return false;
  }
}

/** مكافحة الروابط */
async function handleAntilink(sock, m) {
  if (!m.isGroup || m.fromMe) return false;
  const cfg = db.group(m.chat);
  if (!cfg.antilink) return false;
  if (!isUrl(m.text)) return false;
  if (await isAdmin(sock, m)) return false;

  await sock.sendMessage(m.chat, { delete: m.key });
  await m.reply({ text: t('link_detected') });
  return true;
}

/**
 * المعالج الرئيسي: يُنادى لكل رسالة واردة.
 */
export async function handleMessage(sock, raw, registry) {
  const m = serialize(sock, raw);
  if (!m || m.fromMe) return;

  if (await handleAntilink(sock, m)) return;

  const parsed = parseCommand(m.text);
  if (!parsed) return;

  const { name, args } = parsed;
  const resolved = registry.commands.has(name) ? name : registry.aliases.get(name);
  const plugin = resolved ? registry.commands.get(resolved) : null;

  if (!plugin) {
    return m.reply({ text: t('cmd_not_found', { cmd: name }) });
  }

  // ─── الصلاحيات ───
  if (plugin.owner && !isOwner(m)) return m.reply({ text: t('owner_only') });
  if (plugin.group && !m.isGroup) return m.reply({ text: t('group_only') });
  if (plugin.private && m.isGroup) return m.reply({ text: t('private_only') });
  if (plugin.admin && !(await isAdmin(sock, m)) && !isOwner(m)) {
    return m.reply({ text: t('admin_only') });
  }

  // ─── التبريد ───
  const cd = plugin.cooldown ?? 3;
  const key = `${m.sender}:${resolved}`;
  const now = Date.now();
  const until = cooldowns.get(key) || 0;
  if (now < until) {
    const sec = Math.ceil((until - now) / 1000);
    return m.reply({ text: t('cooldown', { sec }) });
  }
  cooldowns.set(key, now + cd * 1000);

  // ─── التنفيذ ───
  try {
    await plugin.run({ sock, m, args, text: m.text, registry, t, db, settings });
    db.setUser(m.sender, { commands: db.user(m.sender).commands + 1 });
  } catch (err) {
    logger.error({ cmd: resolved, err: err.message }, 'فشل تنفيذ الأمر');
    await m.reply({ text: t('cmd_error', { error: err.message }) });
  }
}

export default handleMessage;
