// Student site: landing, classes, course (locked/unlocked), lessons with server-marked quizzes,
// art work photos and steps, about, contact, enrollment and "my progress".
(function () {
  const { applyTheme, markHtml, C, esc, renderText, videoInfo, contactLinks, api, MARK, brandHtml, ICON, fmtDate, PREVIEW } = window.MNA;
  const app = document.getElementById('app');
  let cat = { site: {}, lessons: [], designs: [], classes: [], me: null, progress: null };
  const SECTION_NAME = { course: 'Foundations', art: 'Nail art techniques' };
  const bySection = (s) => cat.lessons.filter((l) => l.section === s);
  const site = () => cat.site || {};
  const me = () => cat.me;

  // ---------- small pieces ----------
  const lockBadge = `<span class="lock-badge" aria-hidden="true">${ICON.lock}</span>`;
  const googleButton = (label = 'Sign in with Google') => `<button type="button" class="btn btn-google" data-action="signin">${ICON.google}<span>${label}</span></button>`;
  function contactButtons(message, { compact, label = 'Chat on WhatsApp' } = {}) {
    const c = contactLinks(site(), message);
    const out = [];
    if (c.whatsapp) out.push(`<a class="btn btn-wa ${compact ? 'btn-sm' : ''}" href="${esc(c.whatsapp)}" target="_blank" rel="noopener noreferrer">${ICON.whatsapp}<span>${label}</span></a>`);
    if (c.email) out.push(`<a class="btn btn-ghost ${compact ? 'btn-sm' : ''}" href="mailto:${esc(c.email)}">${ICON.mail}<span>${esc(c.email)}</span></a>`);
    return out.join('');
  }

  // ---------- modal ----------
  let lastFocus = null;
  function openModal(html) {
    closeModal();
    lastFocus = document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button type="button" class="modal-x" aria-label="Close">×</button>${html}</div>`;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('open'));
    wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('.modal-x') || e.target.closest('[data-close]')) closeModal(); });
    (wrap.querySelector('.modal a, .modal button:not(.modal-x)') || wrap.querySelector('.modal-x')).focus();
  }
  function closeModal() {
    const w = document.querySelector('.modal-wrap');
    if (w) { w.remove(); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  function lockPopup(title, kind = 'lesson') {
    const u = me();
    if (u && !u.enrolled) {
      openModal(`<div class="modal-lock">${ICON.lock}</div>
        <h2 id="modal-title">One step left</h2>
        <p>Finish enrolling with your phone number, and Lesson 1 opens straight away.</p>
        <div class="modal-actions"><a class="btn btn-primary" href="#enroll" data-close>Finish enrolling</a></div>`);
      return;
    }
    const msg = u ? `Hello, I am ${u.name} (${u.email}). I would like to unlock "${title}".` : `Hello, I would like to unlock "${title}" in the nail course.`;
    openModal(`<div class="modal-lock">${ICON.lock}</div>
      <h2 id="modal-title">Contact admin</h2>
      <p>To open “${esc(title)}”, contact the admin.</p>
      <div class="modal-actions stack">${contactButtons(msg) || '<p class="muted">Contact details will be added soon.</p>'}</div>
      ${u ? '' : `<div class="modal-or"><span>new here?</span></div><div class="modal-actions">${googleButton('Sign in for Lesson 1 free')}</div>`}`);
  }

  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-action], [data-locked]');
    if (!t) return;
    if (t.dataset.locked) { e.preventDefault(); return lockPopup(t.dataset.title, t.dataset.locked); }
    const a = t.dataset.action;
    if (a === 'signin') { e.preventDefault(); t.disabled = true; await api.signIn(); }
    if (a === 'signout') { e.preventDefault(); await api.signOut(); await reload(); location.hash === '#home' ? route() : (location.hash = 'home'); }
    if (a === 'reveal-phone') {
      const num = site().phone || '';
      const link = document.createElement('a');
      link.className = 'contact-card'; link.href = 'tel:' + num.replace(/\s/g, '');
      link.innerHTML = t.innerHTML;
      link.querySelector('b').textContent = num;
      link.querySelector('.cc-cta').textContent = 'Tap to call';
      t.replaceWith(link); link.focus();
    }
    if (a === 'menu') { const open = document.body.classList.toggle('menu-open'); t.setAttribute('aria-expanded', open); }
    if (a === 'account') { const m = document.getElementById('account-menu'); m.hidden = !m.hidden; t.setAttribute('aria-expanded', !m.hidden); }
  });
  document.addEventListener('click', (e) => {
    const m = document.getElementById('account-menu');
    if (m && !m.hidden && !e.target.closest('.account')) m.hidden = true;
  });

  // ---------- header & footer ----------
  function chrome() {
    const s = site(), u = me();
    document.title = s.name || 'Nail Academy';
    document.querySelectorAll('[data-nav="shop"]').forEach((a) => (a.hidden = !u));
    applyTheme(s);
    document.getElementById('brand').innerHTML = s.logo ? markHtml(s) : `<span class="brand-name">${brandHtml(s.name)}</span>`;
    document.getElementById('brand').setAttribute('aria-label', s.name + ', home');
    document.getElementById('account').innerHTML = u
      ? `<div class="account"><button type="button" class="avatar-btn" data-action="account" aria-expanded="false" aria-haspopup="true">
          ${u.picture ? `<img src="${esc(u.picture)}" alt="" referrerpolicy="no-referrer">` : `<span class="avatar-fallback">${esc((u.name || '?')[0])}</span>`}<span class="sr-only">Account</span></button>
          <div class="account-menu" id="account-menu" hidden>
            <div class="am-head"><b>${esc(u.name)}</b><small>${esc(u.email)}</small></div>
            ${u.enrolled ? '<a href="#me">My progress</a>' : '<a href="#enroll">Finish enrolling</a>'}
            <button type="button" data-action="signout">Sign out</button>
          </div></div>`
      : `<button type="button" class="btn btn-ghost btn-sm signin-top" data-action="signin">${ICON.google}<span>Sign in</span></button>`;
    const c = contactLinks(s);
    document.getElementById('footer').innerHTML = `
      <div class="f-brand">${s.logo ? markHtml(s) : brandHtml(s.name)}<span>${esc(s.tagline || '')}</span></div>
      <div class="f-links">
        ${c.whatsapp ? `<a href="${esc(c.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">${ICON.whatsapp}</a>` : ''}
        ${c.tiktok ? `<a href="${esc(c.tiktok)}" target="_blank" rel="noopener noreferrer" aria-label="TikTok">${ICON.tiktok}</a>` : ''}
        ${c.instagram ? `<a href="${esc(c.instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${ICON.instagram}</a>` : ''}
        ${c.email ? `<a href="mailto:${esc(c.email)}" aria-label="Email">${ICON.mail}</a>` : ''}
      </div>
      <div class="f-meta">© ${new Date().getFullYear()} ${esc(s.name)} · ${esc(s.location || 'Kenya')} · <a href="${PREVIEW ? 'admin.html' : '/admin'}">Admin</a></div>`;
  }

  // ---------- hero art ----------
  function heroArt() {
    const fingers = [
      { x: 52, top: 150, h: 260, r: -8 }, { x: 122, top: 92, h: 300, r: -3 }, { x: 194, top: 66, h: 320, r: 0 },
      { x: 266, top: 96, h: 300, r: 3 }, { x: 312, top: 214, h: 186, r: 18 },
    ];
    const colors = ['var(--lacquer)', 'color-mix(in srgb, var(--lacquer) 72%, #fff)', 'var(--lacquer)', 'color-mix(in srgb, var(--lacquer) 72%, #fff)', 'var(--lacquer)'];
    return `<svg viewBox="0 0 440 400" role="img" aria-label="A hand having its nails painted in cherry lacquer, one nail at a time">
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a4a31"/><stop offset=".5" stop-color="#9a6243"/><stop offset="1" stop-color="#7a4a31"/></linearGradient>
        <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        ${fingers.map((f, i) => `<clipPath id="nc${i}"><rect x="${f.x + 10}" y="${f.top + 10}" width="38" height="58" rx="19"/></clipPath>`).join('')}
      </defs>
      <circle cx="230" cy="190" r="170" fill="var(--lacquer-soft)"/>
      ${fingers.map((f, i) => `<g transform="rotate(${f.r} ${f.x + 29} ${f.top + f.h})">
        <rect x="${f.x}" y="${f.top}" width="58" height="${f.h}" rx="29" fill="url(#skin)"/>
        <rect x="${f.x + 10}" y="${f.top + 10}" width="38" height="58" rx="19" fill="#e9b9a6"/>
        <g clip-path="url(#nc${i})">
          <rect class="polish n${i + 1}" x="${f.x + 8}" y="${f.top + 8}" width="42" height="62" fill="${colors[i]}"/>
          <rect class="shine" x="${f.x + 16}" y="${f.top + 22}" width="7" height="30" rx="4" fill="url(#gloss)" style="animation-delay:${i * .5}s"/>
        </g>
      </g>`).join('')}
      <path d="M40 400 C 60 330, 380 330, 400 400 Z" fill="#7a4a31"/>
      <g class="brush" aria-hidden="true">
        <rect x="372" y="20" width="14" height="96" rx="5" transform="rotate(32 379 68)" fill="var(--ink)"/>
        <path d="M352 110 l10 -8 l8 10 l-10 18 z" fill="var(--lacquer)"/>
      </g>
      <path class="sparkle" d="M70 70 l5 13 13 5 -13 5 -5 13 -5 -13 -13 -5 13 -5z" fill="var(--gold)"/>
      <path class="sparkle s2" d="M396 170 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="var(--gold)"/>
      <path class="sparkle s3" d="M150 30 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="var(--lacquer)"/>
    </svg>`;
  }

  // ---------- classes ----------
  const STATUS = { ongoing: ['Ongoing now', 'live'], upcoming: ['Starting soon', 'soon'], tba: ['Incoming', 'tba'] };
  function classCard(c) {
    const [label, cls] = STATUS[c.status];
    const dates = c.startDate ? (c.endDate && c.endDate !== c.startDate ? `${fmtDate(c.startDate, { day: 'numeric', month: 'short' })} – ${fmtDate(c.endDate)}` : fmtDate(c.startDate, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })) : 'Dates coming soon';
    const facts = [[ICON.calendar, dates], c.schedule && [ICON.calendar, c.schedule], c.location && [ICON.pin, c.location], c.seats && [ICON.check, c.seats]].filter(Boolean);
    return `<article class="class-card">
      <div class="class-top"><span class="status ${cls}">${label}</span>${c.fee ? `<span class="fee">${esc(c.fee)}</span>` : ''}</div>
      <h3>${esc(c.title)}</h3>
      ${c.description ? `<p>${esc(c.description)}</p>` : ''}
      <ul class="facts">${facts.map(([i, t]) => `<li>${i}<span>${esc(t)}</span></li>`).join('')}</ul>
      <div class="class-cta">${contactButtons(`Hello, I would like to book a seat in "${c.title}"${c.startDate ? ' starting ' + fmtDate(c.startDate) : ''}.`, { compact: true, label: 'Book a seat on WhatsApp' })}</div>
    </article>`;
  }
  const incomingCard = () => `<article class="class-card incoming">
      <span class="status tba">Incoming</span>
      <h3>New classes are on the way</h3>
      <p>${esc(site().classesNote || 'Dates for our next physical classes will be posted here soon.')}</p>
      <div class="class-cta">${contactButtons('Hello, please tell me when the next nail class starts.', { compact: true })}</div>
    </article>`;
  const offerGrid = () => (site().whatWeDo || []).length ? `<div class="offer-grid">${site().whatWeDo.map((w) => `<article class="offer"><span class="offer-mark" aria-hidden="true"></span><h3>${esc(w.title)}</h3><p>${esc(w.text)}</p></article>`).join('')}</div>` : '';

  // ---------- views ----------
  function home() {
    const s = site(), u = me();
    const words = String(s.heroTitle || 'Every hand becomes a canvas.').trim().split(' ');
    const last = words.pop();
    const cls = cat.classes.slice(0, 3);
    app.innerHTML = `
      <section class="stage" id="stage" aria-label="${esc(s.name)}">
        <video class="stage-video" autoplay muted playsinline webkit-playsinline disablepictureinpicture disableremoteplayback controlslist="nodownload nofullscreen noremoteplayback noplaybackrate" preload="auto" poster="img/hero-start.jpg" tabindex="-1" aria-hidden="true">
</video>
        <figure class="stage-card"><div class="sc-inner">${s.heroImage ? `<img src="${esc(s.heroImage)}" alt="${esc(s.name)} logo">` : `<span class="stage-wordmark">${brandHtml(s.name)}</span>`}</div><span class="drip" style="--x:19%;--d:0s;--len:27%;--w:1.15"></span><span class="drip" style="--x:63%;--d:.3s;--len:9%;--w:.75"></span><span class="drip" style="--x:77%;--d:.14s;--len:16%;--w:.6"></span></figure>
        <div class="stage-fx" aria-hidden="true"><span class="fx-beam"></span><span class="fx-flash"></span><span class="fx-brush"><svg viewBox="0 0 60 200" aria-hidden="true"><defs><linearGradient id="bc" x1="0" x2="1"><stop offset="0" stop-color="#d9d9d9"/><stop offset=".35" stop-color="#ffffff"/><stop offset="1" stop-color="#bdbdbd"/></linearGradient><linearGradient id="bt" x1="0" x2="1"><stop offset="0" stop-color="#0c0c0c"/><stop offset=".45" stop-color="#4a4a4a"/><stop offset="1" stop-color="#050505"/></linearGradient></defs><rect x="14" y="0" width="32" height="92" rx="7" fill="url(#bc)"/><rect x="19" y="10" width="5" height="70" rx="2.5" fill="#fff" opacity=".8"/><rect x="21" y="90" width="18" height="12" rx="2" fill="#9a9a9a"/><rect x="27" y="101" width="6" height="52" fill="#cfcfcf"/><path d="M20 150 h20 l-3 34 q-7 18 -14 0 z" fill="url(#bt)"/><path d="M25 156 l2 26" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/></svg></span><span class="stage-burst"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></div>
      </section>

      <section class="intro"><div class="wrap">
        <div class="eyebrow">${esc(s.tagline || 'Nail studio · Kenya')}</div>
        <h1>${esc(words.join(' '))} <em>${esc(last)}</em></h1>
        <p class="lead">${esc(s.heroText)}</p>
        <div class="hero-actions">
          <button type="button" class="btn btn-primary" data-book="">${ICON.calendar}<span>Book appointment</span></button>
          <a class="btn btn-ghost" href="#classes">See our classes</a>
        </div>
      </div></section>

      ${offerGrid() ? `<section class="section"><div class="wrap">
        <div class="section-head center"><div class="eyebrow">What we do</div><h2>Training that gets you working</h2></div>${offerGrid()}
      </div></section>` : ''}

      ${cat.services.length ? `<section class="section"><div class="wrap">
        <div class="section-head"><div><div class="eyebrow">Services</div><h2>Book your nails with us</h2></div><a class="btn btn-ghost btn-sm" href="#services">All services</a></div>
        <div class="svc-grid">${cat.services.slice(0, 3).map(serviceCard).join('')}</div>
      </div></section>` : ''}

      <section class="section tint"><div class="wrap">
        <div class="section-head"><div><div class="eyebrow">Physical classes</div><h2>Learn with us in person</h2></div>
          <a class="btn btn-ghost btn-sm" href="#classes">All classes</a></div>
        <div class="class-grid">${cls.length ? cls.map(classCard).join('') : incomingCard()}</div>
      </div></section>

      <section class="section"><div class="wrap">
        <div class="cta-band">
          <div><h2>Questions? Talk to us.</h2><p>We reply on WhatsApp. Ask about classes, fees and the online course.</p></div>
          <div class="cta-actions">${contactButtons('Hello, I have a question about the nail classes.') || '<a class="btn btn-primary" href="#contact">Contact us</a>'}</div>
        </div>
      </div></section>`;
    startStage();
  }

  // ---------- home stage: the rabbit video points at the logo card ----------
  // Where the rabbit is in the video (fractions of the 1920x1080 frame), measured from its last frame.
  const RABBIT = { finger: { x: 0.578, y: 0.434 }, right: 0.87, top: 0.05, pointAt: 1.8 };
  let stageObserver = null;
  function layoutStage() {
    const st = document.getElementById('stage');
    if (!st) return;
    const v = st.querySelector('video'), card = st.querySelector('.stage-card');
    const Cw = st.clientWidth, Ch = st.clientHeight;
    // The video covers the stage; work out how big it is drawn and which part is visible.
    const k = Math.max(Cw / 1920, Ch / 1080), Vw = 1920 * k, Vh = 1080 * k;
    const m = Math.max(12, Cw * 0.03);
    // Slide the video so the whole rabbit stays in view on narrow screens, leaving room on its left for the card.
    const ox = Math.min(Math.max(RABBIT.right * Vw - (Cw - m), 0), Vw - Cw);
    const oy = Math.min((Vh - Ch) / 2, RABBIT.top * Vh); // never crop the ears
    v.style.objectPosition = `${Vw > Cw ? (ox / (Vw - Cw)) * 100 : 50}% ${Vh > Ch ? (oy / (Vh - Ch)) * 100 : 50}%`;
    // The card sits just past the fingertip, centred on the line the finger points along.
    const fx = RABBIT.finger.x * Vw - ox, fy = RABBIT.finger.y * Vh - oy;
    const gap = Math.max(10, Vw * 0.014);
    const img = card.querySelector('img');
    const ratio = img && img.naturalWidth ? img.naturalHeight / img.naturalWidth : 0.55;
    const w = Math.max(96, Math.min(fx - gap - m, Vw * 0.36, 620));
    const h = w * ratio;
    card.style.width = w + 'px';
    card.style.left = Math.max(m * 0.5, fx - gap - w) + 'px';
    card.style.top = Math.min(Math.max(fy - h / 2, m), Ch - h - m) + 'px';
    // Effects layer (spark, beam, brush, burst) sits exactly over the card.
    const fxl = st.querySelector('.stage-fx');
    Object.assign(fxl.style, { left: card.style.left, top: card.style.top, width: w + 'px', height: h + 'px' });
    fxl.style.setProperty('--ch', h + 'px'); fxl.style.setProperty('--bw', w * 1.15 + 'px');
  }
  function startStage() {
    const st = document.getElementById('stage');
    if (!st) return;
    const v = st.querySelector('video');
    let revealed = false;
    // The surprise: the banner pops up when the rabbit's hand comes up.
    const reveal = () => { if (revealed) return; revealed = true; layoutStage(); st.classList.add('pointed'); setTimeout(() => st.classList.add('settled'), 2100); };
    // Fallback when the video cannot play at all: show the last frame (rabbit pointing) and the banner.
    const showEnd = () => { v.poster = 'img/hero-poster.jpg'; try { v.pause(); if (v.duration) v.currentTime = v.duration; } catch {} reveal(); };
    layoutStage();
    st.querySelector('.stage-card img')?.addEventListener('load', layoutStage);
    // On a computer the banner tilts gently toward the mouse once it has appeared.
    if (matchMedia('(hover: hover)').matches) {
      const inner = st.querySelector('.sc-inner');
      st.addEventListener('pointermove', (e) => {
        if (!st.classList.contains('settled')) return;
        const r = inner.getBoundingClientRect();
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width));
        const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height));
        inner.style.setProperty('--ry', dx * 10 + 'deg'); inner.style.setProperty('--rx', -dy * 8 + 'deg');
      });
      st.addEventListener('pointerleave', () => { inner.style.setProperty('--ry', '0deg'); inner.style.setProperty('--rx', '0deg'); });
    }
    if (stageObserver) stageObserver.disconnect();
    stageObserver = new ResizeObserver(layoutStage);
    stageObserver.observe(st);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); showEnd(); return; }

    // Browsers only autoplay video that is muted and inline; set both as properties too (the attributes alone are not always honoured).
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.controls = false;
    // A lighter file for phones and tablets, full HD for big screens.
    v.src = Math.max(innerWidth, innerHeight) * (devicePixelRatio > 1.5 ? 0.75 : 1) <= 1100 ? 'img/hero-1024.mp4' : 'img/hero-1920.mp4';
    // Check the video time on every screen refresh so the banner pops exactly as the hand comes up.
    const watch = () => { if (revealed || !st.isConnected) return; if (v.currentTime >= RABBIT.pointAt) reveal(); else requestAnimationFrame(watch); };
    requestAnimationFrame(watch);
    v.addEventListener('ended', reveal);
    v.addEventListener('error', showEnd);
    const tryPlay = () => { const p = v.play(); return p && p.catch ? p : Promise.resolve(); };
    tryPlay().catch(() => {
      // Autoplay blocked (some browsers, power saving): start on the visitor's first touch, scroll, click or key.
      const events = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'];
      const go = () => { events.forEach((e) => removeEventListener(e, go, true)); clearTimeout(t); tryPlay().catch(showEnd); };
      events.forEach((e) => addEventListener(e, go, { capture: true, passive: true }));
      const t = setTimeout(() => { events.forEach((e) => removeEventListener(e, go, true)); if (v.paused) showEnd(); }, 6000);
    });
  }

  const pageHead = (eyebrow, title, text) => `<section class="page-head"><div class="wrap"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${text ? `<p>${text}</p>` : ''}</div></section>`;

  function classesView() {
    const groups = ['ongoing', 'upcoming', 'tba'].map((st) => [st, cat.classes.filter((c) => c.status === st)]).filter(([, l]) => l.length);
    app.innerHTML = pageHead('Physical classes', 'Classes', 'Hands-on training in our studio, with a tutor beside you. See what is running now and what starts next.') + `
      <section class="section"><div class="wrap stack-lg">
        ${groups.length ? groups.map(([st, list]) => `<div><h2 class="group-title">${STATUS[st][0]}</h2><div class="class-grid">${list.map(classCard).join('')}</div></div>`).join('') : `<div class="class-grid">${incomingCard()}</div>`}
      </div></section>`;
  }

  function lessonCard(l, i) {
    const pr = l.progress;
    return `<a class="step-card ${l.locked ? 'locked' : ''} ${pr ? 'done' : ''}" href="${l.locked ? '#' : '#lesson-' + esc(l.id)}" ${l.locked ? `data-locked="lesson" data-title="${esc(l.title)}"` : ''}>
      <span class="num">${i + 1}</span>
      <span class="sc-body"><h3>${esc(l.title)}</h3>
        ${l.locked ? `<p class="contact-admin">${l.free && !me() ? 'Free: sign in to open' : 'Contact admin'}</p>` : `<p>${esc(l.summary)}</p>`}
        <span class="meta">${l.duration ? `<span>${esc(l.duration)}</span>` : ''}<span>5 questions</span>${pr ? `<span class="score-pill ${pr.best === 5 ? 'full' : ''}">${pr.best}/5</span>` : ''}${l.free && !l.locked ? '<span class="free-pill">Free</span>' : ''}</span>
      </span>
      ${l.locked ? lockBadge : ''}
    </a>`;
  }
  function accessBanner() {
    const u = me(), p = cat.progress;
    if (!u) return `<div class="banner"><div><b>Sign in to begin.</b> Lesson 1 is free with your Google account. Other lessons open when the admin unlocks them for you.</div>${googleButton()}</div>`;
    if (!u.enrolled) return `<div class="banner"><div><b>Almost there.</b> Add your phone number to finish enrolling and open Lesson 1.</div><a class="btn btn-primary btn-sm" href="#enroll">Finish enrolling</a></div>`;
    const next = cat.lessons.find((l) => !l.locked && !l.progress);
    return `<div class="progress-strip">
      <span>Your progress <b>${p.percent}%</b></span>
      <span class="bar" aria-hidden="true"><i style="width:${p.percent}%"></i></span>
      <span><b>${p.done}</b>/${p.total} steps · <b>${p.points}</b>/${p.maxPoints} points</span>
      ${next ? `<a class="btn btn-primary btn-sm" href="#lesson-${esc(next.id)}">Continue: ${esc(next.title)}</a>` : ''}
    </div>`;
  }
  function courseView() {
    app.innerHTML = pageHead('Online course', 'The course', 'Everything a professional nail technician should know, in order. Every step ends with 5 questions scored out of 5.') + `
      <section class="section"><div class="wrap stack-lg">
        ${accessBanner()}
        ${['course', 'art'].filter((s) => bySection(s).length).map((s) => `<div><h2 class="group-title">${SECTION_NAME[s]}</h2>
          <div class="map">${bySection(s).map(lessonCard).join('')}</div></div>`).join('')}
      </div></section>`;
  }

  function artView() {
    const u = me();
    app.innerHTML = pageHead('Art work', u && u.enrolled ? `Welcome back, ${esc(u.name.split(' ')[0])}` : 'Art work', 'Real designs from our studio. Open a design to see the tools and every step to recreate it.') + `
      <section class="section"><div class="wrap stack-lg">
        ${!u || !u.enrolled ? accessBanner() : ''}
        <div class="art-grid">${cat.designs.map((d) => `
          <a class="art-card ${d.locked ? 'locked' : ''}" href="${d.locked ? '#' : '#design-' + esc(d.id)}" ${d.locked ? `data-locked="design" data-title="${esc(d.title)}"` : ''}>
            <span class="art-photo">${d.image ? `<img src="${esc(d.image)}" alt="${esc(d.title)}" loading="lazy">` : '<span class="photo-soon">Photo coming soon</span>'}${d.locked ? lockBadge : ''}</span>
            <span class="art-info"><h3>${esc(d.title)}</h3><span class="meta">${d.level ? `<span>${esc(d.level)}</span>` : ''}${d.free && !d.locked ? '<span class="free-pill">Free</span>' : ''}${d.locked ? '<span class="contact-admin">Contact admin</span>' : ''}</span></span>
          </a>`).join('') || '<p class="muted">New designs are coming soon.</p>'}</div>
      </div></section>`;
  }

  async function designView(id) {
    app.innerHTML = '<div class="empty">Opening the design…</div>';
    try {
      const { design: d } = await api.design(id);
      app.innerHTML = `<article class="section"><div class="wrap">
        <a class="back" href="#art">← All art work</a>
        <div class="design-layout">
          <figure class="design-photo">${d.image ? `<img src="${esc(d.image)}" alt="${esc(d.title)}">` : '<span class="photo-soon">Photo coming soon</span>'}</figure>
          <div class="design-copy">
            <div class="eyebrow">Art work${d.level ? ' · ' + esc(d.level) : ''}${d.time ? ' · ' + esc(d.time) : ''}</div>
            <h1>${esc(d.title)}</h1>
            ${d.description ? `<p class="lead">${esc(d.description)}</p>` : ''}
            ${d.tools ? `<div class="tools"><b>You will need</b><p>${esc(d.tools)}</p></div>` : ''}
            ${d.steps.length ? `<h2 class="steps-title">Steps to follow</h2><ol class="howto">${d.steps.map((s) => `<li><span>${esc(s)}</span></li>`).join('')}</ol>` : ''}
          </div>
        </div>
      </div></article>`;
    } catch (e) { lockedPage(e, 'design', '#art', 'All art work'); }
  }

  function lockedPage(e, kind, back, backLabel) {
    const box = document.getElementById('lp') || app;
    if (e.status === 403) {
      box.innerHTML = `<section class="section"><div class="wrap"><div class="locked-page">${ICON.lock}<h1>${esc(e.data.title || 'Locked')}</h1>
        <p>Contact admin to open this ${kind === 'design' ? 'design' : 'lesson'}.</p><div class="row-c"><button class="btn btn-primary" type="button" data-locked="${kind}" data-title="${esc(e.data.title || '')}">Contact admin</button><a class="btn btn-ghost" href="${back}">${backLabel}</a></div></div></div></section>`;
      lockPopup(e.data.title || '', kind);
    } else {
      box.innerHTML = `<div class="empty"><h2>That page is not here</h2><p><a href="${back}">${backLabel}</a></p></div>`;
    }
  }

  function rail(l) {
    const list = bySection(l.section);
    return `<div class="rail"><div class="wrap">
      <div class="rail-tabs">${['course', 'art'].filter((s) => bySection(s).length).map((s) => {
        const first = bySection(s).find((x) => !x.locked) || bySection(s)[0];
        return `<a href="${first.locked ? '#course' : '#lesson-' + esc(first.id)}" class="${s === l.section ? 'active' : ''}">${SECTION_NAME[s]}</a>`;
      }).join('')}</div>
      <nav class="steps" aria-label="${SECTION_NAME[l.section]} steps">${list.map((x, i) => {
        const pr = x.progress;
        return `<a class="chip ${x.id === l.id ? 'current' : ''} ${pr ? 'done' : ''} ${x.locked ? 'is-locked' : ''}" href="${x.locked ? '#' : '#lesson-' + esc(x.id)}" ${x.locked ? `data-locked="lesson" data-title="${esc(x.title)}"` : ''} ${x.id === l.id ? 'aria-current="step"' : ''}>
          <span class="dot">${x.locked ? ICON.lock : pr ? '✓' : i + 1}</span><span class="t">${esc(x.title)}</span>${pr ? `<small>${pr.best}/5</small>` : ''}</a>`;
      }).join('')}</nav>
    </div></div>`;
  }

  function media(l) {
    const v = videoInfo(l.videoUrl);
    if (!v) return '';
    if (v.embed && !PREVIEW) return `<div class="video"><iframe src="${esc(v.embed)}" title="${esc(l.title)} video" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
    return `<a class="linkcard" href="${esc(v.href)}" target="_blank" rel="noopener noreferrer">
      <span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>
      <div><b>${esc(l.linkLabel || (v.kind === 'link' ? 'Open the lesson material' : 'Watch the lesson video'))}</b><small>${esc(v.host)} · opens in a new tab</small></div></a>`;
  }

  async function lessonView(id) {
    const meta = cat.lessons.find((x) => x.id === id);
    app.innerHTML = (meta ? rail(meta) : '') + '<div id="lp"><div class="empty">Opening the lesson…</div></div>';
    let l;
    try { ({ lesson: l } = await api.lesson(id)); }
    catch (e) { return lockedPage(e, 'lesson', '#course', 'Back to the course'); }
    const list = bySection(l.section);
    const i = list.findIndex((x) => x.id === l.id);
    const prev = list[i - 1], next = list[i + 1];
    const navLink = (x, cls, label) => `<a class="${cls}" href="${x.locked ? '#' : '#lesson-' + esc(x.id)}" ${x.locked ? `data-locked="lesson" data-title="${esc(x.title)}"` : ''}><small>${label}</small>${esc(x.title)}</a>`;
    app.innerHTML = `${rail(meta || l)}
      <article class="lesson"><div class="wrap"><div class="lesson-col">
        <header class="lesson-head">
          <div class="eyebrow">${SECTION_NAME[l.section]} · Step ${i + 1} of ${list.length}</div>
          <h1>${esc(l.title)}</h1>
          ${l.summary ? `<p class="summary">${esc(l.summary)}</p>` : ''}
          <div class="lesson-meta">${l.duration ? `<span>${esc(l.duration)} read</span>` : ''}${l.quiz.length ? `<span>${l.quiz.length}-question quiz at the end</span>` : ''}${l.progress ? `<span>Your best: ${l.progress.best}/5</span>` : ''}</div>
        </header>
        ${media(l)}
        <div class="prose">${renderText(l.body)}</div>
        ${l.quiz.length ? quizHtml(l.quiz) : ''}
        <nav class="pager">
          ${prev ? navLink(prev, 'prev', '← Previous step') : '<span></span>'}
          ${next ? navLink(next, 'next', next.locked ? 'Next step · contact admin' : 'Next step →') : '<span></span>'}
        </nav>
      </div></div></article>`;
    if (l.quiz.length) wireQuiz(l, next);
    const cur = app.querySelector('.chip.current');
    if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function quizHtml(quiz) {
    return `<section class="quiz" aria-labelledby="quiz-title">
      <div class="quiz-head"><h2 id="quiz-title">Check your knowledge</h2><span class="qcount" id="qcount">0 of ${quiz.length} answered</span></div>
      <p class="muted" style="margin:0">Pick one answer for each question, then check your score out of ${quiz.length}.</p>
      <form id="quiz-form">
        ${quiz.map((q, qi) => `<fieldset class="question" data-q="${qi}">
          <legend><span class="qn">${qi + 1}.</span><span>${esc(q.q)}</span></legend>
          <div class="opts">${q.options.map((o, oi) => o ? `<label class="opt" data-o="${oi}"><input type="radio" id="q${qi}o${oi}" name="q${qi}" value="${oi}"><span>${esc(o)}</span></label>` : '').join('')}</div>
          <div class="explain" hidden></div>
        </fieldset>`).join('')}
        <div id="result"></div>
        <p class="err" id="quiz-err"></p>
        <div class="quiz-actions">
          <button class="btn btn-primary" type="submit" id="check" disabled>Check my answers</button>
          <button class="btn btn-ghost" type="button" id="retry" hidden>Try again</button>
          <a class="btn btn-primary" id="go-next" hidden></a>
        </div>
      </form>
    </section>`;
  }

  function wireQuiz(l, next) {
    const form = document.getElementById('quiz-form');
    const check = document.getElementById('check');
    const n = l.quiz.length;
    const picked = () => l.quiz.map((_, i) => { const x = form.querySelector(`input[name="q${i}"]:checked`); return x ? Number(x.value) : null; });
    form.addEventListener('change', () => {
      const k = picked().filter((x) => x !== null).length;
      document.getElementById('qcount').textContent = `${k} of ${n} answered`;
      check.disabled = k < n;
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const answers = picked();
      if (answers.includes(null)) return;
      check.disabled = true; check.textContent = 'Checking…';
      let out;
      try { out = await api.submit(l.id, answers); }
      catch (err) { document.getElementById('quiz-err').textContent = err.message; check.disabled = false; check.textContent = 'Check my answers'; return; }
      out.results.forEach((r, qi) => {
        const fs = form.querySelector(`[data-q="${qi}"]`);
        const ok = r.correct === r.picked;
        fs.classList.add('answered');
        fs.querySelectorAll('input').forEach((inp) => (inp.disabled = true));
        fs.querySelector(`[data-o="${r.correct}"]`)?.classList.add('correct');
        if (!ok) fs.querySelector(`[data-o="${r.picked}"]`)?.classList.add('wrong');
        const ex = fs.querySelector('.explain');
        ex.hidden = false; ex.classList.toggle('no', !ok);
        ex.innerHTML = `<b>${ok ? 'Correct.' : 'Not quite.'}</b> ${esc(r.explain)}`;
      });
      const meta = cat.lessons.find((x) => x.id === l.id);
      if (meta) meta.progress = out.progress;
      api.catalog().then((c) => { cat = c; }).catch(() => {});
      showResult(out.score, out.total);
      check.hidden = true;
      document.getElementById('retry').hidden = false;
      const go = document.getElementById('go-next');
      if (next && !next.locked) { go.hidden = false; go.href = '#lesson-' + next.id; go.textContent = 'Next step: ' + next.title; }
      else if (next) { go.hidden = false; go.href = '#'; go.dataset.locked = 'lesson'; go.dataset.title = next.title; go.textContent = 'Contact admin for the next step'; }
      const chip = document.querySelector('.chip.current');
      if (chip) { chip.classList.add('done'); chip.querySelector('.dot').textContent = '✓'; chip.querySelector('small')?.remove(); chip.insertAdjacentHTML('beforeend', `<small>${out.progress.best}/5</small>`); }
      if (out.score === out.total) confetti();
    });
    document.getElementById('retry').addEventListener('click', async () => {
      await lessonView(l.id);
      document.getElementById('quiz-title')?.scrollIntoView({ block: 'start' });
    });
  }

  function showResult(score, total) {
    const Cc = 2 * Math.PI * 46;
    const msg = score === total ? ['Perfect score!', 'You really know this step. Your clients are in good hands.']
      : score >= total - 1 ? ['So close!', 'Look at the one you missed below, then carry on.']
      : score >= Math.ceil(total / 2) ? ['Good effort', 'Read the explanations below, review the lesson, and try again for a full score.']
      : ['Keep going', 'Go back over the lesson, then try again. Every pro started here.'];
    const box = document.getElementById('result');
    box.innerHTML = `<div class="result" role="status">
      <div class="ring ${score === total ? 'full' : ''}"><svg viewBox="0 0 112 112" aria-hidden="true"><circle class="track" cx="56" cy="56" r="46"/><circle class="val" cx="56" cy="56" r="46" stroke-dasharray="${Cc}" stroke-dashoffset="${Cc}"/></svg>
        <span class="lbl"><span>${score}<small>/${total}</small></span></span></div>
      <div><h3>${msg[0]}</h3><p>You scored <b>${score} out of ${total}</b>. ${msg[1]}</p></div></div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => { box.querySelector('.val').style.strokeDashoffset = Cc * (1 - score / total); }));
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = document.createElement('div');
    layer.className = 'confetti';
    const cs = getComputedStyle(document.documentElement);
    const colors = ['--lacquer', '--gold', '--lacquer-soft', '--tip'].map((v) => cs.getPropertyValue(v).trim() || '#a3173f');
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 1.8 + Math.random() * 1.8 + 's';
      p.style.animationDelay = Math.random() * .4 + 's';
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 4200);
  }

  // ---------- booking (sends a ready-made message on WhatsApp) ----------
  const pad = (n) => String(n).padStart(2, '0');
  const localISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const toMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };
  const label12 = (min) => { const h = Math.floor(min / 60), m = min % 60; return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`; };
  function timeSlots(dateIso) {
    const s = site(), from = toMin(s.bookFrom || '09:00'), to = toMin(s.bookTo || '18:00');
    const now = new Date(), today = localISO(now) === dateIso, nowMin = now.getHours() * 60 + now.getMinutes() + 60;
    const out = [];
    for (let t = from; t <= to - 30; t += 30) if (!today || t >= nowMin) out.push(t);
    return out;
  }
  const isClosed = (iso) => (site().closedDays || []).includes(new Date(iso + 'T12:00:00').getDay());
  function nextOpenDay() { const d = new Date(); for (let i = 0; i < 14; i++) { const iso = localISO(d); if (!isClosed(iso) && timeSlots(iso).length) return iso; d.setDate(d.getDate() + 1); } return localISO(new Date()); }

  function bookingModal(service = '') {
    const u = me(), services = cat.services;
    if (!C.waNumber(site().whatsapp)) { openModal('<h2 id="modal-title">Booking is coming soon</h2><p>Online booking opens as soon as our WhatsApp number is added.</p>'); return; }
    const day = nextOpenDay();
    const max = new Date(); max.setDate(max.getDate() + 90);
    const days = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
    const closedText = (site().closedDays || []).map((d) => days[d]).join(' and ');
    openModal(`<form class="book-form" id="book-form" novalidate>
      <div class="eyebrow">Book an appointment</div>
      <h2 id="modal-title">Pick a time</h2>
      <p class="book-sub">We open WhatsApp with your booking written out. Just press send, and we confirm your slot.</p>
      <label class="field"><span>Service</span><select id="b-service" required>
        ${services.map((x) => `<option ${x.title === service ? 'selected' : ''}>${esc(x.title)}</option>`).join('')}<option ${service && !services.some((x) => x.title === service) ? 'selected' : ''}>Something else</option></select></label>
      <div class="grid2b">
        <label class="field"><span>Date</span><input type="date" id="b-date" value="${day}" min="${localISO(new Date())}" max="${localISO(max)}" required></label>
        <label class="field"><span>Time</span><select id="b-time" required></select></label>
      </div>
      <p class="hint" id="b-hint">${closedText ? `We are closed on ${closedText}.` : ''} Open ${label12(toMin(site().bookFrom || '09:00'))} – ${label12(toMin(site().bookTo || '18:00'))}.</p>
      <label class="field"><span>Your name</span><input type="text" id="b-name" value="${esc(u ? u.name : '')}" autocomplete="name" required maxlength="80"></label>
      <label class="field"><span>Phone</span><input type="tel" id="b-phone" value="${esc(u ? u.phone || '' : '')}" placeholder="07XX XXX XXX" autocomplete="tel" required maxlength="40"></label>
      <label class="field"><span>Note (optional)</span><textarea id="b-note" rows="2" maxlength="300" placeholder="Design idea, nail length, or anything we should know"></textarea></label>
      <p class="err" id="b-err"></p>
      <button type="submit" class="btn btn-wa">${ICON.whatsapp}<span>Book on WhatsApp</span></button>
      <div id="b-done"></div>
    </form>`);
    const $b = (id) => document.getElementById(id);
    const fillTimes = () => {
      const iso = $b('b-date').value, sel = $b('b-time'), keep = sel.value;
      const slots = iso && !isClosed(iso) ? timeSlots(iso) : [];
      sel.innerHTML = slots.length ? slots.map((t) => `<option value="${t}">${label12(t)}</option>`).join('') : '<option value="">No times this day</option>';
      if (slots.includes(Number(keep))) sel.value = keep;
      sel.disabled = !slots.length;
    };
    fillTimes();
    $b('b-date').addEventListener('change', fillTimes);
    $b('book-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const err = $b('b-err'); err.textContent = '';
      const iso = $b('b-date').value, time = $b('b-time').value, name = $b('b-name').value.trim(), phone = $b('b-phone').value.trim();
      if (!iso || isClosed(iso)) return (err.textContent = 'Please pick a day we are open.');
      if (!time) return (err.textContent = 'Please pick a time.');
      if (!name) return (err.textContent = 'Please add your name.');
      if (phone.replace(/\D/g, '').length < 9) return (err.textContent = 'Please add a phone number we can reach you on.');
      const note = $b('b-note').value.trim();
      const msg = ['Hello! I would like to book an appointment.', '', `Service: ${$b('b-service').value}`,
        `Date: ${fmtDate(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`, `Time: ${label12(Number(time))}`,
        `Name: ${name}`, `Phone: ${phone}`, note ? `Note: ${note}` : ''].filter((x) => x !== '').join('\n');
      const url = contactLinks(site(), msg).whatsapp;
      window.open(url, '_blank', 'noopener');
      $b('b-done').innerHTML = `<div class="book-done">${ICON.check}<div><b>Your booking is ready in WhatsApp.</b><span>Press send there and we will confirm. Did WhatsApp not open? <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Tap here</a>.</span></div></div>`;
    });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-book]');
    if (b) { e.preventDefault(); bookingModal(b.dataset.book || ''); }
  });

  // ---------- services ----------
  function serviceCard(x) {
    return `<article class="svc-card">
      <div class="svc-photo">${x.image ? `<img src="${esc(x.image)}" alt="${esc(x.title)}" loading="lazy">` : `<span class="svc-mark" aria-hidden="true">${esc(String(site().name || 'É').trim()[0])}</span>`}</div>
      <div class="svc-body">
        <div class="svc-top"><h3>${esc(x.title)}</h3><span class="svc-price">${esc(x.price || 'Price on request')}</span></div>
        ${x.duration ? `<span class="svc-time">${ICON.clock}<span>${esc(x.duration)}</span></span>` : ''}
        ${x.description ? `<p>${esc(x.description)}</p>` : ''}
        <div class="svc-cta"><button type="button" class="btn btn-primary btn-sm" data-book="${esc(x.title)}">${ICON.calendar}<span>Book appointment</span></button></div>
      </div>
    </article>`;
  }
  function servicesView() {
    app.innerHTML = pageHead('Services', 'Our services', 'Book a nail appointment at our studio. Pick a service, a day and a time, and send it to us on WhatsApp.') + `
      <section class="section"><div class="wrap stack-lg">
        <div class="banner"><div><b>Ready for new nails?</b> Book in under a minute. We confirm on WhatsApp.</div><button type="button" class="btn btn-primary btn-sm" data-book="">${ICON.calendar}<span>Book appointment</span></button></div>
        <div class="svc-grid">${cat.services.map(serviceCard).join('') || '<p class="muted">Our service list is coming soon.</p>'}</div>
      </div></section>`;
  }

  // ---------- shop ----------
  const cartKey = () => 'mna_cart_' + ((me() && me().email) || 'guest');
  const getCart = () => window.MNA.storage.get(cartKey(), {});
  const setCart = (c) => { window.MNA.storage.set(cartKey(), c); updateCartBadge(); };
  const cartLines = () => Object.entries(getCart()).map(([id, qty]) => ({ p: cat.products.find((x) => x.id === id), qty })).filter((l) => l.p && l.p.stock !== 'out' && l.p.price);
  const cartCount = () => cartLines().reduce((a, l) => a + l.qty, 0);
  function updateCartBadge() {
    const n = cartCount();
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = n; el.hidden = !n; });
  }
  const STOCK = { in: ['In stock', 'ok'], low: ['Few left', 'low'], out: ['Out of stock', 'out'] };
  const ORDER_STATUS = { new: 'Received', confirmed: 'Confirmed', delivered: 'Delivered', cancelled: 'Cancelled' };

  async function shopView() {
    const u = me();
    const head = pageHead('Shop', 'Shop', 'Nail products we use and trust, for students of the academy.');
    if (!u) { app.innerHTML = head + `<section class="section"><div class="wrap"><div class="banner"><div><b>Sign in to shop.</b> The shop is open to students who sign in with Google.</div>${googleButton()}</div></div></section>`; return; }
    if (!u.enrolled) { app.innerHTML = head + `<section class="section"><div class="wrap"><div class="banner"><div><b>Almost there.</b> Finish enrolling to open the shop.</div><a class="btn btn-primary btn-sm" href="#enroll">Finish enrolling</a></div></div></section>`; return; }
    if (!cat.shopOpen) {
      app.innerHTML = head + `<section class="section"><div class="wrap"><div class="soon-card">${ICON.bag}<h2>Products are coming soon</h2>
        <p>We are stocking the shop with the polishes, gels and tools we use in class. Ask us on WhatsApp if you need something now.</p>
        <div class="row-c">${contactButtons('Hello, I would like to buy nail products.', { compact: true })}</div></div></div></section>`;
      return;
    }
    app.innerHTML = head + `<section class="section"><div class="wrap">
      <div class="shop-layout">
        <div class="product-grid" id="products"></div>
        <aside class="cart" id="cart" aria-label="Your cart"></aside>
      </div>
      <div id="my-orders"></div>
    </div></section>
    <a class="cart-fab" href="#cart" id="cart-fab" hidden>${ICON.bag}<span id="fab-text"></span></a>`;
    drawProducts(); drawCart(); drawOrders();
    document.getElementById('cart-fab').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('cart').scrollIntoView({ behavior: 'smooth' }); });
  }

  function stepper(id, qty) {
    return `<span class="stepper"><button type="button" data-qty="${esc(id)}" data-d="-1" aria-label="One less">−</button><b>${qty}</b><button type="button" data-qty="${esc(id)}" data-d="1" aria-label="One more">+</button></span>`;
  }
  function changeQty(id, d) {
    const c = getCart();
    c[id] = Math.max(0, Math.min(99, (c[id] || 0) + d));
    if (!c[id]) delete c[id];
    setCart(c); drawProducts(); drawCart();
  }
  function drawProducts() {
    const c = getCart();
    const box = document.getElementById('products');
    box.innerHTML = cat.products.map((x) => {
      const [label, cls] = STOCK[x.stock];
      const can = x.stock !== 'out' && x.price;
      return `<article class="product">
        <div class="product-photo">${x.image ? `<img src="${esc(x.image)}" alt="${esc(x.title)}" loading="lazy">` : '<span class="photo-soon">Photo coming soon</span>'}<span class="stock ${cls}">${label}</span></div>
        <div class="product-body">
          ${x.category ? `<small class="cat">${esc(x.category)}</small>` : ''}
          <h3>${esc(x.title)}</h3>
          ${x.description ? `<p>${esc(x.description)}</p>` : ''}
          <div class="product-foot"><b class="price">${x.price ? C.ksh(x.price) : 'Ask for price'}</b>
            ${!can ? '' : c[x.id] ? stepper(x.id, c[x.id]) : `<button type="button" class="btn btn-primary btn-sm" data-qty="${esc(x.id)}" data-d="1">Add to cart</button>`}</div>
        </div>
      </article>`;
    }).join('') || '<p class="muted">New products are on the way.</p>';
    box.querySelectorAll('[data-qty]').forEach((b) => b.addEventListener('click', () => changeQty(b.dataset.qty, Number(b.dataset.d))));
  }
  function drawCart() {
    const lines = cartLines();
    const total = lines.reduce((a, l) => a + l.p.price * l.qty, 0);
    const box = document.getElementById('cart');
    box.innerHTML = `<h2>${ICON.bag}<span>Your cart</span></h2>
      ${lines.length ? `<ul class="cart-lines">${lines.map((l) => `<li><span class="cl-t">${esc(l.p.title)}<small>${C.ksh(l.p.price)} each</small></span>${stepper(l.p.id, l.qty)}<b>${C.ksh(l.p.price * l.qty)}</b></li>`).join('')}</ul>
        <div class="cart-total"><span>Total</span><b>${C.ksh(total)}</b></div>
        <label class="field"><span>Note (optional)</span><textarea id="order-note" rows="2" maxlength="500" placeholder="Colour, delivery area or pick-up time"></textarea></label>
        <p class="muted small">We confirm your order and how to pay on WhatsApp or by phone.</p>
        <p class="err" id="order-err"></p>
        <button type="button" class="btn btn-primary" id="place-order">Place order</button>`
      : '<p class="muted">Your cart is empty. Add products to order them.</p>'}`;
    box.querySelectorAll('[data-qty]').forEach((b) => b.addEventListener('click', () => changeQty(b.dataset.qty, Number(b.dataset.d))));
    document.getElementById('place-order')?.addEventListener('click', placeOrder);
    const fab = document.getElementById('cart-fab');
    if (fab) { fab.hidden = !lines.length; document.getElementById('fab-text').textContent = `${cartCount()} · ${C.ksh(total)}`; }
  }
  async function placeOrder(e) {
    const btn = e.target; btn.disabled = true; btn.textContent = 'Placing order…';
    try {
      const { order } = await api.placeOrder(cartLines().map((l) => ({ id: l.p.id, qty: l.qty })), document.getElementById('order-note').value);
      setCart({}); drawProducts(); drawCart(); drawOrders();
      const wa = contactLinks(site(), C.orderText(order) + `\nName: ${order.name}`).whatsapp;
      openModal(`<div class="modal-lock ok">${ICON.check}</div><h2 id="modal-title">Order ${esc(order.number)} placed</h2>
        <p>Thank you! We have your order for <b>${C.ksh(order.total)}</b> and will contact you to confirm it and arrange payment.</p>
        <div class="modal-actions stack">${wa ? `<a class="btn btn-wa" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">${ICON.whatsapp}<span>Send order on WhatsApp</span></a>` : ''}<button type="button" class="btn btn-ghost" data-close>Keep shopping</button></div>`);
    } catch (err) { document.getElementById('order-err').textContent = err.message; btn.disabled = false; btn.textContent = 'Place order'; }
  }
  async function drawOrders() {
    const box = document.getElementById('my-orders');
    if (!box) return;
    let list = [];
    try { list = await api.myOrders(); } catch { return; }
    box.innerHTML = list.length ? `<h2 class="group-title" style="margin-top:40px">My orders</h2><div class="order-list">${list.map((o) => `<div class="order-row">
        <span><b>${esc(o.number)}</b><small>${new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</small></span>
        <span class="o-items">${o.items.map((l) => `${l.qty} × ${esc(l.title)}`).join(', ')}</span>
        <b>${C.ksh(o.total)}</b><span class="o-status ${o.status}">${ORDER_STATUS[o.status]}</span></div>`).join('')}</div>` : '';
  }

  function aboutView() {
    const s = site();
    app.innerHTML = pageHead('About us', esc(s.name), esc(s.tagline || '')) + `
      <section class="section"><div class="wrap stack-lg">
        ${s.about ? `<div class="about-block prose">${renderText(s.about)}</div>` : ''}
        ${offerGrid()}
        <div class="cta-band"><div><h2>Come and train with us</h2><p>See the next physical class, or start the online course today.</p></div>
          <div class="cta-actions"><a class="btn btn-primary" href="#classes">See classes</a><a class="btn btn-ghost" href="#contact">Contact us</a></div></div>
      </div></section>`;
  }

  function contactView() {
    const s = site(), c = contactLinks(s, 'Hello, I have a question about the nail academy.');
    const rows = [
      c.whatsapp && ['whatsapp', 'WhatsApp', 'Chat with us', c.whatsapp, 'Opens WhatsApp'],
      c.email && ['mail', 'Email', c.email, 'mailto:' + c.email, 'Send an email'],
      c.phone && ['phone', 'Phone', 'Call us', 'reveal', 'Tap to show number'],
      c.tiktok && ['tiktok', 'TikTok', c.tiktokText, c.tiktok, 'Watch our videos'],
      c.instagram && ['instagram', 'Instagram', c.instagramText, c.instagram, 'See our work'],
      s.location && ['pin', 'Studio', s.location, '', s.hours || ''],
    ].filter(Boolean);
    app.innerHTML = pageHead('Contact us', 'Let’s talk nails', 'Ask about classes, fees or the online course. WhatsApp is the fastest way to reach us.') + `
      <section class="section"><div class="wrap">
        <div class="contact-grid">${rows.map(([ic, label, value, href, cta]) => {
          if (href === 'reveal') // number stays hidden until tapped; the next tap calls it
            return `<button type="button" class="contact-card reveal" data-action="reveal-phone"><span class="cc-icon">${ICON[ic]}</span><span class="cc-body"><small>${label}</small><b>${esc(value)}</b><span class="cc-cta">${esc(cta)}</span></span></button>`;
          const open = href ? `a href="${esc(href)}" ${/^https?:/.test(href) ? 'target="_blank" rel="noopener noreferrer"' : ''}` : 'div';
          return `<${open} class="contact-card ${ic === 'whatsapp' ? 'primary' : ''}"><span class="cc-icon">${ICON[ic]}</span><span class="cc-body"><small>${label}</small><b>${esc(value)}</b>${cta ? `<span class="cc-cta">${esc(cta)}</span>` : ''}</span></${href ? 'a' : 'div'}>`;
        }).join('') || '<p class="muted">Contact details will be added soon.</p>'}</div>
      </div></section>`;
  }

  function enrollView() {
    const u = me();
    if (!u) {
      app.innerHTML = `<section class="section"><div class="wrap"><div class="form-card">
        <div class="eyebrow">Enroll</div><h1>Join the academy</h1>
        <p>Sign in with Google to create your student account. Your progress is saved to it, so you can carry on from any phone or computer.</p>
        ${googleButton()}</div></div></section>`;
      return;
    }
    if (u.enrolled) { location.hash = 'art'; return; }
    app.innerHTML = `<section class="section"><div class="wrap"><form class="form-card" id="enroll-form">
      <div class="eyebrow">Enroll</div><h1>Welcome, ${esc(u.name.split(' ')[0])}</h1>
      <p>Add your details so we can reach you about classes and unlocking lessons. Lesson 1 opens as soon as you finish.</p>
      <label class="field"><span>Full name</span><input type="text" id="e-name" value="${esc(u.name)}" autocomplete="name" required maxlength="80"></label>
      <label class="field"><span>Phone / WhatsApp number</span><input type="tel" id="e-phone" placeholder="07XX XXX XXX" autocomplete="tel" required maxlength="40"></label>
      <label class="field"><span>Town or county</span><input type="text" id="e-loc" placeholder="Nairobi" maxlength="120"></label>
      <p class="muted small">Signed in as ${esc(u.email)}.</p>
      <p class="err" id="e-err"></p>
      <button class="btn btn-primary" type="submit">Finish enrolling</button>
    </form></div></section>`;
    document.getElementById('enroll-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type=submit]');
      btn.disabled = true;
      try {
        await api.enroll({ name: document.getElementById('e-name').value, phone: document.getElementById('e-phone').value, location: document.getElementById('e-loc').value });
        await reload();
        location.hash = 'art';
      } catch (err) { document.getElementById('e-err').textContent = err.message; btn.disabled = false; }
    });
  }

  function meView() {
    const u = me(), p = cat.progress;
    if (!u || !u.enrolled) { location.hash = u ? 'enroll' : 'course'; return; }
    const open = cat.lessons.filter((l) => !l.locked);
    app.innerHTML = pageHead('My progress', esc(u.name), esc(u.email) + (u.phone ? ' · ' + esc(u.phone) : '')) + `
      <section class="section"><div class="wrap stack-lg">
        <div class="me-stats">
          <div class="big-ring" style="--p:${p.percent}"><span><b>${p.percent}%</b><small>complete</small></span></div>
          <dl><div><dt>Steps done</dt><dd>${p.done} of ${p.total}</dd></div><div><dt>Quiz points</dt><dd>${p.points} of ${p.maxPoints}</dd></div><div><dt>Lessons open to you</dt><dd>${open.length}</dd></div></dl>
        </div>
        <div><h2 class="group-title">Your scores</h2>
          <div class="score-list">${cat.lessons.map((l, i) => `<div class="score-row ${l.locked ? 'locked' : ''}"><span class="n">${i + 1}</span><span class="t">${esc(l.title)}</span>
            ${l.locked ? `<button type="button" class="link-btn" data-locked="lesson" data-title="${esc(l.title)}">${ICON.lock}<span>Contact admin</span></button>` : l.progress ? `<span class="score-pill ${l.progress.best === 5 ? 'full' : ''}">${l.progress.best}/5</span>` : `<a href="#lesson-${esc(l.id)}">Start</a>`}</div>`).join('')}</div>
        </div>
      </div></section>`;
  }

  // ---------- router ----------
  function route() {
    closeModal();
    document.body.classList.remove('menu-open');
    // Signed-in students open on Art work; visitors open on Home.
    let h = location.hash.replace(/^#\/?/, '') || (me() && me().enrolled ? 'art' : 'home');
    if (h === 'signin-failed' || h === 'signin-off') {
      const msg = h === 'signin-off' ? 'Google sign-in is not switched on yet.' : 'Google sign-in did not finish. Please try again.';
      history.replaceState(null, '', '#home'); h = 'home';
      setTimeout(() => openModal(`<h2 id="modal-title">Sign-in problem</h2><p>${msg}</p><div class="modal-actions">${contactButtons('Hello, I could not sign in to the nail course.', { compact: true })}</div>`), 50);
    }
    const nav = h.startsWith('lesson-') ? 'course' : h.startsWith('design-') ? 'art' : h;
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === nav));
    window.scrollTo(0, 0);
    if (h.startsWith('lesson-')) return lessonView(h.slice(7));
    if (h.startsWith('design-')) return designView(h.slice(7));
    ({ services: servicesView, shop: shopView, classes: classesView, course: courseView, art: artView, about: aboutView, contact: contactView, enroll: enrollView, me: meView }[h] || home)();
  }

  // Preview only: a switch to jump between what clients see and the admin.
  function previewSwitch() {
    if (!PREVIEW || document.getElementById('preview-switch')) return;
    const a = document.createElement('a');
    a.id = 'preview-switch'; a.className = 'preview-switch'; a.href = 'admin.html';
    a.innerHTML = '<span>Preview · viewing as a <b>client</b></span><strong>Open admin →</strong>';
    document.body.appendChild(a);
  }

  async function reload() { cat = await api.catalog(); chrome(); updateCartBadge(); previewSwitch(); }

  reload().then(() => { route(); window.addEventListener('hashchange', route); })
    .catch((e) => { app.innerHTML = `<div class="empty"><h2>We could not load the site</h2><p>${esc(e.message)}</p></div>`; });
})();
