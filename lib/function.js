import { lang } from '../settings.js';

/**
 * يرجّع نص مترجم مع استبدال المتغيرات.
 *   t('plugins_loaded', { count: 5, aliases: 2 })
 *   → "تم تحميل 5 أمر (2 اختصار)"
 */
export function t(key, vars = {}) {
  let text = lang.strings?.[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

/** يحوّل رقم لمقاس مقروء: 1536 → 1.5KB */
export function formatBytes(bytes) {
  if (!bytes) return '0B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)}${units[i]}`;
}

/** تأخير بالمللي ثانية */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** هل النص رابط؟ */
export function isUrl(text = '') {
  return /(https?:\/\/|www\.)[^\s]+/i.test(text);
}

/** ينضّف رقم ويحوّله لـ jid */
export function toJid(number) {
  const digits = String(number).replace(/[^0-9]/g, '');
  return digits ? `${digits}@s.whatsapp.net` : '';
}

/** يستخرج الرقم من jid */
export function fromJid(jid = '') {
  return jid.split('@')[0].split(':')[0];
}

/** أول حرف كبير */
export const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

/** يبني جدول نصي بمحاذاة الأعمدة */
export function table(rows) {
  if (!rows.length) return '';
  const cols = Math.max(...rows.map((r) => r.length));
  const widths = Array.from({ length: cols }, (_, c) =>
    Math.max(...rows.map((r) => String(r[c] ?? '').length)),
  );
  return rows
    .map((r) => r.map((c, i) => String(c ?? '').padEnd(widths[i])).join('  '))
    .join('\n');
}
