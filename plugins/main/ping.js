export default {
  command: 'ping',
  aliases: ['p', 'بنق'],
  category: 'main',
  cooldown: 3,
  async run({ m }) {
    const start = Date.now();
    await m.reply({ text: '🏓 Pong!' });
    const ms = Date.now() - start;
    await m.send({ text: `⚡ السرعة: *${ms}ms*` });
  },
};
