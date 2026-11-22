// Élan Beauty: the website's request handler, with no dependencies (Node 18+).
// Used by server.js on your computer and by api/index.js on Vercel.

import tls from 'node:tls';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { seedCourse } from './seed.js';
import { createStore } from './store.js';
import './public/core.js';

const C = globalThis.MNACore;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const ON_VERCEL = !!process.env.VERCEL;
export const PORT = Number(process.env.PORT) || 4000;
export const BASE_URL = (process.env.BASE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : `http://localhost:${PORT}`)).replace(/\/$/, '');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
// Optional: when set, only this password can change the brand (colours, fonts, logo). Keep it when you sell a site.
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || '';
const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const SECRET = process.env.SESSION_SECRET || crypto.createHash('sha256').update('maridadi:' + ADMIN_PASSWORD + GOOGLE_SECRET).digest('hex');
const SECURE = BASE_URL.startsWith('https://');
const GOOGLE_READY = !!(GOOGLE_ID && GOOGLE_SECRET);
// Test sign-in ("Sign in" makes a test student) while Google sign-in is not set up:
// always on localhost, and online only when TEST_SIGNIN=1 is set. Turn it off before real students arrive.
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE_URL);
const TEST_LOGIN = !GOOGLE_READY && (LOCAL || process.env.TEST_SIGNIN === '1');

const store = createStore({ dataDir: path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data')) });
export function startupNotes() {
  const notes = [];
  if (!ADMIN_PASSWORD) notes.push('ADMIN_PASSWORD is not set, so admin login is off.');
  if (TEST_LOGIN) notes.push(`Google sign-in is not set up, so "Sign in" makes a TEST student${LOCAL ? ' (localhost only)' : ' (TEST_SIGNIN=1)'}.`);
  else if (!GOOGLE_READY) notes.push('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set, so "Sign in with Google" is off.');
  if (!process.env.SMTP_HOST) notes.push('SMTP_HOST is not set, so emails are off (new students still show in Admin > Students).');
  if (ON_VERCEL && store.kind !== 'redis') notes.push('No database connected: add Upstash Redis in Vercel > Storage, or nothing will be saved.');
  notes.push(`Storage: ${store.kind}.`);
  return notes;
}
const newId = () => crypto.randomBytes(6).toString('hex');
const newStudent = (fields) => ({ id: newId(), picture: '', phone: '', location: '', enrolled: false, createdAt: Date.now(), enrolledAt: null, lastLogin: Date.now(),
  unlockAll: false, unlocked: { lessons: [], designs: [] }, progress: {}, ...fields });

// ---------- signed cookies ----------
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return body + '.' + crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
}
function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const good = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (mac.length !== good.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(good))) return null;
  try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.exp > Date.now() ? p : null; } catch { return null; }
}
function cookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
const cookie = (name, value, maxAge, sameSite = 'Lax') => `${name}=${value}; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=${maxAge}${SECURE ? '; Secure' : ''}`;
const adminRole = (req) => verify(cookies(req).mna_admin)?.role;
const isAdmin = (req) => ['admin', 'owner'].includes(adminRole(req));
const canBrand = (req) => adminRole(req) === 'owner' || (!OWNER_PASSWORD && isAdmin(req));
async function currentStudent(req) {
  const p = verify(cookies(req).mna_user);
  return p ? store.getStudent(p.sid) : null;
}

