// Shared rules, used by the server (server.js) and by the preview build in the browser.
// Who can open what, how quizzes are marked, how progress is counted, and how admin input is cleaned.
(function (g) {
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const bool = (v, d) => (typeof v === 'boolean' ? v : d);
  const isoDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v : '');

  function cleanUrl(v) {
    const s = str(v, 500);
    if (!s) return '';
    try { const u = new URL(s); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : ''; } catch { return ''; }
  }
  function cleanImage(v) {
    const s = typeof v === 'string' ? v.trim() : '';
    if (/^\/uploads\/[a-z0-9]{8,40}\.(jpg|png|webp)$/.test(s) || /^\/?img\/([a-z0-9-]{1,40}\/)?[a-z0-9-]{1,40}\.(jpg|png|webp|svg)$/.test(s)) return s;
    if (s.length < 3_000_000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s)) return s; // preview only
    return cleanUrl(s);
  }
  function cleanQuiz(list) {
    return (Array.isArray(list) ? list : []).slice(0, 5).map((q) => {
      const options = (Array.isArray(q.options) ? q.options : []).slice(0, 4).map((o) => str(o, 200));
      const answer = Number.isInteger(q.answer) && q.answer >= 0 && q.answer < options.length ? q.answer : 0;
      return { q: str(q.q, 300), options, answer, explain: str(q.explain, 500) };
    });
  }
  const cleanLesson = (i, id) => ({
    id, section: i.section === 'art' ? 'art' : 'course',
    title: str(i.title, 120) || 'Untitled lesson', summary: str(i.summary, 300), duration: str(i.duration, 30),
    videoUrl: cleanUrl(i.videoUrl), linkLabel: str(i.linkLabel, 80), body: str(i.body, 40000),
    published: bool(i.published, true), free: bool(i.free, false), quiz: cleanQuiz(i.quiz),
  });
  const cleanDesign = (i, id) => ({
    id, title: str(i.title, 120) || 'Untitled design', level: str(i.level, 40), time: str(i.time, 40),
    description: str(i.description, 2000), image: cleanImage(i.image),
    tools: str(i.tools, 1000), credit: str(i.credit, 300),
    // How it shows on the try-on hand: a built-in style id, "texture" (an uploaded nail-art image), or "" (not shown).
    tryon: /^[a-z0-9-]{0,40}$/.test(i.tryon || '') ? i.tryon || '' : '', texture: cleanImage(i.texture),
    steps: (Array.isArray(i.steps) ? i.steps : String(i.steps || '').split('\n')).map((s) => str(s, 600)).filter(Boolean).slice(0, 40),
    published: bool(i.published, true), free: bool(i.free, false),
  });
  const cleanClass = (i, id) => ({
    id, title: str(i.title, 120) || 'Untitled class', description: str(i.description, 2000),
    startDate: isoDate(i.startDate), endDate: isoDate(i.endDate), schedule: str(i.schedule, 120),
    location: str(i.location, 160), fee: str(i.fee, 80), seats: str(i.seats, 40), published: bool(i.published, true),
  });
  const money = (v) => { const n = Math.round(Number(String(v ?? '').replace(/[^\d.]/g, ''))); return Number.isFinite(n) && n > 0 ? Math.min(n, 10_000_000) : 0; };
  const cleanService = (i, id) => ({
    id, title: str(i.title, 120) || 'Untitled service', description: str(i.description, 1500), price: str(i.price, 60),
    duration: str(i.duration, 40), image: cleanImage(i.image), published: bool(i.published, true),
  });
  const cleanProduct = (i, id) => ({
    id, title: str(i.title, 120) || 'Untitled product', description: str(i.description, 1500), category: str(i.category, 60),
    price: money(i.price), image: cleanImage(i.image), stock: ['in', 'low', 'out'].includes(i.stock) ? i.stock : 'in',
    published: bool(i.published, true),
  });
  // ---------- brand (colours, fonts, logo) ----------
  const THEMES = [
    { id: 'elan', name: 'Élan noir', accent: '#111111', detail: '#8a8a8a' },
    { id: 'cherry', name: 'Cherry lacquer', accent: '#a3173f', detail: '#a77d32' },
    { id: 'rose', name: 'Rose gold', accent: '#9e4a5a', detail: '#b8865b' },
    { id: 'emerald', name: 'Emerald', accent: '#0f6b4f', detail: '#b08d3c' },
    { id: 'midnight', name: 'Midnight', accent: '#2b2d6e', detail: '#b8925a' },
    { id: 'lilac', name: 'Lilac', accent: '#73479c', detail: '#c47f8f' },
    { id: 'coral', name: 'Coral', accent: '#c0392b', detail: '#2a7f8a' },
    { id: 'ocean', name: 'Ocean', accent: '#11698e', detail: '#d08a3e' },
    { id: 'noir', name: 'Noir', accent: '#1f1a1c', detail: '#b8925a' },
  ];
  const FONTS = {
    elan: { name: 'Élan', display: '"Cormorant Garamond", Garamond, Georgia, serif', body: '"Jost", system-ui, sans-serif', script: '"Great Vibes", "Snell Roundhand", cursive', css: 'Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Jost:wght@300;400;500;600&family=Great+Vibes' },
    elegant: { name: 'Elegant', display: '"Bodoni Moda", "Didot", Georgia, serif', body: '"Figtree", system-ui, sans-serif', css: 'Bodoni+Moda:ital,opsz,wght@0,6..96,500..800;1,6..96,500..800&family=Figtree:wght@400;500;600;700;800' },
    modern: { name: 'Modern', display: '"DM Serif Display", Georgia, serif', body: '"DM Sans", system-ui, sans-serif', css: 'DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700;800' },
    classic: { name: 'Classic', display: '"Cormorant Garamond", Garamond, Georgia, serif', body: '"Lato", system-ui, sans-serif', css: 'Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Lato:wght@400;700;900' },
    clean: { name: 'Clean', display: '"Poppins", system-ui, sans-serif', body: '"Poppins", system-ui, sans-serif', css: 'Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600' },
  };
  const hex = (v, d) => (/^#[0-9a-f]{6}$/i.test(v || '') ? v.toLowerCase() : d);
  const cleanTheme = (t = {}) => ({ accent: hex(t.accent, '#111111'), detail: hex(t.detail, '#8a8a8a'), font: FONTS[t.font] ? t.font : 'elan' });
  function luminance(h) {
    const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  // Every colour on the site comes from these two, so one choice recolours light and dark mode alike.
  function themeCss(t) {
    t = cleanTheme(t);
    const A = t.accent, D = t.detail, f = FONTS[t.font];
    const mix = (c, pct, base) => `color-mix(in srgb, ${c} ${pct}%, ${base})`;
    const onA = luminance(A) > 0.35 ? '#1a1416' : '#ffffff';
    const nearBlack = luminance(A) < 0.02; // black brands get white buttons in dark mode
    const dark = `--bg: ${mix(A, 7, '#0e0b0c')}; --surface: ${mix(A, 9, '#171314')}; --surface-2: ${mix(A, 14, '#1d1819')}; --ink: ${mix(A, 6, '#f7f2f3')}; --ink-soft: ${mix(A, 22, '#b9b0b3')};
      --line: ${mix(A, 22, '#2a2426')}; --lacquer: ${nearBlack ? '#f4f4f4' : mix(A, 62, '#ffffff')}; --lacquer-ink: #111111; --lacquer-soft: ${mix(A, 26, '#151112')}; --gold: ${mix(D, 70, '#ffffff')}; --tip: ${mix(D, 16, '#141011')}; color-scheme: dark;`;
    return `${f.css ? `@import url("https://fonts.googleapis.com/css2?family=${f.css}&display=swap");` : ''}
:root { --lacquer: ${A}; --lacquer-ink: ${onA}; --lacquer-soft: ${mix(A, 12, '#ffffff')}; --gold: ${mix(D, 85, '#000000')};
  --bg: ${mix(A, 3, '#ffffff')}; --surface: #ffffff; --surface-2: ${mix(A, 7, '#ffffff')}; --ink: ${mix(A, 22, '#161214')}; --ink-soft: ${mix(A, 22, '#5d5559')};
  --line: ${mix(A, 15, '#ffffff')}; --tip: ${mix(D, 12, '#ffffff')}; --display: ${f.display}; --body: ${f.body}; --script: ${f.script || f.display};
  --hero: ${nearBlack ? '#000000' : mix(A, 88, '#050505')}; --hero-ink: #ffffff; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${dark} } }
:root[data-theme="dark"] { ${dark} }`;
  }

  const cleanSite = (s) => ({
    name: str(s.name, 80) || 'Élan Beauty',
    tagline: str(s.tagline, 160),
    heroTitle: str(s.heroTitle, 120),
    heroText: str(s.heroText, 600),
    whatWeDo: (Array.isArray(s.whatWeDo) ? s.whatWeDo : []).slice(0, 6).map((w) => ({ title: str(w.title, 80), text: str(w.text, 400) })).filter((w) => w.title || w.text),
    classesNote: str(s.classesNote, 600),
    whatsapp: str(s.whatsapp, 40), phone: str(s.phone, 40), email: str(s.email, 120),
    tiktok: str(s.tiktok, 120), instagram: str(s.instagram, 120), location: str(s.location, 160),
    hours: str(s.hours, 160), about: str(s.about, 3000), heroImage: cleanImage(s.heroImage), shopOpen: bool(s.shopOpen, false),
    bookFrom: /^\d{2}:\d{2}$/.test(s.bookFrom || '') ? s.bookFrom : '09:00',
    bookTo: /^\d{2}:\d{2}$/.test(s.bookTo || '') ? s.bookTo : '18:00',
    theme: cleanTheme(s.theme), logo: cleanImage(s.logo),
    closedDays: (Array.isArray(s.closedDays) ? s.closedDays : [0]).map(Number).filter((d) => d >= 0 && d <= 6),
  });

  // ---------- access ----------
  function canOpen(kind, item, user) {
    if (!user || !user.enrolled || !item) return false;
    if (item.free || user.unlockAll) return true;
    return ((user.unlocked && user.unlocked[kind]) || []).includes(item.id);
  }
  const publicUser = (u) => u && ({ name: u.name, email: u.email, picture: u.picture, phone: u.phone, location: u.location, enrolled: !!u.enrolled });

  function classStatus(c, today) {
    today = today || new Date().toISOString().slice(0, 10);
    if (!c.startDate) return 'tba';                       // dates not announced yet ("incoming")
    if (c.startDate > today) return 'upcoming';
    const end = c.endDate && c.endDate >= c.startDate ? c.endDate : c.startDate; // no end date = one-day class
    return end >= today ? 'ongoing' : 'past';
  }

  function progressOf(db, user) {
    const lessons = db.lessons.filter((l) => l.published);
    const p = (user && user.progress) || {};
    const done = lessons.filter((l) => p[l.id]).length;
    const points = lessons.reduce((a, l) => a + ((p[l.id] && p[l.id].best) || 0), 0);
    return { done, total: lessons.length, percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0, points, maxPoints: lessons.length * 5 };
  }

  // What any visitor may see. Locked lessons and designs show their title only.
  function catalog(db, user) {
    const p = (user && user.progress) || {};
    return {
      site: db.site,
      me: publicUser(user),
      classes: db.classes.filter((c) => c.published).map((c) => ({ ...c, status: classStatus(c) })).filter((c) => c.status !== 'past')
        .sort((a, b) => (a.startDate || '9999').localeCompare(b.startDate || '9999')),
      lessons: db.lessons.filter((l) => l.published).map((l) => {
        const open = canOpen('lessons', l, user);
        return { id: l.id, section: l.section, title: l.title, summary: open ? l.summary : '', duration: l.duration, free: l.free, locked: !open, progress: p[l.id] || null };
      }),
      designs: db.designs.filter((d) => d.published).map((d) => {
        const open = canOpen('designs', d, user);
        return { id: d.id, title: d.title, level: d.level, image: d.image, description: d.description, credit: d.credit, tryon: d.tryon, texture: d.tryon === 'texture' ? d.texture : '', free: d.free, locked: !open };
      }),
      progress: user ? progressOf(db, user) : null,
      services: (db.services || []).filter((x) => x.published),
      shopOpen: !!(db.site && db.site.shopOpen),
      // Products only for signed-in, enrolled students while the shop is open.
      products: user && user.enrolled && db.site && db.site.shopOpen ? (db.products || []).filter((x) => x.published) : [],
    };
  }

  // A full lesson for someone allowed to open it. The right answers stay on the server.
  function lessonFor(db, user, id) {
    const l = db.lessons.find((x) => x.id === id && x.published);
    if (!l) return { status: 404 };
    if (!canOpen('lessons', l, user)) return { status: 403, locked: true, signedIn: !!user, enrolled: !!(user && user.enrolled), title: l.title };
    const { quiz, ...rest } = l;
    return {
      status: 200,
      lesson: { ...rest, quiz: quiz.filter((q) => q.q && q.options.filter(Boolean).length >= 2).map((q) => ({ q: q.q, options: q.options })), progress: (user.progress || {})[id] || null },
    };
  }
  function designFor(db, user, id) {
    const d = db.designs.find((x) => x.id === id && x.published);
    if (!d) return { status: 404 };
    if (!canOpen('designs', d, user)) return { status: 403, locked: true, signedIn: !!user, enrolled: !!(user && user.enrolled), title: d.title };
    return { status: 200, design: d };
  }
  function grade(lesson, answers) {
    const quiz = lesson.quiz.filter((q) => q.q && q.options.filter(Boolean).length >= 2);
    const results = quiz.map((q, i) => ({ correct: q.answer, picked: Number.isInteger(answers[i]) ? answers[i] : -1, explain: q.explain || 'The right answer is: ' + q.options[q.answer] }));
    const score = results.filter((r) => r.correct === r.picked).length;
    return { score, total: quiz.length, results };
  }
  function recordScore(user, id, score) {
    user.progress = user.progress || {};
    const prev = user.progress[id] || {};
    user.progress[id] = { best: Math.max(prev.best || 0, score), last: score, attempts: (prev.attempts || 0) + 1, at: Date.now() };
  }

  // Admin view of one student: their progress on every lesson and what is unlocked.
  function studentDetail(db, s) {
    return {
      ...s,
      summary: progressOf(db, s),
      lessons: db.lessons.map((l) => ({ id: l.id, title: l.title, section: l.section, free: l.free, published: l.published, progress: (s.progress || {})[l.id] || null, unlocked: canOpen('lessons', l, s) })),
      designs: db.designs.map((d) => ({ id: d.id, title: d.title, free: d.free, published: d.published, unlocked: canOpen('designs', d, s) })),
    };
  }
  const studentRow = (db, s) => ({ id: s.id, name: s.name, email: s.email, phone: s.phone, location: s.location, picture: s.picture, enrolled: s.enrolled, createdAt: s.createdAt, enrolledAt: s.enrolledAt, lastLogin: s.lastLogin, unlockAll: !!s.unlockAll, summary: progressOf(db, s) });

  // Build an order from what the student sent. Prices always come from the shop, never from the browser.
  function buildOrder(db, user, items, note, number) {
    if (!user || !user.enrolled) return { error: 'Please sign in and enroll to shop.' };
    if (!db.site.shopOpen) return { error: 'The shop is not open yet.' };
    const lines = [];
    for (const it of Array.isArray(items) ? items.slice(0, 50) : []) {
      const p = (db.products || []).find((x) => x.id === it.id && x.published);
      const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 0)));
      if (!p) return { error: 'An item in your cart is no longer available. Remove it and try again.' };
      if (p.stock === 'out') return { error: `"${p.title}" is out of stock. Remove it and try again.` };
      if (!p.price) return { error: `"${p.title}" has no price yet. Remove it and ask us on WhatsApp.` };
      lines.push({ id: p.id, title: p.title, price: p.price, qty });
    }
    if (!lines.length) return { error: 'Your cart is empty.' };
    return { order: {
      id: Math.random().toString(16).slice(2, 14), number, studentId: user.id, name: user.name, email: user.email, phone: user.phone, location: user.location,
      items: lines, total: lines.reduce((a, l) => a + l.price * l.qty, 0), note: str(note, 500), status: 'new', createdAt: Date.now(),
    } };
  }
  const ksh = (n) => 'KSh ' + Number(n || 0).toLocaleString('en-KE');
  const orderText = (o) => [`Order ${o.number}`, ...o.items.map((l) => `${l.qty} × ${l.title} (${ksh(l.price * l.qty)})`), `Total: ${ksh(o.total)}`, o.note ? `Note: ${o.note}` : ''].filter(Boolean).join('\n');

  // 0746906609 / +254 746 906609 -> 254746906609 (for wa.me links)
  function waNumber(v) {
    let d = String(v || '').replace(/\D/g, '');
    if (d.startsWith('0')) d = '254' + d.slice(1);
    else if (d.length === 9 && /^[17]/.test(d)) d = '254' + d;
    return d.length >= 10 ? d : '';
  }

  g.MNACore = { THEMES, FONTS, cleanTheme, themeCss, cleanService, cleanProduct, buildOrder, ksh, orderText, money, str, cleanUrl, cleanImage, cleanLesson, cleanDesign, cleanClass, cleanSite, canOpen, publicUser, classStatus, progressOf, catalog, lessonFor, designFor, grade, recordScore, studentDetail, studentRow, waNumber };
})(typeof globalThis !== 'undefined' ? globalThis : window);
