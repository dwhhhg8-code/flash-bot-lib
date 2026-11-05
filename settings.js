import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ownerNumber = (process.env.OWNER_NUMBER || '').replace(/[^0-9]/g, '');

/** الإعدادات — كائن قابل للتعديل عبر createBot(options). */
export const settings = {
  botName: process.env.BOT_NAME || 'FLASH BOT',
  ownerNumber,
  ownerJid: ownerNumber ? `${ownerNumber}@s.whatsapp.net` : '',

  usePairingCode: String(process.env.USE_PAIRING || 'true').toLowerCase() === 'true',
  pairingNumber: (process.env.PAIRING_NUMBER || ownerNumber).replace(/[^0-9]/g, ''),

  prefix: (process.env.BOT_PREFIX || '.,!,/').split(',').map((p) => p.trim()).filter(Boolean),
  language: process.env.BOT_LANGUAGE || 'ar',

  sessionDir: join(__dirname, 'sessions'),
  databaseDir: join(__dirname, 'database'),
  pluginsDir: join(__dirname, 'plugins'),
  langsDir: join(__dirname, 'langs'),

  groupDefaults: {
    antilink: false,
    antispam: false,
    welcome: false,
    muted: false,
  },
};

function loadLang(code) {
  try {
    return JSON.parse(readFileSync(join(settings.langsDir, `${code}.json`), 'utf8'));
  } catch {
    return JSON.parse(readFileSync(join(settings.langsDir, 'en.json'), 'utf8'));
  }
}

/** اللغة الحالية — live binding: يتحدّث فورًا في كل مكان. */
export let lang = loadLang(settings.language);

/** يغيّر لغة البوت ويعيد تحميل ملف الترجمة. */
export function setLanguage(code) {
  settings.language = code;
  lang = loadLang(code);
  return lang;
}

export default settings;
