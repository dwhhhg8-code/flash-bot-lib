# AGENTS.md — FLASH BOT

## نظرة عامة
مكتبة/بوت واتساب بالبنية الكلاسيكية: `settings.js` + `handler.js` + `index.js` + `lib/` + `plugins/` + `package.json`.
ESM (`"type": "module"`)، Node >= 20، Baileys 7.0.0-rc14.

## الأوامر
```bash
npm install
npm start          # يشغّل bin/cli.js
npm run dev        # مع --watch
```

## قواعد الكود
- كل الملفات ESM. مفيش CommonJS. استخدم `import`/`export`.
- التبعيات الـCommonJS الوحيدة (`node-webpmux`) تتستورد كـdefault: `import webpmux from 'node-webpmux'`.
- التعليقات بالعربي ومختصرة — تشرح "ليه" مش "إيه".
- أي دالة/وحدة جديدة تتصدّر من `index.js` لو المفروض تكون متاحة للمطورين.

## إضافة أمر
ملف في `plugins/<قسم>/<اسم>.js` بيصدّر default فيه `command` و `run`.
البوت يحمّله تلقائيًا — مفيش تسجيل يدوي.

## مستمع أحداث
ملف بيصدّر `event` + `onEvent` (مثال: `plugins/group/_welcome-event.js`).
`lib/connection.js` بيربطهم تلقائيًا عبر `registry.events`.

## اختبارات
مفيش إطار اختبار — الاختبار بمحاكاة `sock` و`handleMessage` مباشرة (شوف git history).
دايمًا شغّل `npm audit --omit=dev` — الهدف صفر ثغرات.

## ملاحظات
- `settings` كائن قابل للتعديل (mutable) — `createBot(options)` بيدمج فوقه.
- `lang` live binding: `setLanguage()` بتحدّثه فورًا في كل الوحدات.
- `overrides` في package.json مثبّتة `sharp` و`jimp` و`zod` لتقليل الثغرات — متشيلهاش.
