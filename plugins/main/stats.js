export default {
  command: 'stats',
  aliases: ['احصائيات', 'الحالة'],
  category: 'main',
  cooldown: 5,
  async run({ m, registry, t }) {
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const min = Math.floor((uptime % 3600) / 60);
    const sec = Math.floor(uptime % 60);
    const mem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

    await m.reply({
      text:
        `📊 *إحصائيات ${'FLASH BOT'}*\n\n` +
        `⏱️ مدة التشغيل: ${h}س ${min}د ${sec}ث\n` +
        `💾 الذاكرة: ${mem} MB\n` +
        `🧩 الأوامر: ${registry.commands.size}\n` +
        `🔤 الاختصارات: ${registry.aliases.size}\n` +
        `👂 المستمعون: ${registry.events.length}\n` +
        `🟢 Node: ${process.version}`,
    });
  },
};
