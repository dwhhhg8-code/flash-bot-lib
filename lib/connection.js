import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  jidNormalizedUser,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import settings from '../settings.js';
import logger from './logger.js';
import { t } from './function.js';

/**
 * ينشئ اتصال واتساب ويرجّع الـ socket.
 * onMessage(m) تُنادى لكل رسالة جديدة.
 * events: مستمعو الأحداث من البلاگنات.
 */
export async function connect(onMessage, events = []) {
  const { state, saveCreds } = await useMultiFileAuthState(settings.sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: logger.child({ module: 'baileys' }, { level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
  });

  // الربط بكود بدل QR
  if (settings.usePairingCode && settings.pairingNumber && !sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(settings.pairingNumber);
        logger.info(t('pairing_code', { code }));
      } catch (err) {
        logger.error({ err: err.message }, 'فشل طلب كود الربط');
      }
    }, 3000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !settings.usePairingCode) {
      logger.info(t('scan_qr'));
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      logger.info(t('connected'));
      sock.user.id = jidNormalizedUser(sock.user.id);
    }

    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        logger.error(t('logged_out'));
        process.exit(1);
      } else {
        logger.warn(t('disconnected'));
        setTimeout(() => connect(onMessage, events), 3000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const raw of messages) {
      if (!raw.message || raw.key.remoteJid === 'status@broadcast') continue;
      try {
        await onMessage(sock, raw);
      } catch (err) {
        logger.error({ err: err.message }, 'خطأ في معالجة رسالة');
      }
    }
  });

  // ربط مستمعي الأحداث من البلاگنات (ترحيب، مغادرة...)
  for (const listener of events) {
    sock.ev.on(listener.event, (...args) => {
      Promise.resolve(listener.onEvent(sock, ...args)).catch((err) =>
        logger.error({ event: listener.event, err: err.message }, 'خطأ في مستمع الحدث'),
      );
    });
  }

  return sock;
}

export default connect;
