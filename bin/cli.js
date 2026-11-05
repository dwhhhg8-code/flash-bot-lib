#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createBot } from '../index.js';
import settings from '../settings.js';
import logger from '../lib/logger.js';

// لو المستخدم عنده مجلد plugins في مشروعه، استخدمه
const cwdPlugins = join(process.cwd(), 'plugins');
if (existsSync(cwdPlugins)) settings.pluginsDir = cwdPlugins;

const bot = await createBot();

bot.on('ready', () => logger.info('✅ البوت جاهز'));

// إيقاف نظيف
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    logger.info('جاري الإيقاف...');
    await bot.stop();
    process.exit(0);
  });
}