// ---------- admin password ----------
function same(given, real) {
  if (!real || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(real).digest();
  return crypto.timingSafeEqual(a, b);
}
const attempts = new Map();
const tooMany = (ip) => { const a = attempts.get(ip); return a && a.count >= 5 && a.until > Date.now(); };
function failed(ip) {
  const a = attempts.get(ip) || { count: 0, until: 0 };
  if (a.until < Date.now()) a.count = 0;
  a.count++; a.until = Date.now() + 10 * 60 * 1000;
  attempts.set(ip, a);
}

// ---------- email (SMTP over TLS, e.g. Gmail with an App Password) ----------
function sendMail({ to, subject, text, from = 'Élan Beauty' }) {
  const host = process.env.SMTP_HOST, port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  if (!host || !user || !pass || !to) return Promise.resolve({ skipped: true });
  const clean = (s) => String(s).replace(/[\r\n]+/g, ' ').trim();
  const b64 = (s) => Buffer.from(s).toString('base64');
  const body = String(text).replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');
  const message = [
    `From: ${clean(from)} <${clean(user)}>`, `To: <${clean(to)}>`,
    `Subject: =?UTF-8?B?${b64(clean(subject))}?=`, `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${newId()}.${Date.now()}@${clean(host)}>`,
    'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: 8bit', '', body, '.',
  ].join('\r\n');
  return new Promise((resolve, reject) => {
    const sock = tls.connect({ host, port, servername: host });
    let buf = '', waiter = null;
    sock.setEncoding('utf8');
    sock.setTimeout(20000, () => { sock.destroy(); reject(new Error('Email server did not answer in time.')); });
    sock.on('error', reject);
    const check = () => {
      if (!waiter) return;
      const lines = buf.split('\r\n');
      for (let i = 0; i < lines.length - 1; i++) {
        if (/^\d{3} /.test(lines[i])) { const reply = lines.slice(0, i + 1).join('\n'); buf = lines.slice(i + 1).join('\r\n'); const w = waiter; waiter = null; w(reply); return; }
      }
    };
    sock.on('data', (d) => { buf += d; check(); });
    const cmd = async (line, expect) => {
      if (line != null) sock.write(line + '\r\n');
      const reply = await new Promise((r) => { waiter = r; check(); });
      if (!reply.startsWith(String(expect))) throw new Error('Email server said: ' + reply.slice(0, 200));
    };
    (async () => {
      await cmd(null, 220); await cmd('EHLO maridadi', 250);
      await cmd('AUTH LOGIN', 334); await cmd(b64(user), 334); await cmd(b64(pass), 235);
      await cmd(`MAIL FROM:<${clean(user)}>`, 250); await cmd(`RCPT TO:<${clean(to)}>`, 250);
      await cmd('DATA', 354); await cmd(message, 250);
      sock.end('QUIT\r\n'); resolve({ sent: true });
    })().catch((e) => { sock.destroy(); reject(e); });
  });
}
const adminInbox = (db) => process.env.ADMIN_EMAIL || db.site.email;
// Emails are awaited (a serverless function may stop as soon as it answers), but a failure never blocks the student.
async function enrollmentEmail(db, s) {
  const lines = [
    'A new student has enrolled.', '',
    `Name:      ${s.name}`, `Email:     ${s.email}`, `Phone:     ${s.phone || '-'}`, `Location:  ${s.location || '-'}`,
    `WhatsApp:  ${C.waNumber(s.phone) ? 'https://wa.me/' + C.waNumber(s.phone) : '-'}`, `Enrolled:  ${new Date(s.enrolledAt).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}`, '',
    `Open their details and unlock lessons: ${BASE_URL}/admin`,
  ];
  await sendMail({ to: adminInbox(db), from: db.site.name, subject: `New student enrolled: ${s.name}`, text: lines.join('\n') })
    .then((r) => r.skipped || console.log('Enrollment email sent for', s.email))
    .catch((e) => console.error('Enrollment email failed:', e.message));
}

async function orderEmail(db, o) {
  const text = ['A new order has come in.', '', C.orderText(o), '', `Customer:  ${o.name}`, `Phone:     ${o.phone || '-'}`, `Email:     ${o.email}`, `Location:  ${o.location || '-'}`,
    `WhatsApp:  ${C.waNumber(o.phone) ? 'https://wa.me/' + C.waNumber(o.phone) : '-'}`, '', `See all orders: ${BASE_URL}/admin`].join('\n');
  await sendMail({ to: adminInbox(db), from: db.site.name, subject: `New order ${o.number} from ${o.name}: ${C.ksh(o.total)}`, text })
    .catch((e) => console.error('Order email failed:', e.message));
}

// ---------- Google sign-in (OAuth 2.0 authorization code flow) ----------
async function googleCallback(req, res, url) {
  const fail = (why) => { console.warn('Google sign-in failed:', why); redirect(res, '/#signin-failed'); };
  const state = verify(cookies(req).mna_state);
  if (!state || state.nonce !== url.searchParams.get('state')) return fail('state did not match');
  const code = url.searchParams.get('code');
  if (!code) return fail(url.searchParams.get('error') || 'no code');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: GOOGLE_ID, client_secret: GOOGLE_SECRET, redirect_uri: BASE_URL + '/auth/google/callback', grant_type: 'authorization_code' }),
  });
  const tok = await r.json().catch(() => ({}));
  if (!r.ok || !tok.id_token) return fail(tok.error_description || tok.error || 'no id_token');
  // The token came straight from Google over TLS, so its claims can be read without re-checking the signature.
  let claims;
  try { claims = JSON.parse(Buffer.from(tok.id_token.split('.')[1], 'base64url').toString()); } catch { return fail('bad id_token'); }
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss) || claims.aud !== GOOGLE_ID || claims.exp * 1000 < Date.now()) return fail('claims');
  if (!claims.email || claims.email_verified === false) return fail('email not verified');

  let s = await store.findStudentByGoogle(claims.sub);
  if (!s) s = newStudent({ googleId: claims.sub, email: claims.email, name: claims.name || claims.email.split('@')[0], picture: claims.picture || '' });
  else Object.assign(s, { email: claims.email, picture: claims.picture || s.picture, lastLogin: Date.now() });
  await store.saveStudent(s);
  res.writeHead(302, {
    Location: s.enrolled ? '/#art' : '/#enroll',
    'Set-Cookie': [cookie('mna_user', sign({ sid: s.id, exp: Date.now() + 30 * 86400e3 }), 30 * 86400), cookie('mna_state', '', 0)],
  });
  res.end();
}

