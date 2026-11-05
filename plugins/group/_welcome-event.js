import { db } from '../../lib/database.js';
import { t } from '../../lib/function.js';
import logger from '../../lib/logger.js';

/**
 * مش أمر — مستمع لأحداث الجروبات.
 * يسجّل نفسه في registry.listeners عبر loadPlugins (event: 'group-participants.update').
 */
export const event = 'group-participants.update';

export async function onEvent(sock, update) {
  const { id, participants, action } = update;
  const cfg = db.group(id);
  if (!cfg.welcome) return;

  let meta;
  try {
    meta = await sock.groupMetadata(id);
  } catch (err) {
    logger.warn({ err: err.message }, 'تعذّر جلب بيانات الجروب');
    return;
  }

  for (const jid of participants) {
    const user = `@${jid.split('@')[0]}`;
    const text =
      action === 'add'
        ? t('welcome_msg', { user, group: meta.subject })
        : action === 'remove'
          ? t('goodbye_msg', { user })
          : null;
    if (!text) continue;
    await sock.sendMessage(id, { text, mentions: [jid] });
  }
}

export default { event, onEvent };
