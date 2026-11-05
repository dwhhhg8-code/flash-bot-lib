import { downloadMediaMessage, getContentType, jidNormalizedUser } from '@whiskeysockets/baileys';
import { fromJid } from './function.js';

/**
 * يحوّل رسالة Baileys الخام لكائن مبسّط فيه كل اللي الأوامر محتاجاه:
 * نص، مرسل، شات، هل هو جروب، رد، منشن، ميديا...
 */
export function serialize(sock, raw) {
  const m = raw.message;
  if (!m) return null;

  const type = getContentType(m);
  const msg = m[type] || {};

  // نص الرسالة — conversation نص مباشر، والباقي كائنات
  const directText =
    typeof msg === 'string'
      ? msg
      : msg.text ||
        msg.caption ||
        m.conversation ||
        m.extendedTextMessage?.text ||
        m.imageMessage?.caption ||
        m.videoMessage?.caption ||
        m.buttonsResponseMessage?.selectedButtonId ||
        m.listResponseMessage?.singleSelectReply?.selectedRowId ||
        '';

  // الرد على رسالة
  const ctxInfo = msg.contextInfo || m.extendedTextMessage?.contextInfo || {};
  const quoted = ctxInfo.quotedMessage
    ? serialize(sock, {
        key: {
          remoteJid: raw.key.remoteJid,
          fromMe: ctxInfo.participant === sock.user?.id,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: ctxInfo.quotedMessage,
      })
    : null;

  const sender = raw.key.fromMe ? sock.user.id : raw.key.participant || raw.key.remoteJid;
  const isGroup = raw.key.remoteJid.endsWith('@g.us');

  const text = directText || '';

  return {
    raw,
    key: raw.key,
    id: raw.key.id,
    chat: raw.key.remoteJid,
    sender,
    senderNumber: fromJid(sender),
    isGroup,
    isPrivate: !isGroup,
    fromMe: !!raw.key.fromMe,
    type,
    text: text || '',
    mentionedJid: ctxInfo.mentionedJid || [],
    isMedia: /image|video|audio|document|sticker/.test(type || ''),
    quoted,
    /** تنزيل الميديا كـ Buffer */
    async download() {
      return downloadMediaMessage(raw, 'buffer', {}, { logger: undefined, reuploadRequest: sock.updateMediaMessage });
    },
    /** يرد على الرسالة */
    async reply(content, options = {}) {
      return sock.sendMessage(this.chat, content, { quoted: raw, ...options });
    },
    /** يبعت للشات */
    async send(content, options = {}) {
      return sock.sendMessage(this.chat, content, options);
    },
    /** يعمل رياكشن */
    async react(emoji) {
      return sock.sendMessage(this.chat, { react: { text: emoji, key: raw.key } });
    },
  };
}

export default serialize;
