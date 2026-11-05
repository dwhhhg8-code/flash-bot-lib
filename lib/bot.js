import { EventEmitter } from 'node:events';
import settings, { setLanguage } from '../settings.js';
import logger from './logger.js';
import { connect } from './connection.js';
import { loadPlugins } from './loader.js';
import { handleMessage } from '../handler.js';
import { t } from './function.js';
import { db } from './database.js';

/**
 * ينشئ ويشغّل بوت واتساب.
 *
 *   import { createBot } from 'flash-bot';
 *   const bot = await createBot({ ownerNumber: '2010...', pluginsDir: './plugins' });
 *   bot.on('ready', () => console.log('جاهز'));
 *
 * @param {object} [options] يدمج فوق الإعدادات الافتراضية
 * @returns {Promise<object>} كائن البوت
 */
export async function createBot(options = {}) {
  // دمج الإعدادات
  const merged = { ...settings, ...options };
  Object.assign(settings, merged);
  if (options.language) setLanguage(options.language);

  const emitter = new EventEmitter();
  emitter.setMaxListeners(50);

  const registry = await loadPlugins();
  logger.info(t('plugins_loaded', { count: registry.commands.size, aliases: registry.aliases.size }));

  const sock = await connect((s, raw) => {
    handleMessage(s, raw, registry).catch((err) =>
      logger.error({ err: err.message }, 'خطأ في المعالج'),
    );
  }, registry.events);

  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') emitter.emit('ready', sock);
    if (connection === 'close') emitter.emit('close');
  });

  const bot = {
    sock,
    registry,
    settings,
    db,
    logger,
    t,
    /** يعيد تحميل البلاگنات بدون إعادة تشغيل */
    async reload() {
      const fresh = await loadPlugins();
      registry.commands = fresh.commands;
      registry.aliases = fresh.aliases;
      registry.list = fresh.list;
      registry.events = fresh.events;
      logger.info(t('plugins_loaded', { count: fresh.commands.size, aliases: fresh.aliases.size }));
      return fresh;
    },
    /** يوقف البوت */
    async stop() {
      try {
        await sock.logout();
      } catch {
        /* تجاهل */
      }
      sock.end?.(undefined);
    },
    on: emitter.on.bind(emitter),
    once: emitter.once.bind(emitter),
    off: emitter.off.bind(emitter),
  };

  return bot;
}

export default createBot;