// ---------- http helpers ----------
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https:; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': CSP, ...(SECURE ? { 'Strict-Transport-Security': 'max-age=31536000' } : {}) };
function send(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...HEADERS, ...headers });
  res.end(JSON.stringify(data));
}
function redirect(res, to, headers = {}) { res.writeHead(302, { Location: to, ...headers }); res.end(); }
function readJson(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('too big')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); } catch { reject(new Error('bad json')); } });
    req.on('error', reject);
  });
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };
function serveFile(res, rel, fallback) {
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC + path.sep)) return send(res, 403, { error: 'Forbidden' });
  fs.readFile(file, (err, buf) => {
    if (err) return fallback ? fallback() : send(res, 404, { error: 'Not found' });
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', ...HEADERS });
    res.end(buf);
  });
}
async function serveUpload(res, name) {
  if (!/^[a-z0-9]{8,40}\.(jpg|png|webp)$/.test(name)) return send(res, 404, { error: 'Not found' });
  const buf = await store.getUpload(name);
  if (!buf) return send(res, 404, { error: 'Not found' });
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(name)], 'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable', ...HEADERS });
  res.end(buf);
}

async function saveUpload(dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) throw new Error('Please choose a JPG, PNG or WebP photo.');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 3_000_000) throw new Error('That photo is too large. Use one under 3 MB.');
  const magic = { jpeg: [0xff, 0xd8, 0xff], png: [0x89, 0x50, 0x4e, 0x47], webp: [0x52, 0x49, 0x46, 0x46] }[m[1]];
  if (!magic.every((b, i) => buf[i] === b)) throw new Error('That file is not a real image.');
  const name = crypto.randomBytes(10).toString('hex') + '.' + (m[1] === 'jpeg' ? 'jpg' : m[1]);
  await store.putUpload(name, buf);
  return '/uploads/' + name;
}

const KINDS = { lessons: C.cleanLesson, designs: C.cleanDesign, classes: C.cleanClass, services: C.cleanService, products: C.cleanProduct };
const KIND_RE = '(lessons|designs|classes|services|products)';

