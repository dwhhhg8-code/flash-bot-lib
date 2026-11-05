import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';

// pino-pretty اختياري: نستخدمه لو متثبّت، وإلا نرجع لـ pino العادي
let transport;
try {
  await import('pino-pretty');
  transport = {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
  };
} catch {
  transport = undefined;
}

export const logger = pino({ level, ...(transport ? { transport } : {}) });

export default logger;
