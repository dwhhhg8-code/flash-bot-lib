export default {
  command: 'eval',
  aliases: ['>'],
  category: 'owner',
  owner: true,
  cooldown: 0,
  async run({ m, args, sock, registry }) {
    const code = args.join(' ');
    if (!code) return m.reply({ text: 'الاستخدام: .eval <كود>' });

    try {
      const { inspect } = await import('node:util');
      let result = await eval(`(async () => { ${code} })()`);
      if (typeof result !== 'string') result = inspect(result, { depth: 1 });
      await m.reply({ text: `✅ النتيجة:\n\`\`\`${result}\`\`\`` });
    } catch (err) {
      await m.reply({ text: `❌ خطأ:\n\`\`\`${err.message}\`\`\`` });
    }
  },
};
