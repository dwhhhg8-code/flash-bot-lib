export default {
  command: 'welcome',
  aliases: ['ترحيب'],
  category: 'group',
  group: true,
  admin: true,
  cooldown: 3,
  async run({ m, args, db, t }) {
    const state = (args[0] || '').toLowerCase();
    const on = ['on', 'تشغيل', '1', 'true'].includes(state);
    const off = ['off', 'ايقاف', '0', 'false'].includes(state);

    if (!on && !off) {
      const current = db.group(m.chat).welcome;
      return m.reply({ text: `👋 الحالة الحالية: *${current ? 'مفعّل ✅' : 'متوقف ❌'}*\nالاستخدام: ${'.welcome on|off'}` });
    }

    db.setGroup(m.chat, 'welcome', on);
    await m.reply({ text: on ? t('welcome_on') : t('welcome_off') });
  },
};
