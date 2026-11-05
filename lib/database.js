import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import settings from '../settings.js';

const dir = settings.databaseDir;
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const cache = new Map();

function pathFor(name) {
  return join(dir, `${name}.json`);
}

function read(name, fallback) {
  if (cache.has(name)) return cache.get(name);
  const file = pathFor(name);
  let value = fallback;
  if (existsSync(file)) {
    try {
      value = JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      value = fallback;
    }
  }
  cache.set(name, value);
  return value;
}

function write(name, value) {
  cache.set(name, value);
  writeFileSync(pathFor(name), JSON.stringify(value, null, 2));
}

export const db = {
  /** قراءة كامل الملف */
  get: (name, fallback = {}) => read(name, fallback),

  /** كتابة كامل الملف */
  set: (name, value) => write(name, value),

  /** قراءة مفتاح داخل ملف */
  getKey: (name, key, fallback = null) => {
    const data = read(name, {});
    return data[key] ?? fallback;
  },

  /** تعيين مفتاح داخل ملف */
  setKey: (name, key, value) => {
    const data = read(name, {});
    data[key] = value;
    write(name, data);
    return value;
  },

  /** حذف مفتاح */
  delKey: (name, key) => {
    const data = read(name, {});
    delete data[key];
    write(name, data);
  },

  /** إعدادات جروب — مع القيم الافتراضية */
  group: (jid) => ({ ...settings.groupDefaults, ...(read('groups', {})[jid] || {}) }),

  setGroup: (jid, key, value) => {
    const groups = read('groups', {});
    groups[jid] = { ...(groups[jid] || {}), [key]: value };
    write('groups', groups);
    return value;
  },

  /** مستخدم — عدّاد الأوامر والمستوى */
  user: (jid) => read('users', {})[jid] || { commands: 0, level: 0, banned: false },

  setUser: (jid, patch) => {
    const users = read('users', {});
    users[jid] = { ...(users[jid] || {}), ...patch };
    write('users', users);
    return users[jid];
  },
};

export default db;
