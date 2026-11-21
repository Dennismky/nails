// Student site: landing, classes, course (locked/unlocked), lessons with server-marked quizzes,
// art work photos and steps, about, contact, enrollment and "my progress".
(function () {
  const { C, esc, renderText, videoInfo, contactLinks, api, MARK, brandHtml, ICON, fmtDate, PREVIEW } = window.MNA;
  const app = document.getElementById('app');
  let cat = { site: {}, lessons: [], designs: [], classes: [], me: null, progress: null };
  const SECTION_NAME = { course: 'Foundations', art: 'Nail art techniques' };
  const bySection = (s) => cat.lessons.filter((l) => l.section === s);
  const site = () => cat.site || {};
  const me = () => cat.me;

  // ---------- small pieces ----------
  const lockBadge = `<span class="lock-badge" aria-hidden="true">${ICON.lock}</span>`;
  const googleButton = (label = 'Sign in with Google') => `<button type="button" class="btn btn-google" data-action="signin">${ICON.google}<span>${label}</span></button>`;
  function contactButtons(message, { compact } = {}) {
    const c = contactLinks(site(), message);
    const out = [];
    if (c.whatsapp) out.push(`<a class="btn btn-wa ${compact ? 'btn-sm' : ''}" href="${esc(c.whatsapp)}" target="_blank" rel="noopener noreferrer">${ICON.whatsapp}<span>Chat on WhatsApp</span></a>`);
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
    const what = kind === 'design' ? 'design' : 'lesson';
    if (!u) {
      openModal(`<div class="modal-lock">${ICON.lock}</div>
        <h2 id="modal-title">Sign in to start learning</h2>
        <p>Sign in with your Google account to open <b>Lesson 1 for free</b>. To unlock “${esc(title)}” and the rest, contact us after you sign in.</p>
        <div class="modal-actions">${googleButton()}</div>
        <div class="modal-or"><span>or talk to us</span></div>
        <div class="modal-actions">${contactButtons('Hello, I would like to join the nail course.', { compact: true })}</div>`);
    } else if (!u.enrolled) {
      openModal(`<div class="modal-lock">${ICON.lock}</div>
        <h2 id="modal-title">One step left</h2>
        <p>Finish enrolling with your phone number, and Lesson 1 opens straight away.</p>
        <div class="modal-actions"><a class="btn btn-primary" href="#enroll" data-close>Finish enrolling</a></div>`);
    } else {
      openModal(`<div class="modal-lock">${ICON.lock}</div>
        <h2 id="modal-title">This ${what} is locked</h2>
        <p>Contact the admin to unlock “${esc(title)}”. Send a message and we will open it for you.</p>
        <div class="modal-actions stack">${contactButtons(`Hello, I am ${u.name} (${u.email}). I would like to unlock "${title}".`) || '<p class="muted">Contact details will be added soon.</p>'}</div>`);
    }
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
    document.getElementById('brand').innerHTML = MARK + `<span class="brand-name">${brandHtml(s.name)}</span>`;
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
      <div class="f-brand">${MARK}<div><b>${esc(s.name)}</b><span>${esc(s.tagline || '')}</span></div></div>
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
    const colors = ['#a3173f', '#c23a62', '#a3173f', '#c23a62', '#a3173f'];
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
      <div class="class-cta">${contactButtons(`Hello, I would like to book a seat in "${c.title}"${c.startDate ? ' starting ' + fmtDate(c.startDate) : ''}.`, { compact: true })}</div>
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
      <section class="hero"><div class="wrap">
        <div class="hero-copy">
          <div class="eyebrow">${esc(s.tagline || 'Nail school · Kenya')}</div>
          <h1>${esc(words.join(' '))} <em>${esc(last)}</em></h1>
          <p class="lead">${esc(s.heroText)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#classes">See our classes</a>
            ${u ? `<a class="btn btn-ghost" href="${u.enrolled ? '#art' : '#enroll'}">${u.enrolled ? 'Go to art work' : 'Finish enrolling'}</a>` : googleButton('Start Lesson 1 free')}
          </div>
        </div>
        <div class="hero-art">${heroArt()}</div>
      </div></section>

      ${offerGrid() ? `<section class="section"><div class="wrap">
        <div class="section-head center"><div class="eyebrow">What we do</div><h2>Training that gets you working</h2></div>${offerGrid()}
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
        ${l.locked ? `<p class="muted">${l.free ? 'Free when you sign in' : 'Locked'}</p>` : `<p>${esc(l.summary)}</p>`}
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
            <span class="art-info"><h3>${esc(d.title)}</h3><span class="meta">${d.level ? `<span>${esc(d.level)}</span>` : ''}${d.free && !d.locked ? '<span class="free-pill">Free</span>' : ''}${d.locked ? '<span>Locked</span>' : ''}</span></span>
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
        <p>This ${kind === 'design' ? 'design' : 'lesson'} is locked.</p><div class="row-c"><button class="btn btn-primary" type="button" data-locked="${kind}" data-title="${esc(e.data.title || '')}">How to unlock</button><a class="btn btn-ghost" href="${back}">${backLabel}</a></div></div></div></section>`;
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
          ${next ? navLink(next, 'next', next.locked ? 'Next step · locked' : 'Next step →') : '<span></span>'}
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
      else if (next) { go.hidden = false; go.href = '#'; go.dataset.locked = 'lesson'; go.dataset.title = next.title; go.textContent = 'Unlock the next step'; }
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
    const colors = ['#a3173f', '#e0577c', '#a77d32', '#f6c9d4', '#d8b26a'];
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
            ${l.locked ? `<button type="button" class="link-btn" data-locked="lesson" data-title="${esc(l.title)}">${ICON.lock}<span>Locked</span></button>` : l.progress ? `<span class="score-pill ${l.progress.best === 5 ? 'full' : ''}">${l.progress.best}/5</span>` : `<a href="#lesson-${esc(l.id)}">Start</a>`}</div>`).join('')}</div>
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
    ({ classes: classesView, course: courseView, art: artView, about: aboutView, contact: contactView, enroll: enrollView, me: meView }[h] || home)();
  }

  async function reload() { cat = await api.catalog(); chrome(); }

  reload().then(() => { route(); window.addEventListener('hashchange', route); })
    .catch((e) => { app.innerHTML = `<div class="empty"><h2>We could not load the site</h2><p>${esc(e.message)}</p></div>`; });
})();
