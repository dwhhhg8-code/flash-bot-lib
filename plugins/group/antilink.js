export default {
  command: 'antilink',
  aliases: ['مكافحة_الروابط'],
  category: 'group',
  group: true,
  admin: true,
  cooldown: 3,
  async run({ sock, m, args, db, t }) {
    const state = (args[0] || '').toLowerCase();
    const on = ['on', 'تشغيل', '1', 'true'].includes(state);
    const off = ['off', 'ايقاف', '0', 'false'].includes(state);

    if (!on && !off) {
      const current = db.group(m.chat).antilink;
      return m.reply({ text: `📎 الحالة الحالية: *${current ? 'مفعّل ✅' : 'متوقف ❌'}*\nالاستخدام: ${'.antilink on|off'}` });
    }

    db.setGroup(m.chat, 'antilink', on);
    await m.reply({ text: on ? t('antilink_on') : t('antilink_off') });
  },
};
