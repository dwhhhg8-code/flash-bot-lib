/**
 * FLASH BOT — مكتبة بوت واتساب قابلة للتوسيع.
 *
 *   import { createBot } from 'flash-bot';
 */
export { createBot } from './lib/bot.js';
export { default as settings, lang, setLanguage } from './settings.js';

// الوحدات الداخلية — متاحة للمطورين
export { serialize } from './lib/serialize.js';
export { loadPlugins } from './lib/loader.js';
export { connect } from './lib/connection.js';
export { handleMessage } from './handler.js';
export { db } from './lib/database.js';
export { logger } from './lib/logger.js';
export * as functions from './lib/function.js';
export { t, formatBytes, sleep, isUrl, toJid, fromJid, capitalize, table } from './lib/function.js';

// أدوات Baileys لأي مطور محتاجها
export * from '@whiskeysockets/baileys';
