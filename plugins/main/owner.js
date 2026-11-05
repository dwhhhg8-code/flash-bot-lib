export default {
  command: 'owner',
  aliases: ['المالك', 'مطور'],
  category: 'main',
  cooldown: 3,
  async run({ m, settings }) {
    const num = settings.ownerNumber || 'غير محدد';
    await m.reply({
      text: `👑 *المالك*\n\n📞 الرقم: wa.me/${num}\n🤖 البوت: *${settings.botName}*`,
    });
  },
};
