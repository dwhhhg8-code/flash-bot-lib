import { toSticker } from '../../lib/sticker.js';

export default {
  command: 'sticker',
  aliases: ['s', 'ستيكر', 'ملصق'],
  category: 'tools',
  cooldown: 5,
  async run({ m, t }) {
    // الميديا: من الرسالة نفسها أو من المردود عليها
    const target = m.isMedia ? m : m.quoted?.isMedia ? m.quoted : null;
    if (!target) return m.reply({ text: t('need_media') });

    await m.reply({ text: t('processing') });
    try {
      const buffer = await target.download();
      const webp = await toSticker(buffer, { pack: 'FLASH BOT', author: 'FLASH' });
      await m.send({ sticker: webp });
    } catch (err) {
      await m.reply({ text: `⚠️ ${err.message}` });
    }
  },
};
