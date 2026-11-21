// Shared by the student site (app.js) and the admin panel (admin.js). Needs core.js loaded first.
(function () {
  const C = window.MNACore;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>');

  // Lesson text format: ## / ### headings, - and 1. lists, > Tip: callouts, **bold**, *italic*.
  function renderText(md) {
    const lines = String(md || '').replace(/\r/g, '').split('\n');
    const out = [];
    let list = null, para = [];
    const flushPara = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
    const flushList = () => { if (list) { out.push(`<${list.tag}>` + list.items.map((i) => '<li>' + inline(i) + '</li>').join('') + `</${list.tag}>`); list = null; } };
    for (const raw of lines) {
      const line = raw.trim();
      let m;
      if (!line) { flushPara(); flushList(); continue; }
      if ((m = line.match(/^(#{2,3})\s+(.*)$/))) { flushPara(); flushList(); out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); continue; }
      if ((m = line.match(/^>\s*(?:(tip|warning|kenya|note)\s*:)?\s*(.*)$/i))) {
        flushPara(); flushList();
        const kind = (m[1] || 'note').toLowerCase();
        const label = { tip: 'Tip', warning: 'Careful', kenya: 'In Kenya', note: 'Note' }[kind];
        out.push(`<div class="callout ${kind}"><b class="k">${label}</b><p>${inline(m[2])}</p></div>`);
        continue;
      }
      if ((m = line.match(/^[-•]\s+(.*)$/))) { flushPara(); if (!list || list.tag !== 'ul') { flushList(); list = { tag: 'ul', items: [] }; } list.items.push(m[1]); continue; }
      if ((m = line.match(/^\d+[.)]\s+(.*)$/))) { flushPara(); if (!list || list.tag !== 'ol') { flushList(); list = { tag: 'ol', items: [] }; } list.items.push(m[1]); continue; }
      flushList();
      para.push(line);
    }
    flushPara(); flushList();
    return out.join('\n');
  }

  function videoInfo(url) {
    if (!url) return null;
    let u;
    try { u = new URL(url); } catch { return null; }
    if (!/^https?:$/.test(u.protocol)) return null;
    const host = u.hostname.replace(/^www\.|^m\./, '');
    let id = null;
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
    else if (host.endsWith('youtube.com')) id = u.searchParams.get('v') || (u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{6,})/) || [])[1];
    if (id && /^[\w-]{6,20}$/.test(id)) return { kind: 'youtube', embed: 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0', href: u.href, host: 'YouTube' };
    if (host === 'vimeo.com') { const v = (u.pathname.match(/^\/(\d+)/) || [])[1]; if (v) return { kind: 'vimeo', embed: 'https://player.vimeo.com/video/' + v, href: u.href, host: 'Vimeo' }; }
    const names = { 'tiktok.com': 'TikTok', 'instagram.com': 'Instagram', 'drive.google.com': 'Google Drive' };
    const known = Object.keys(names).find((k) => host.endsWith(k));
    return { kind: 'link', href: u.href, host: known ? names[known] : host };
  }

  const storage = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };

  // Contact links built from the admin's details.
  function contactLinks(site, message) {
    const wa = C.waNumber(site.whatsapp);
    const tk = String(site.tiktok || '').trim();
    const ig = String(site.instagram || '').trim();
    const handle = (v, base) => (/^https?:\/\//.test(v) ? v : base + v.replace(/^@/, ''));
    return {
      whatsapp: wa ? `https://wa.me/${wa}${message ? '?text=' + encodeURIComponent(message) : ''}` : '',
      whatsappText: site.whatsapp || '',
      email: site.email || '',
      phone: site.phone || '',
      tiktok: tk ? handle(tk, 'https://www.tiktok.com/@') : '',
      tiktokText: tk ? (/^https?:/.test(tk) ? tk.replace(/^https?:\/\/(www\.)?/, '') : '@' + tk.replace(/^@/, '')) : '',
      instagram: ig ? handle(ig, 'https://www.instagram.com/') : '',
      instagramText: ig ? (/^https?:/.test(ig) ? ig.replace(/^https?:\/\/(www\.)?/, '') : '@' + ig.replace(/^@/, '')) : '',
    };
  }

  // Shrink a chosen photo in the browser before upload (long side 1600px, JPEG).
  function resizeImage(file, max = 1600, quality = 0.85) {
    return new Promise((resolve, reject) => {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error('Please choose a JPG, PNG or WebP photo.'));
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That photo could not be opened.')); };
      img.src = url;
    });
  }

  // ---------- data layer ----------
  const PREVIEW = typeof window.__SEED__ === 'object' && window.__SEED__ !== null;

  async function http(method, url, body) {
    const res = await fetch(url, {
      method, credentials: 'same-origin',
      headers: method === 'GET' ? {} : { 'Content-Type': 'application/json' },
      body: method === 'GET' ? undefined : JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(data.error || 'The server did not answer. Check your connection and try again.'); e.status = res.status; e.data = data; throw e; }
    return data;
  }
  const serverApi = {
    preview: false,
    catalog: () => http('GET', '/api/catalog'),
    lesson: (id) => http('GET', '/api/lessons/' + encodeURIComponent(id)),
    submit: (id, answers) => http('POST', '/api/lessons/' + encodeURIComponent(id) + '/submit', { answers }),
    design: (id) => http('GET', '/api/designs/' + encodeURIComponent(id)),
    enroll: (form) => http('POST', '/api/enroll', form),
    placeOrder: (items, note) => http('POST', '/api/orders', { items, note }),
    myOrders: () => http('GET', '/api/orders/mine'),
    signIn: () => { location.href = '/auth/google'; return new Promise(() => {}); },
    signOut: () => http('POST', '/api/logout'),
    adminMe: () => http('GET', '/api/admin/me'),
    adminLogin: (password) => http('POST', '/api/admin/login', { password }),
    adminLogout: () => http('POST', '/api/admin/logout'),
    adminData: () => http('GET', '/api/admin/data'),
    create: (kind, o) => http('POST', `/api/admin/${kind}`, o),
    save: (kind, o) => http('PUT', `/api/admin/${kind}/${encodeURIComponent(o.id)}`, o),
    remove: (kind, id) => http('DELETE', `/api/admin/${kind}/${encodeURIComponent(id)}`),
    order: (kind, ids) => http('PUT', `/api/admin/order/${kind}`, { ids }),
    saveSite: (s) => http('PUT', '/api/admin/site', s),
    saveBrand: (b) => http('PUT', '/api/admin/brand', b),
    upload: async (dataUrl) => (await http('POST', '/api/admin/upload', { dataUrl })).url,
    students: () => http('GET', '/api/admin/students'),
    student: (id) => http('GET', '/api/admin/students/' + encodeURIComponent(id)),
    saveStudent: (id, patch) => http('PUT', '/api/admin/students/' + encodeURIComponent(id), patch),
    removeStudent: (id) => http('DELETE', '/api/admin/students/' + encodeURIComponent(id)),
    testEmail: () => http('POST', '/api/admin/test-email'),
    adminOrders: () => http('GET', '/api/admin/orders'),
    setOrderStatus: (id, status) => http('PUT', '/api/admin/orders/' + encodeURIComponent(id), { status }),
    importData: (d) => http('PUT', '/api/admin/import', d),
    reset: () => http('POST', '/api/admin/reset'),
  };

  // Preview: the same routes, worked out in this browser with the same rules (core.js).
  function previewApi() {
    const KEY = 'mna_preview_v2', ME = 'mna_preview_me', ADMIN = 'mna_preview_admin';
    const load = () => storage.get(KEY, null) || JSON.parse(JSON.stringify(window.__SEED__));
    const save = (d) => { if (!storage.set(KEY, d)) throw new Error('This browser is out of space for the preview. Remove a photo and try again.'); };
    const me = (d) => d.students.find((s) => s.id === storage.get(ME, null)) || null;
    const rid = () => Math.random().toString(16).slice(2, 14);
    const fail = (status, data) => { const e = new Error(data.error || 'Locked'); e.status = status; e.data = data; throw e; };
    const cleaners = { lessons: C.cleanLesson, designs: C.cleanDesign, classes: C.cleanClass, services: C.cleanService, products: C.cleanProduct };
    const isAdmin = () => !!storage.get(ADMIN, false);
    const guard = () => { if (!isAdmin()) fail(401, { error: 'Please log in as admin.' }); };
    return {
      preview: true,
      async catalog() { const d = load(); return { ...C.catalog(d, me(d)), googleReady: true }; },
      async lesson(id) { const d = load(); const o = C.lessonFor(d, me(d), id); return o.status === 200 ? o : fail(o.status, o); },
      async design(id) { const d = load(); const o = C.designFor(d, me(d), id); return o.status === 200 ? o : fail(o.status, o); },
      async submit(id, answers) {
        const d = load(), u = me(d), l = d.lessons.find((x) => x.id === id);
        if (!C.canOpen('lessons', l, u)) fail(403, { error: 'This lesson is locked.' });
        const out = C.grade(l, answers); C.recordScore(u, id, out.score); save(d);
        return { ...out, progress: u.progress[id] };
      },
      async signIn() {
        const d = load();
        let u = d.students.find((s) => s.preview);
        if (!u) { u = { id: rid(), preview: true, googleId: 'preview', email: 'you@example.com', name: 'Preview Student', picture: '', phone: '', location: '', enrolled: false, createdAt: Date.now(), enrolledAt: null, lastLogin: Date.now(), unlockAll: false, unlocked: { lessons: [], designs: [] }, progress: {} }; d.students.push(u); save(d); }
        storage.set(ME, u.id);
        location.hash = u.enrolled ? 'art' : 'enroll';
        location.reload();
        return new Promise(() => {});
      },
      async signOut() { storage.del(ME); return { ok: true }; },
      async enroll(f) {
        const d = load(), u = me(d);
        if (!u) fail(401, { error: 'Please sign in with Google first.' });
        if (String(f.phone || '').replace(/\D/g, '').length < 9) fail(400, { error: 'Please enter a phone number we can reach you on.' });
        Object.assign(u, { name: C.str(f.name, 80) || u.name, phone: C.str(f.phone, 40), location: C.str(f.location, 120), enrolled: true, enrolledAt: u.enrolledAt || Date.now() });
        save(d); return { me: C.publicUser(u) };
      },
      async adminMe() { return { admin: isAdmin() }; },
      async adminLogin() { storage.set(ADMIN, true); return { ok: true }; },
      async adminLogout() { storage.del(ADMIN); return { ok: true }; },
      async adminData() { guard(); const d = load(); return { site: d.site, lessons: d.lessons, designs: d.designs, classes: d.classes, services: d.services || [], products: d.products || [], canBrand: true, emailReady: false, googleReady: true }; },
      async placeOrder(items, note) {
        const d = load(); d.orders = d.orders || [];
        const out = C.buildOrder(d, me(d), items, note, 'M-' + (1001 + d.orders.length));
        if (out.error) fail(400, { error: out.error });
        d.orders.push(out.order); save(d); return { order: out.order };
      },
      async myOrders() { const d = load(), u = me(d); return (d.orders || []).filter((o) => u && o.studentId === u.id).sort((a, b) => b.createdAt - a.createdAt); },
      async adminOrders() { guard(); return [...(load().orders || [])].sort((a, b) => b.createdAt - a.createdAt); },
      async setOrderStatus(id, status) { guard(); const d = load(); const o = d.orders.find((x) => x.id === id); o.status = status; save(d); return o; },
      async create(kind, o) { guard(); const d = load(); const n = cleaners[kind](o, rid()); d[kind].push(n); save(d); return n; },
      async save(kind, o) { guard(); const d = load(); const i = d[kind].findIndex((x) => x.id === o.id); d[kind][i] = cleaners[kind](o, o.id); save(d); return d[kind][i]; },
      async remove(kind, id) { guard(); const d = load(); d[kind] = d[kind].filter((x) => x.id !== id); save(d); return { ok: true }; },
      async order(kind, ids) { guard(); const d = load(); const m = new Map(d[kind].map((x) => [x.id, x])); d[kind] = [...ids.map((i) => m.get(i)).filter(Boolean), ...d[kind].filter((x) => !ids.includes(x.id))]; save(d); return { ok: true }; },
      async saveSite(s) { guard(); const d = load(); d.site = C.cleanSite({ ...s, theme: d.site.theme, logo: d.site.logo }); save(d); return d.site; },
      async saveBrand(b) { guard(); const d = load(); d.site = C.cleanSite({ ...d.site, theme: b.theme, logo: b.logo, name: b.name || d.site.name }); save(d); return d.site; },
      async upload(dataUrl) { guard(); return dataUrl; },
      async students() { guard(); const d = load(); return d.students.map((s) => C.studentRow(d, s)).sort((a, b) => (b.enrolledAt || b.createdAt) - (a.enrolledAt || a.createdAt)); },
      async student(id) { guard(); const d = load(); return C.studentDetail(d, d.students.find((s) => s.id === id)); },
      async saveStudent(id, patch) {
        guard(); const d = load(); const s = d.students.find((x) => x.id === id);
        if (typeof patch.unlockAll === 'boolean') s.unlockAll = patch.unlockAll;
        for (const k of ['lessons', 'designs']) if (Array.isArray(patch.unlocked?.[k])) s.unlocked[k] = patch.unlocked[k];
        save(d); return C.studentDetail(d, s);
      },
      async removeStudent(id) { guard(); const d = load(); d.students = d.students.filter((s) => s.id !== id); save(d); return { ok: true }; },
      async testEmail() { fail(400, { error: 'Emails are not sent from the preview. They work on the real site once email is set up.' }); },
      async importData(x) { guard(); const d = load(); save({ ...d, services: (x.services || []).map((l) => C.cleanService(l, l.id || rid())), products: (x.products || []).map((l) => C.cleanProduct(l, l.id || rid())), site: C.cleanSite(x.site || d.site), lessons: x.lessons.map((l) => C.cleanLesson(l, l.id || rid())), designs: (x.designs || []).map((l) => C.cleanDesign(l, l.id || rid())), classes: (x.classes || []).map((l) => C.cleanClass(l, l.id || rid())) }); return { ok: true }; },
      async reset() { guard(); const d = load(); const s = JSON.parse(JSON.stringify(window.__SEED__)); save({ ...s, site: d.site, students: d.students, products: d.products, orders: d.orders }); return { ok: true }; },
    };
  }
  const api = PREVIEW ? previewApi() : serverApi;

  const MARK = '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="mk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--lacquer)"/><stop offset="1" stop-color="var(--gold)"/></linearGradient></defs><path d="M16 2c6 0 10 5 10 11v9a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8v-9C6 7 10 2 16 2z" fill="url(#mk)"/><path d="M11 8c1.5-2 3-2.6 4.5-2.8" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  const brandHtml = (name) => { const [first, ...rest] = String(name || '').split(' '); return `<em>${esc(first)}</em> ${esc(rest.join(' '))}`; };
  const ICON = {
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="4.5" y="10" width="15" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="15.5" r="1.6" fill="currentColor"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10l3.7-2.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const fmtDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString('en-GB', opts);
  };

  // Paint the site in the client's colours and show their logo (also runs in the preview, where there is no theme.css).
  function applyTheme(site) {
    let tag = document.getElementById('theme-live');
    if (!tag) { tag = document.createElement('style'); tag.id = 'theme-live'; document.head.appendChild(tag); }
    tag.textContent = C.themeCss(site && site.theme);
    const icon = document.querySelector('link[rel="icon"]');
    if (icon && site && site.logo) icon.href = site.logo;
  }
  const markHtml = (site) => (site && site.logo ? `<img class="brand-logo" src="${esc(site.logo)}" alt="">` : MARK);

  window.MNA = { applyTheme, markHtml, C, esc, inline, renderText, videoInfo, storage, contactLinks, resizeImage, api, PREVIEW, MARK, brandHtml, ICON, fmtDate };
})();
