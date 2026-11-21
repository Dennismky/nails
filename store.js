// Where everything is kept.
// - On your computer: files in DATA_DIR (default ./data).
// - On Vercel: an Upstash Redis database (Vercel > Storage > Upstash for Redis), found through
//   KV_REST_API_URL + KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
//   STORE_PREFIX (default "elan:") keeps several websites apart in one database.
import fs from 'node:fs';
import path from 'node:path';
import { seedCourse } from './seed.js';

const CONTENT_KEYS = ['site', 'lessons', 'designs', 'classes', 'services', 'products'];
export const pickContent = (c) => Object.fromEntries(CONTENT_KEYS.map((k) => [k, c[k]]));

// Fill in anything an older save does not have yet.
function upgrade(c) {
  const seed = seedCourse();
  if (!c.site) c.site = { ...seed.site, ...(c.school || {}) };
  delete c.school;
  for (const k of ['lessons', 'designs', 'classes', 'services']) c[k] = c[k] || seed[k];
  c.products = c.products || [];
  return c;
}

export function createStore({ dataDir }) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? redisStore(url, token, process.env.STORE_PREFIX || 'elan:') : fileStore(dataDir);
}

// ---------- Redis (Upstash REST API, no extra packages) ----------
function redisStore(url, token, P) {
  async function cmd(...args) {
    const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error('Database error: ' + (j.error || r.status));
    return j.result;
  }
  const getJson = async (k) => { const v = await cmd('GET', P + k); return v ? JSON.parse(v) : null; };
  const setJson = (k, v) => cmd('SET', P + k, JSON.stringify(v));
  async function many(setKey, prefix) {
    const ids = await cmd('SMEMBERS', P + setKey);
    if (!ids || !ids.length) return [];
    const vals = await cmd('MGET', ...ids.map((id) => P + prefix + id));
    return vals.filter(Boolean).map((v) => JSON.parse(v));
  }
  return {
    kind: 'redis',
    async getContent() {
      const c = await getJson('content');
      if (c) return upgrade(c);
      const seed = seedCourse();
      await setJson('content', seed);
      return seed;
    },
    setContent: (c) => setJson('content', pickContent(c)),
    getStudent: (id) => getJson('student:' + id),
    async findStudentByGoogle(sub) { const id = await cmd('GET', P + 'google:' + sub); return id ? getJson('student:' + id) : null; },
    async saveStudent(s) {
      await setJson('student:' + s.id, s);
      await cmd('SET', P + 'google:' + s.googleId, s.id);
      await cmd('SADD', P + 'students', s.id);
    },
    listStudents: () => many('students', 'student:'),
    async deleteStudent(s) { await cmd('DEL', P + 'student:' + s.id, P + 'google:' + s.googleId); await cmd('SREM', P + 'students', s.id); },
    async nextOrderNumber() { return 'M-' + (1000 + Number(await cmd('INCR', P + 'orderseq'))); },
    getOrder: (id) => getJson('order:' + id),
    async saveOrder(o) { await setJson('order:' + o.id, o); await cmd('SADD', P + 'orders', o.id); },
    listOrders: () => many('orders', 'order:'),
    putUpload: (name, buf) => cmd('SET', P + 'upload:' + name, buf.toString('base64')),
    async getUpload(name) { const v = await cmd('GET', P + 'upload:' + name); return v ? Buffer.from(v, 'base64') : null; },
  };
}

// ---------- files (your computer, or any host with a disk) ----------
function fileStore(dir) {
  const uploads = path.join(dir, 'uploads');
  fs.mkdirSync(uploads, { recursive: true });
  const file = (n) => path.join(dir, n);
  const read = (n, d) => { try { return JSON.parse(fs.readFileSync(file(n), 'utf8')); } catch { return d; } };
  const write = (n, v) => { const t = file(n) + '.tmp'; fs.writeFileSync(t, JSON.stringify(v, null, 2)); fs.renameSync(t, file(n)); };
  let content = read('course.json', null);
  if (!content) { content = seedCourse(); write('course.json', content); } else content = upgrade(content);
  let students = read('students.json', []);
  let orders = read('orders.json', []);
  const copy = (v) => (v ? JSON.parse(JSON.stringify(v)) : v);
  return {
    kind: 'files',
    async getContent() { return copy(content); },
    async setContent(c) { content = pickContent(c); write('course.json', content); },
    async getStudent(id) { return copy(students.find((s) => s.id === id) || null); },
    async findStudentByGoogle(sub) { return copy(students.find((s) => s.googleId === sub) || null); },
    async saveStudent(s) { const i = students.findIndex((x) => x.id === s.id); if (i < 0) students.push(copy(s)); else students[i] = copy(s); write('students.json', students); },
    async listStudents() { return copy(students); },
    async deleteStudent(s) { students = students.filter((x) => x.id !== s.id); write('students.json', students); },
    async nextOrderNumber() { return 'M-' + (1001 + orders.length); },
    async getOrder(id) { return copy(orders.find((o) => o.id === id) || null); },
    async saveOrder(o) { const i = orders.findIndex((x) => x.id === o.id); if (i < 0) orders.push(copy(o)); else orders[i] = copy(o); write('orders.json', orders); },
    async listOrders() { return copy(orders); },
    async putUpload(name, buf) { fs.writeFileSync(path.join(uploads, name), buf); },
    async getUpload(name) { try { return fs.readFileSync(path.join(uploads, path.basename(name))); } catch { return null; } },
  };
}
