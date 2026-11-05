import settings from '../../settings.js';

export default {
  command: 'menu',
  aliases: ['help', 'الاوامر', 'مساعدة'],
  category: 'main',
  cooldown: 3,
  async run({ m, registry, t }) {
    const byCategory = new Map();
    for (const plugin of registry.list) {
      const cat = plugin.category || 'other';
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(plugin);
    }

    let out = `╭━━━〔 *${t('menu_title', { bot: settings.botName })}* 〕━━━\n`;
    out += `┃ ${t('menu_total', { count: registry.commands.size })}\n`;
    out += `┃ ${t('menu_categories')}: ${byCategory.size}\n`;
    out += '╰━━━━━━━━━━━━━━━━━━━\n\n';

    for (const [cat, plugins] of byCategory) {
      out += `┌──「 *${cat}* 」\n`;
      for (const p of plugins) {
        const prefix = settings.prefix[0];
        out += `│ ${prefix}${p.command}\n`;
      }
      out += '└──────────────\n\n';
    }

    out += `_${settings.botName}_`;
    await m.reply({ text: out });
  },
};
