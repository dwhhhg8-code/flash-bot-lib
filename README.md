# ⚡ FLASH BOT

بوت واتساب احترافي، خفيف، وقابل للتوسيع — ببنية كلاسيكية واضحة.

```
settings.js   → الإعدادات + تحميل اللغة
handler.js    → موزّع الأوامر (صلاحيات + تبريد + مكافحة روابط)
index.js      → نقطة الدخول
lib/          → الوحدات الداخلية
plugins/      → الأوامر (كل ملف = أمر مستقل)
langs/        → ملفات الترجمة
```

## المتطلبات

- **Node.js 20+**
- npm

## الاستخدام كبوت جاهز

```bash
npm install
cp .env.example .env     # عدّل الأرقام واللغة
npm start
```

عند أول تشغيل هيظهرلك **كود ربط** في الطرفية. دخّله في واتساب:
**الإعدادات ← الأجهزة المرتبطة ← ربط جهاز ← الربط برقم الهاتف**.

لو عايز QR بدل الكود: خلي `USE_PAIRING=false` في `.env`.

## الاستخدام كمكتبة

تقدر تبني بوتك فوق FLASH BOT:

```bash
npm install flash-bot
```

```js
import { createBot } from 'flash-bot';

const bot = await createBot({
  ownerNumber: '201000000000',
  prefix: ['.', '!'],
  language: 'ar',
  pluginsDir: './my-plugins',   // أوامرك
});

bot.on('ready', () => console.log('جاهز ✅'));

// إضافة أمر برمجيًا
bot.registry.commands.set('hello', {
  command: 'hello',
  category: 'custom',
  async run({ m }) { await m.reply({ text: 'أهلاً 👋' }); },
});
```

### الصادرات

| التصدير | الوصف |
|---|---|
| `createBot(options)` | يشغّل البوت ويرجّع كائن فيه `sock`, `registry`, `db`, `reload()`, `stop()` |
| `settings` | الإعدادات (قابلة للتعديل) |
| `lang`, `setLanguage(code)` | اللغة الحالية وتبديلها |
| `serialize(sock, raw)` | تحويل رسالة خام لكائن مبسّط |
| `loadPlugins()` | تحميل الأوامر يدويًا |
| `connect(onMessage, events)` | اتصال واتساب مباشر |
| `db` | قاعدة بيانات JSON |
| `t(key, vars)` | ترجمة |
| `functions` | `sleep`, `isUrl`, `toJid`, `fromJid`, `formatBytes`, `table`... |
| كل أدوات Baileys | `makeWASocket`, `DisconnectReason`, ... |

## الإعدادات (`.env`)

| المتغير | الوصف | مثال |
|---|---|---|
| `OWNER_NUMBER` | رقم المالك (دولي بدون +) | `201000000000` |
| `USE_PAIRING` | `true` = كود ربط، `false` = QR | `true` |
| `PAIRING_NUMBER` | الرقم اللي هيتربط | `201000000000` |
| `BOT_LANGUAGE` | `ar` أو `en` | `ar` |
| `BOT_PREFIX` | البادئات مفصولة بفاصلة | `.,!,/` |

## الأوامر المدمجة

| الأمر | الاختصار | الوصف |
|---|---|---|
| `ping` | `p` | اختبار السرعة |
| `menu` | `help` | قائمة الأوامر |
| `stats` | `احصائيات` | حالة البوت |
| `owner` | `المالك` | بيانات المالك |
| `sticker` | `s` | تحويل صورة/فيديو لستيكر |
| `antilink` | — | مكافحة الروابط (أدمن) |
| `welcome` | `ترحيب` | الترحيب بالأعضاء (أدمن) |
| `eval` | `>` | تنفيذ كود (مالك فقط) |

## إضافة أمر جديد

اعمل ملف في `plugins/<قسم>/<اسم>.js`:

```js
export default {
  command: 'hello',
  aliases: ['هاي'],
  category: 'main',
  cooldown: 3,          // ثواني
  // owner: true,       // للمالك فقط
  // admin: true,       // للأدمن فقط
  // group: true,       // جروبات فقط
  // private: true,     // خاص فقط
  async run({ sock, m, args, text, registry, t, db, settings }) {
    await m.reply({ text: 'أهلاً! 👋' });
  },
};
```

البوت يحمّل الملف تلقائيًا — مفيش أي تسجيل يدوي.

### مستمع أحداث (ترحيب، مغادرة...)

```js
export const event = 'group-participants.update';
export async function onEvent(sock, update) {
  // update = { id, participants, action }
}
export default { event, onEvent };
```

## المتغيرات المتاحة داخل `run`

| المتغير | الوصف |
|---|---|
| `sock` | اتصال واتساب |
| `m` | الرسالة (`.text`, `.chat`, `.sender`, `.isGroup`, `.reply()`, `.download()`...) |
| `args` | كلمات الأمر بعد الاسم |
| `registry` | كل الأوامر المحمّلة |
| `t(key, vars)` | ترجمة نص |
| `db` | قاعدة البيانات (JSON) |
| `settings` | الإعدادات |

## الترخيص

MIT
