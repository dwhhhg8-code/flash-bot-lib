import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import settings from '../settings.js';
import logger from './logger.js';

/** يمشي على مجلد البلاگنات ويرجّع كل ملفات .js */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.js')) out.push(full);
  }
  return out;
}

/**
 * يحمّل كل البلاگنات.
 * أوامر: { command, aliases?, category?, owner?, admin?, group?, private?, cooldown?, run }
 * أحداث: { event: 'group-participants.update', onEvent }
 * ويرجّع: { commands, aliases, list, events, failed }
 */
export async function loadPlugins() {
  const files = walk(settings.pluginsDir);
  const commands = new Map();
  const aliases = new Map();
  const list = [];
  const events = [];
  let failed = 0;

  for (const file of files) {
    const rel = relative(settings.pluginsDir, file);
    try {
      const mod = await import(pathToFileURL(file).href);
      const plugin = mod.default ?? mod;

      // مستمع أحداث
      if (plugin?.event && typeof plugin.onEvent === 'function') {
        plugin.__file = rel;
        events.push(plugin);
        continue;
      }

      if (!plugin?.command || typeof plugin.run !== 'function') {
        logger.warn({ file: rel }, 'بلاگن غير صالح: محتاج command و run');
        failed++;
        continue;
      }

      const name = String(plugin.command).toLowerCase();
      plugin.__file = rel;
      plugin.category = plugin.category || rel.split(/[\\/]/)[0];
      plugin.aliases = (plugin.aliases || []).map((a) => String(a).toLowerCase());

      commands.set(name, plugin);
      for (const alias of plugin.aliases) aliases.set(alias, name);
      list.push(plugin);
    } catch (err) {
      failed++;
      logger.error({ file: rel, err: err.message }, 'فشل تحميل البلاگن');
    }
  }

  return { commands, aliases, list, events, failed };
}

export default loadPlugins;