// ---------- API ----------
async function api(req, res, url) {
  const m = req.method, p = url.pathname;
  const ip = (ON_VERCEL && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket?.remoteAddress || '';
  // Changes must come as JSON from this site: blocks cross-site form posts.
  if (m !== 'GET' && !(req.headers['content-type'] || '').startsWith('application/json')) return send(res, 415, { error: 'Send JSON.' });
  let db = await store.getContent();
  const saveContent = () => store.setContent(db);
  const me = await currentStudent(req);
  const saveMe = () => store.saveStudent(me);
  let r;

  if (m === 'GET' && p === '/api/catalog') return send(res, 200, { ...C.catalog(db, me), googleReady: !!(GOOGLE_ID && GOOGLE_SECRET) });
  if ((r = p.match(/^\/api\/lessons\/([\w-]+)$/)) && m === 'GET') { const out = C.lessonFor(db, me, r[1]); return send(res, out.status, out); }
  if ((r = p.match(/^\/api\/lessons\/([\w-]+)\/submit$/)) && m === 'POST') {
    const l = db.lessons.find((x) => x.id === r[1] && x.published);
    if (!l) return send(res, 404, { error: 'Lesson not found.' });
    if (!C.canOpen('lessons', l, me)) return send(res, 403, { error: 'This lesson is locked.' });
    const { answers } = await readJson(req);
    const out = C.grade(l, Array.isArray(answers) ? answers.map(Number) : []);
    C.recordScore(me, l.id, out.score); await saveMe();
    return send(res, 200, { ...out, progress: me.progress[l.id] });
  }
  if ((r = p.match(/^\/api\/designs\/([\w-]+)$/)) && m === 'GET') { const out = C.designFor(db, me, r[1]); return send(res, out.status, out); }
  if (m === 'POST' && p === '/api/enroll') {
    if (!me) return send(res, 401, { error: 'Please sign in with Google first.' });
    const b = await readJson(req);
    const phone = C.str(b.phone, 40), name = C.str(b.name, 80) || me.name, location = C.str(b.location, 120);
    if (phone.replace(/\D/g, '').length < 9) return send(res, 400, { error: 'Please enter a phone number we can reach you on.' });
    const first = !me.enrolled;
    Object.assign(me, { name, phone, location, enrolled: true, enrolledAt: me.enrolledAt || Date.now() });
    await saveMe();
    if (first) await enrollmentEmail(db, me);
    return send(res, 200, { me: C.publicUser(me) });
  }
  if (m === 'POST' && p === '/api/orders') {
    const b = await readJson(req);
    const check = C.buildOrder(db, me, b.items, b.note, '');
    if (check.error) return send(res, me ? 400 : 401, { error: check.error });
    const out = C.buildOrder(db, me, b.items, b.note, await store.nextOrderNumber());
    await store.saveOrder(out.order);
    await orderEmail(db, out.order);
    return send(res, 201, { order: out.order });
  }
  if (m === 'GET' && p === '/api/orders/mine') {
    if (!me) return send(res, 401, { error: 'Please sign in.' });
    return send(res, 200, (await store.listOrders()).filter((o) => o.studentId === me.id).sort((a, b) => b.createdAt - a.createdAt).slice(0, 30));
  }
  if (m === 'POST' && p === '/api/logout') return send(res, 200, { ok: true }, { 'Set-Cookie': cookie('mna_user', '', 0) });

  // ----- admin -----
  if (m === 'POST' && p === '/api/admin/login') {
    if (tooMany(ip)) return send(res, 429, { error: 'Too many tries. Wait 10 minutes and try again.' });
    if (!ADMIN_PASSWORD) return send(res, 503, { error: 'Admin login is off: set ADMIN_PASSWORD when starting the server.' });
    const { password } = await readJson(req);
    const role = same(password, OWNER_PASSWORD) ? 'owner' : same(password, ADMIN_PASSWORD) ? 'admin' : null;
    if (!role) { failed(ip); return send(res, 401, { error: 'Wrong password.' }); }
    attempts.delete(ip);
    return send(res, 200, { ok: true, role }, { 'Set-Cookie': cookie('mna_admin', sign({ role, exp: Date.now() + 12 * 3600e3 }), 12 * 3600, 'Strict') });
  }
  if (m === 'POST' && p === '/api/admin/logout') return send(res, 200, { ok: true }, { 'Set-Cookie': cookie('mna_admin', '', 0, 'Strict') });
  if (m === 'GET' && p === '/api/admin/me') return send(res, 200, { admin: isAdmin(req) });
  if (!p.startsWith('/api/admin/')) return send(res, 404, { error: 'Unknown request.' });
  if (!isAdmin(req)) return send(res, 401, { error: 'Please log in as admin.' });

  if (m === 'GET' && p === '/api/admin/data') return send(res, 200, { ...db, canBrand: canBrand(req), emailReady: !!process.env.SMTP_HOST, googleReady: GOOGLE_READY, testSignin: TEST_LOGIN, storage: store.kind, onVercel: ON_VERCEL });
  // Site details never change the brand; the brand has its own save (owner only when OWNER_PASSWORD is set).
  if (m === 'PUT' && p === '/api/admin/site') { db.site = C.cleanSite({ ...(await readJson(req)), theme: db.site.theme, logo: db.site.logo, heroImage: db.site.heroImage }); await saveContent(); return send(res, 200, db.site); }
  if (m === 'PUT' && p === '/api/admin/brand') {
    if (!canBrand(req)) return send(res, 403, { error: 'Only the owner can change the colours and logo.' });
    const b = await readJson(req);
    db.site = C.cleanSite({ ...db.site, theme: b.theme, logo: b.logo, heroImage: b.heroImage, name: b.name || db.site.name });
    await saveContent(); return send(res, 200, db.site);
  }
  if (m === 'POST' && p === '/api/admin/upload') { const { dataUrl } = await readJson(req, 9_000_000); return send(res, 201, { url: await saveUpload(dataUrl) }); }

  if (m === 'DELETE' && p === '/api/admin/designs') { db.designs = []; await saveContent(); return send(res, 200, { ok: true }); }
  if ((r = p.match(new RegExp(`^/api/admin/${KIND_RE}$`))) && m === 'POST') {
    const item = KINDS[r[1]](await readJson(req), newId());
    db[r[1]].push(item); await saveContent();
    return send(res, 201, item);
  }
  if ((r = p.match(new RegExp(`^/api/admin/${KIND_RE}/([\\w-]+)$`)))) {
    const list = db[r[1]], i = list.findIndex((x) => x.id === r[2]);
    if (i < 0) return send(res, 404, { error: 'Not found.' });
    if (m === 'PUT') { list[i] = KINDS[r[1]](await readJson(req), r[2]); await saveContent(); return send(res, 200, list[i]); }
    if (m === 'DELETE') { list.splice(i, 1); await saveContent(); return send(res, 200, { ok: true }); }
  }
  if ((r = p.match(new RegExp(`^/api/admin/order/${KIND_RE}$`))) && m === 'PUT') {
    const { ids } = await readJson(req);
    if (!Array.isArray(ids)) return send(res, 400, { error: 'ids must be a list.' });
    const byId = new Map(db[r[1]].map((x) => [x.id, x]));
    db[r[1]] = [...ids.map((id) => byId.get(id)).filter(Boolean), ...db[r[1]].filter((x) => !ids.includes(x.id))];
    await saveContent();
    return send(res, 200, { ok: true });
  }

  if (m === 'GET' && p === '/api/admin/students') return send(res, 200, (await store.listStudents()).map((s) => C.studentRow(db, s)).sort((a, b) => (b.enrolledAt || b.createdAt) - (a.enrolledAt || a.createdAt)));
  if ((r = p.match(/^\/api\/admin\/students\/([\w-]+)$/))) {
    const s = await store.getStudent(r[1]);
    if (!s) return send(res, 404, { error: 'Student not found.' });
    if (m === 'GET') return send(res, 200, C.studentDetail(db, s));
    if (m === 'PUT') {
      const b = await readJson(req);
      if (typeof b.unlockAll === 'boolean') s.unlockAll = b.unlockAll;
      for (const k of ['lessons', 'designs']) if (Array.isArray(b.unlocked?.[k])) s.unlocked[k] = b.unlocked[k].filter((id) => typeof id === 'string').slice(0, 500);
      await store.saveStudent(s);
      return send(res, 200, C.studentDetail(db, s));
    }
    if (m === 'DELETE') { await store.deleteStudent(s); return send(res, 200, { ok: true }); }
  }
  if (m === 'GET' && p === '/api/admin/orders') return send(res, 200, (await store.listOrders()).sort((a, b) => b.createdAt - a.createdAt));
  if ((r = p.match(/^\/api\/admin\/orders\/([\w-]+)$/)) && m === 'PUT') {
    const o = await store.getOrder(r[1]);
    if (!o) return send(res, 404, { error: 'Order not found.' });
    const { status } = await readJson(req);
    if (!['new', 'confirmed', 'delivered', 'cancelled'].includes(status)) return send(res, 400, { error: 'Unknown status.' });
    o.status = status; await store.saveOrder(o);
    return send(res, 200, o);
  }
  if (m === 'POST' && p === '/api/admin/test-email') {
    if (!process.env.SMTP_HOST) return send(res, 400, { error: 'Email is not set up yet. See "Enrollment emails" in README.md.' });
    try { await sendMail({ to: adminInbox(db), from: db.site.name, subject: 'Test email from your nail academy', text: 'Email is working. You will get a message like this each time a student enrolls.' }); return send(res, 200, { ok: true, to: adminInbox(db) }); }
    catch (e) { return send(res, 502, { error: e.message }); }
  }
  if (m === 'PUT' && p === '/api/admin/import') {
    const d = await readJson(req, 20_000_000);
    if (!d || !Array.isArray(d.lessons)) return send(res, 400, { error: 'That file is not a course backup.' });
    const keep = (x) => (/^[\w-]{1,40}$/.test(x.id || '') ? x.id : newId());
    db = { site: C.cleanSite({ ...(d.site || d.school || db.site), ...(canBrand(req) ? {} : { theme: db.site.theme, logo: db.site.logo }) }), lessons: d.lessons.map((x) => C.cleanLesson(x, keep(x))),
      designs: (d.designs || []).map((x) => C.cleanDesign(x, keep(x))), classes: (d.classes || []).map((x) => C.cleanClass(x, keep(x))),
      services: (d.services || []).map((x) => C.cleanService(x, keep(x))), products: (d.products || []).map((x) => C.cleanProduct(x, keep(x))) };
    await saveContent();
    return send(res, 200, { ok: true });
  }
  if (m === 'POST' && p === '/api/admin/reset') { const s = seedCourse(); db = { ...s, site: db.site, products: db.products }; await saveContent(); return send(res, 200, { ok: true }); }
  return send(res, 404, { error: 'Unknown request.' });
}

// One handler for both: your computer (server below) and Vercel (api/index.js).
export async function handler(req, res) {
  const url = new URL(req.url, 'http://x');
  // On Vercel, vercel.json sends these paths to one function and passes the original path as ?__p=
  if (url.searchParams.has('__p')) { url.pathname = url.searchParams.get('__p'); url.searchParams.delete('__p'); }
  const p = url.pathname;
  try {
    if (p.startsWith('/api/')) return await api(req, res, url);
    if (p === '/auth/google' && TEST_LOGIN) {
      if (LOCAL && !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(String(req.headers.host || ''))) return redirect(res, '/#signin-off');
      const n = (await store.listStudents()).filter((x) => String(x.googleId).startsWith('test-')).length + 1;
      const s = newStudent({ googleId: 'test-' + newId(), email: `test${n}@example.com`, name: `Test Student ${n}` });
      await store.saveStudent(s);
      res.writeHead(302, { Location: '/#enroll', 'Set-Cookie': cookie('mna_user', sign({ sid: s.id, exp: Date.now() + 30 * 86400e3 }), 30 * 86400) });
      return res.end();
    }
    if (p === '/auth/google') {
      if (!GOOGLE_READY) return redirect(res, '/#signin-off');
      const nonce = crypto.randomBytes(16).toString('hex');
      const q = new URLSearchParams({ client_id: GOOGLE_ID, redirect_uri: BASE_URL + '/auth/google/callback', response_type: 'code', scope: 'openid email profile', state: nonce, prompt: 'select_account' });
      return redirect(res, 'https://accounts.google.com/o/oauth2/v2/auth?' + q, { 'Set-Cookie': cookie('mna_state', sign({ nonce, exp: Date.now() + 600e3 }), 600) });
    }
    if (p === '/auth/google/callback') return await googleCallback(req, res, url);
    if (p === '/theme.css') {
      const db = await store.getContent();
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-cache', ...HEADERS });
      return res.end(C.themeCss(db.site.theme));
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed' });
    if (p.startsWith('/uploads/')) return await serveUpload(res, decodeURIComponent(p.slice(9)));
    const rel = p === '/' ? 'index.html' : p === '/admin' || p === '/admin/' ? 'admin.html' : decodeURIComponent(p.slice(1));
    serveFile(res, rel, () => serveFile(res, 'index.html'));
  } catch (e) {
    console.error(e);
    send(res, 400, { error: e.message === 'too big' ? 'That is too large.' : e.message === 'bad json' ? 'Something in that request was not right.' : e.message });
  }
}
