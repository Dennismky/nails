// Admin panel: students (progress + unlocking), lessons, art work (photos + steps), classes, site & contact, backup.
(function () {
  const { C, esc, renderText, videoInfo, api, MARK, brandHtml, PREVIEW, resizeImage, fmtDate, ICON } = window.MNA;
  const root = document.getElementById('admin-app');
  const $ = (s, el = document) => el.querySelector(s);
  let data = null, tab = 'students', orderFilter = 'new', sel = { lessons: null, designs: null, classes: null, services: null, products: null }, draft = null, dirty = false, pendingSwitch = null, textMode = 'write', studentId = null, studentQuery = '';

  // ---------- helpers ----------
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function toast(msg, bad) {
    toastEl.textContent = msg; toastEl.className = 'toast' + (bad ? ' bad' : ''); toastEl.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (toastEl.hidden = true), 3400);
  }
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const ago = (t) => { if (!t) return ''; const d = (Date.now() - t) / 864e5; return d < 1 ? 'today' : d < 2 ? 'yesterday' : Math.floor(d) + ' days ago'; };
  const dateOf = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  function armed(btn, label, run) {
    btn.addEventListener('click', async () => {
      if (!btn.classList.contains('armed')) {
        const orig = btn.textContent; btn.classList.add('armed'); btn.textContent = label;
        setTimeout(() => { if (btn.isConnected) { btn.classList.remove('armed'); btn.textContent = orig; } }, 4000);
        return;
      }
      await run();
    });
  }

  // ---------- kinds (lessons, art work, classes) ----------
  const blankQ = () => ({ q: '', options: ['', '', '', ''], answer: 0, explain: '' });
  const KINDS = {
    lessons: {
      title: 'Lessons', one: 'lesson', sections: [['course', 'Foundations'], ['art', 'Nail art techniques']],
      blank: (sec) => ({ section: sec || 'course', title: 'New lesson', summary: '', duration: '', videoUrl: '', linkLabel: '', body: '## Introduction\n\nWrite your lesson here.', published: false, free: false, quiz: [] }),
      normalise(l) {
        const d = clone(l);
        d.quiz = (d.quiz || []).slice(0, 5); while (d.quiz.length < 5) d.quiz.push(blankQ());
        d.quiz.forEach((q) => { q.options = (q.options || []).slice(0, 4); while (q.options.length < 4) q.options.push(''); });
        return d;
      },
      pack(d) {
        const out = clone(d);
        out.quiz = d.quiz.filter((q) => q.q.trim()).map((q) => {
          const keep = q.options.map((o, i) => [o.trim(), i]).filter(([o]) => o);
          return { q: q.q.trim(), options: keep.map(([o]) => o), answer: Math.max(0, keep.findIndex(([, i]) => i === q.answer)), explain: q.explain.trim() };
        });
        return out;
      },
      sub: (l) => { const n = completeQs(l); return `${!l.published ? '<span class="badge">Draft</span>' : ''}${l.free ? '<span class="badge free">Free</span>' : ''}${n < 5 ? `<span class="badge warn">${n}/5 questions</span>` : esc(l.duration || '')}`; },
    },
    designs: {
      title: 'Art work', one: 'design',
      blank: () => ({ title: 'New design', level: 'Beginner', time: '', description: '', tools: '', image: '', steps: [], published: false, free: false }),
      normalise: (d) => ({ ...clone(d), stepsText: (d.steps || []).join('\n') }),
      pack: (d) => { const { stepsText, ...rest } = d; return { ...rest, steps: String(stepsText || '').split('\n').map((s) => s.trim()).filter(Boolean) }; },
      sub: (d) => `${!d.published ? '<span class="badge">Draft</span>' : ''}${d.free ? '<span class="badge free">Free</span>' : ''}${d.image ? '' : '<span class="badge warn">No photo</span>'}${(d.steps || []).length} steps`,
      thumb: (d) => d.image ? `<img class="thumb" src="${esc(d.image)}" alt="">` : '',
    },
    services: {
      title: 'Services', one: 'service',
      blank: () => ({ title: 'New service', price: '', duration: '', description: '', image: '', published: false }),
      normalise: clone, pack: clone,
      sub: (x) => `${!x.published ? '<span class="badge">Hidden</span>' : ''}${esc(x.price || 'No price')}`,
      thumb: (x) => `<img class="thumb" src="${esc(x.image)}" alt="">`,
    },
    products: {
      title: 'Products', one: 'product',
      blank: () => ({ title: 'New product', category: '', price: '', stock: 'in', description: '', image: '', published: false }),
      normalise: clone, pack: clone,
      sub: (x) => `${!x.published ? '<span class="badge">Hidden</span>' : ''}${x.stock === 'out' ? '<span class="badge warn">Out of stock</span>' : x.stock === 'low' ? '<span class="badge">Few left</span>' : ''}${x.price ? C.ksh(x.price) : '<span class="badge warn">No price</span>'}`,
      thumb: (x) => `<img class="thumb" src="${esc(x.image)}" alt="">`,
    },
    classes: {
      title: 'Classes', one: 'class',
      blank: () => ({ title: 'New class', description: '', startDate: '', endDate: '', schedule: '', location: data.site.location || '', fee: '', seats: '', published: true }),
      normalise: clone, pack: clone,
      sub: (c) => { const st = C.classStatus(c); return `${!c.published ? '<span class="badge">Hidden</span>' : ''}<span class="badge st-${st}">${{ ongoing: 'Ongoing', upcoming: 'Starting soon', tba: 'Incoming', past: 'Finished' }[st]}</span>${c.startDate ? fmtDate(c.startDate) : ''}`; },
    },
  };
  const completeQs = (l) => (l.quiz || []).filter((q) => q.q && q.options.filter(Boolean).length >= 2 && q.options[q.answer]).length;

  // ---------- login ----------
  function brand() { document.getElementById('brand').innerHTML = MARK + `<span class="brand-name">${brandHtml(data?.site?.name || 'Maridadi Nail Academy')}</span>`; }
  function loginView() {
    document.getElementById('admin-nav').hidden = true;
    root.innerHTML = `<form class="login" id="login">
      <div class="eyebrow">Admin</div><h1>Welcome back</h1>
      ${PREVIEW ? '<p class="muted" style="margin:0">This is the preview, so no password is needed.</p>' : '<label class="field"><span>Admin password</span><input type="password" id="pw" autocomplete="current-password" required></label>'}
      <p class="err" id="login-err"></p>
      <button class="btn btn-primary" type="submit">${PREVIEW ? 'Enter admin' : 'Log in'}</button>
    </form>`;
    $('#login').addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await api.adminLogin(PREVIEW ? '' : $('#pw').value); start(); } catch (err) { $('#login-err').textContent = err.message; }
    });
    $('#pw')?.focus();
  }
  async function start() {
    try { data = await api.adminData(); } catch { return loginView(); }
    document.getElementById('admin-nav').hidden = false;
    brand();
    render();
  }

  // ---------- layout ----------
  const TABS = [['students', 'Students'], ['orders', 'Orders'], ['lessons', 'Lessons'], ['designs', 'Art work'], ['services', 'Services'], ['products', 'Products'], ['classes', 'Classes'], ['site', 'Site & contact'], ['backup', 'Backup']];
  function render() {
    root.innerHTML = `<div class="wrap">
      <div class="tabs" role="tablist">${TABS.map(([k, n]) => `<button role="tab" type="button" data-tab="${k}" aria-selected="${tab === k}">${n}</button>`).join('')}</div>
      <div id="tab-body"></div></div>`;
    root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
      if (dirty) { toast('Save or discard your changes first.', true); return; }
      tab = b.dataset.tab; draft = null; studentId = null; render();
    }));
    if (KINDS[tab]) kindTab(tab);
    else ({ students: studentsTab, orders: ordersTab, site: siteTab, backup: backupTab })[tab]();
  }

  // ---------- list + editor (lessons, designs, classes) ----------
  const listOf = (kind, sec) => data[kind].filter((x) => !sec || x.section === sec);
  function select(kind, id) {
    const item = data[kind].find((x) => x.id === id);
    sel[kind] = item ? id : null;
    draft = item ? KINDS[kind].normalise(item) : null;
    dirty = false; pendingSwitch = null;
  }
  function kindTab(kind) {
    const K = KINDS[kind];
    if (!sel[kind] || !data[kind].some((x) => x.id === sel[kind])) sel[kind] = data[kind][0]?.id || null;
    if (!draft || draft.id !== sel[kind]) select(kind, sel[kind]);
    const groups = K.sections || [[null, K.title]];
    $('#tab-body').innerHTML = `<div class="board">
      <aside class="side" aria-label="${K.title}">
        ${groups.map(([s, name]) => `<h3>${name}</h3><ol class="items" data-section="${s || ''}">${listOf(kind, s).map((x, i, arr) => itemHtml(kind, x, i, arr.length)).join('') || '<li class="muted small" style="padding:4px">Nothing here yet</li>'}</ol>`).join('')}
        <button class="btn btn-primary btn-sm add" type="button" id="add">+ Add a ${K.one}</button>
      </aside>
      <section class="editor" id="editor">${draft ? editorFor(kind) : `<p class="muted">Pick a ${K.one} on the left, or add a new one.</p>`}</section>
    </div>`;
    wireList(kind);
    if (draft) wireEditor(kind);
  }
  function itemHtml(kind, x, i, n) {
    const K = KINDS[kind];
    return `<li class="item ${x.id === sel[kind] ? 'active' : ''}" data-id="${esc(x.id)}" draggable="true">
      <span class="grip" title="Drag to move" aria-hidden="true">⠿</span>
      ${K.thumb && x.image ? K.thumb(x) : `<span class="n">${i + 1}</span>`}
      <span class="ti">${esc(x.title)}<small>${K.sub(x)}</small></span>
      <span class="mv"><button type="button" data-move="-1" aria-label="Move up" ${i === 0 ? 'disabled' : ''}>↑</button><button type="button" data-move="1" aria-label="Move down" ${i === n - 1 ? 'disabled' : ''}>↓</button></span>
    </li>`;
  }
  async function saveOrder(kind) {
    try { await api.order(kind, data[kind].map((x) => x.id)); toast('Order saved'); } catch (e) { toast(e.message, true); }
  }
  function moveWithin(kind, id, delta) {
    const x = data[kind].find((y) => y.id === id);
    const group = listOf(kind, x.section);
    const i = group.indexOf(x), j = i + delta;
    if (j < 0 || j >= group.length) return;
    const a = data[kind].indexOf(group[i]), b = data[kind].indexOf(group[j]);
    [data[kind][a], data[kind][b]] = [data[kind][b], data[kind][a]];
    kindTab(kind); saveOrder(kind);
  }
  function moveBefore(kind, id, beforeId, section) {
    const x = data[kind].find((y) => y.id === id);
    if (!x || id === beforeId) return;
    if ((x.section || '') !== (section || '')) { toast('To move it to the other group, change "Group" in the editor.', true); return; }
    data[kind].splice(data[kind].indexOf(x), 1);
    if (beforeId) data[kind].splice(data[kind].findIndex((y) => y.id === beforeId), 0, x);
    else { const g = listOf(kind, x.section); const last = g[g.length - 1]; data[kind].splice(last ? data[kind].indexOf(last) + 1 : data[kind].length, 0, x); }
    kindTab(kind); saveOrder(kind);
  }
  function wireList(kind) {
    let dragId = null;
    root.querySelectorAll('.item').forEach((li) => {
      li.addEventListener('click', (e) => {
        const mv = e.target.closest('[data-move]');
        if (mv) { e.stopPropagation(); return moveWithin(kind, li.dataset.id, Number(mv.dataset.move)); }
        if (li.dataset.id === sel[kind]) return;
        if (dirty && pendingSwitch !== li.dataset.id) { pendingSwitch = li.dataset.id; toast('You have unsaved changes. Save them, or click again to discard.', true); return; }
        select(kind, li.dataset.id); kindTab(kind);
      });
      li.addEventListener('dragstart', (e) => { dragId = li.dataset.id; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); });
      li.addEventListener('dragend', () => { li.classList.remove('dragging'); root.querySelectorAll('.drop-above').forEach((x) => x.classList.remove('drop-above')); });
      li.addEventListener('dragover', (e) => { e.preventDefault(); root.querySelectorAll('.drop-above').forEach((x) => x.classList.remove('drop-above')); li.classList.add('drop-above'); });
      li.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); moveBefore(kind, dragId, li.dataset.id, li.parentElement.dataset.section); });
    });
    root.querySelectorAll('.items').forEach((ol) => {
      ol.addEventListener('dragover', (e) => e.preventDefault());
      ol.addEventListener('drop', (e) => { e.preventDefault(); moveBefore(kind, dragId, null, ol.dataset.section); });
    });
    $('#add').addEventListener('click', async () => {
      if (dirty) { toast('Save or discard your changes first.', true); return; }
      const cur = data[kind].find((x) => x.id === sel[kind]);
      try {
        const item = await api.create(kind, KINDS[kind].blank(cur?.section));
        data[kind].push(item); select(kind, item.id); kindTab(kind);
        toast(kind === 'classes' ? 'Class added. Fill in the details and save.' : 'Added as a draft. Students will not see it until you tick "Show to students".');
        $('#f-title')?.select();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ----- editor html -----
  const input = (k, label, v, attrs = '') => `<label class="field"><span>${label}</span><input type="text" id="f-${k}" data-k="${k}" value="${esc(v)}" ${attrs}></label>`;
  const check = (k, label, v, hint = '') => `<label class="check"><input type="checkbox" id="f-${k}" data-k="${k}" ${v ? 'checked' : ''}><span>${label}${hint ? `<small>${hint}</small>` : ''}</span></label>`;
  const saveBar = (one) => `<div class="savebar">
      <span class="state" id="state">All changes saved</span>
      <button class="btn btn-danger btn-sm" type="button" id="delete">Delete ${one}</button>
      <button class="btn btn-ghost btn-sm" type="button" id="discard" hidden>Discard changes</button>
      <button class="btn btn-primary" type="button" id="save">Save ${one}</button></div>`;

  function editorFor(kind) {
    const d = draft;
    if (kind === 'lessons') {
      const list = listOf('lessons', data.lessons.find((l) => l.id === d.id)?.section || d.section);
      return `<div class="editor-head"><div><div class="eyebrow">${d.section === 'art' ? 'Nail art techniques' : 'Foundations'} · step ${list.findIndex((l) => l.id === d.id) + 1}</div><h2 id="ed-title">${esc(d.title)}</h2></div>
          <a class="btn btn-ghost btn-sm" href="index.html#lesson-${esc(d.id)}" target="_blank" rel="noopener">See it as a student</a></div>
        <div class="grid3">${input('title', 'Lesson title', d.title, 'maxlength="120"')}
          <label class="field"><span>Group</span><select id="f-section" data-k="section">${KINDS.lessons.sections.map(([k, n]) => `<option value="${k}" ${d.section === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          ${input('duration', 'Time to read', d.duration, 'placeholder="20 min" maxlength="30"')}</div>
        <label class="field"><span>Short summary</span><textarea id="f-summary" data-k="summary" rows="2" maxlength="300">${esc(d.summary)}</textarea></label>
        <div class="checks">${check('published', 'Show to students', d.published)}${check('free', 'Free for every enrolled student', d.free, 'Like Lesson 1. Other lessons stay locked until you unlock them per student.')}</div>
        <div class="group"><h3>Video or link</h3>
          <div class="grid2"><label class="field"><span>Paste the link</span><input type="url" id="f-video" data-k="videoUrl" value="${esc(d.videoUrl)}" placeholder="https://www.youtube.com/watch?v=..."></label>
          ${input('linkLabel', 'Button text (optional)', d.linkLabel, 'placeholder="Watch the demo video" maxlength="80"')}</div>
          <div class="linkinfo" id="linkinfo">${linkInfo(d.videoUrl)}</div></div>
        <div class="group"><div class="editor-head"><h3>Lesson text</h3>
            <span class="seg" role="group" aria-label="Lesson text view"><button type="button" data-mode="write" aria-pressed="${textMode === 'write'}">Write</button><button type="button" data-mode="preview" aria-pressed="${textMode === 'preview'}">Preview</button></span></div>
          <div class="help">Formatting: <code>## Heading</code> <code>### Small heading</code> <code>- bullet</code> <code>1. step</code> <code>**bold**</code> <code>*italic*</code> <code>&gt; Tip: …</code> <code>&gt; Warning: …</code> <code>&gt; Kenya: …</code> · Leave an empty line between paragraphs.</div>
          <div id="body-wrap" ${textMode === 'preview' ? 'hidden' : ''}><textarea class="body-text input" id="f-body" data-k="body" aria-label="Lesson text">${esc(d.body)}</textarea></div>
          <div class="text-preview prose" id="body-preview" ${textMode === 'write' ? 'hidden' : ''}>${renderText(d.body)}</div></div>
        <div class="group"><div class="editor-head"><h3>Quiz: 5 questions</h3><span class="muted" id="qstatus">${completeQs(d)}/5 ready</span></div>
          <p class="qhint">Write the question and up to four answers. Tick the circle next to the right answer. The explanation shows after students check their score.</p>
          ${d.quiz.map((q, qi) => `<div class="qcard" data-qi="${qi}"><div class="qtop"><b>Question ${qi + 1}</b></div>
            <input type="text" class="input" id="q${qi}-text" data-q="q" value="${esc(q.q)}" placeholder="Type question ${qi + 1}" aria-label="Question ${qi + 1}" maxlength="300">
            ${q.options.map((o, oi) => `<div class="optrow ${q.answer === oi ? 'is-right' : ''}"><input type="radio" name="right-${qi}" id="q${qi}-r${oi}" value="${oi}" ${q.answer === oi ? 'checked' : ''} aria-label="Answer ${'ABCD'[oi]} is the right one">
              <input type="text" class="input" id="q${qi}-o${oi}" data-o="${oi}" value="${esc(o)}" placeholder="Answer ${'ABCD'[oi]}${oi > 1 ? ' (optional)' : ''}" aria-label="Question ${qi + 1}, answer ${'ABCD'[oi]}" maxlength="200"></div>`).join('')}
            <input type="text" class="input" id="q${qi}-ex" data-q="explain" value="${esc(q.explain)}" placeholder="Explanation: why this answer is right" aria-label="Explanation for question ${qi + 1}" maxlength="500"></div>`).join('')}</div>
        ${saveBar('lesson')}`;
    }
    if (kind === 'designs') {
      return `<div class="editor-head"><div><div class="eyebrow">Art work</div><h2 id="ed-title">${esc(d.title)}</h2></div>
          <a class="btn btn-ghost btn-sm" href="index.html#design-${esc(d.id)}" target="_blank" rel="noopener">See it as a student</a></div>
        ${photoEditor(d)}
        <div class="grid3">${input('title', 'Design name', d.title, 'maxlength="120"')}${input('level', 'Level', d.level, 'placeholder="Beginner" maxlength="40"')}${input('time', 'Time', d.time, 'placeholder="45 min" maxlength="40"')}</div>
        <label class="field"><span>Description</span><textarea id="f-description" data-k="description" rows="3" maxlength="2000" placeholder="What the design is and who it suits.">${esc(d.description)}</textarea></label>
        <label class="field"><span>Tools & products needed</span><textarea id="f-tools" data-k="tools" rows="2" maxlength="1000" placeholder="Base gel, white gel, liner brush, top coat, LED lamp">${esc(d.tools)}</textarea></label>
        <label class="field"><span>Steps to follow</span><textarea id="f-steps" data-k="stepsText" rows="9" placeholder="One step per line">${esc(d.stepsText)}</textarea><small id="steps-count">${d.stepsText.split('\n').filter((s) => s.trim()).length} steps · one step per line</small></label>
        <div class="checks">${check('published', 'Show to students', d.published)}${check('free', 'Free for every enrolled student', d.free, 'Otherwise it stays locked until you unlock it for a student.')}</div>
        ${saveBar('design')}`;
    }
    if (kind === 'services') {
      return `<div class="editor-head"><div><div class="eyebrow">Service</div><h2 id="ed-title">${esc(d.title)}</h2></div>
          <a class="btn btn-ghost btn-sm" href="index.html#services" target="_blank" rel="noopener">See services page</a></div>
        ${photoEditor(d, 'A photo of this service, e.g. a finished set. Landscape works best.')}
        <div class="grid3">${input('title', 'Service name', d.title, 'maxlength="120"')}${input('price', 'Price', d.price, 'placeholder="KSh 1,500 or from KSh 1,200" maxlength="60"')}${input('duration', 'Time', d.duration, 'placeholder="1 hr" maxlength="40"')}</div>
        <label class="field"><span>Description</span><textarea id="f-description" data-k="description" rows="3" maxlength="1500">${esc(d.description)}</textarea></label>
        <div class="checks">${check('published', 'Show on the website', d.published, 'Anyone can see services. Students book them on WhatsApp.')}</div>
        ${saveBar('service')}`;
    }
    if (kind === 'products') {
      return `<div class="editor-head"><div><div class="eyebrow">Shop product</div><h2 id="ed-title">${esc(d.title)}</h2></div>
          <a class="btn btn-ghost btn-sm" href="index.html#shop" target="_blank" rel="noopener">See the shop</a></div>
        ${data.site.shopOpen ? '' : '<p class="help">The shop is closed, so students see "Coming soon". Open it in Site & contact when your products are ready.</p>'}
        ${photoEditor(d, 'A clear photo of the product on a plain background. Square works best.')}
        <div class="grid3">${input('title', 'Product name', d.title, 'maxlength="120"')}
          <label class="field"><span>Price (KSh)</span><input type="text" inputmode="numeric" id="f-price" data-k="price" value="${esc(d.price || '')}" placeholder="1200"></label>
          <label class="field"><span>Stock</span><select id="f-stock" data-k="stock"><option value="in" ${d.stock === 'in' ? 'selected' : ''}>In stock</option><option value="low" ${d.stock === 'low' ? 'selected' : ''}>Few left</option><option value="out" ${d.stock === 'out' ? 'selected' : ''}>Out of stock</option></select></label></div>
        ${input('category', 'Category', d.category, 'placeholder="Gel polish, Tools, Kits" maxlength="60"')}
        <label class="field"><span>Description</span><textarea id="f-description" data-k="description" rows="3" maxlength="1500">${esc(d.description)}</textarea></label>
        <div class="checks">${check('published', 'Show in the shop', d.published, 'Only signed-in students see the shop.')}</div>
        ${saveBar('product')}`;
    }
    const st = C.classStatus(d);
    return `<div class="editor-head"><div><div class="eyebrow">Physical class</div><h2 id="ed-title">${esc(d.title)}</h2></div><span class="badge st-${st} big" id="class-status">${{ ongoing: 'Ongoing now', upcoming: 'Starting soon', tba: 'Incoming: no dates yet', past: 'Finished: hidden from students' }[st]}</span></div>
      ${input('title', 'Class name', d.title, 'maxlength="120"')}
      <label class="field"><span>Description</span><textarea id="f-description" data-k="description" rows="3" maxlength="2000" placeholder="What students will learn and what is included.">${esc(d.description)}</textarea></label>
      <div class="grid2"><label class="field"><span>Start date</span><input type="date" id="f-startDate" data-k="startDate" value="${esc(d.startDate)}"><small>Leave empty to show it as "Incoming".</small></label>
        <label class="field"><span>End date</span><input type="date" id="f-endDate" data-k="endDate" value="${esc(d.endDate)}"><small>Leave empty for a one-day class.</small></label></div>
      <div class="grid2">${input('schedule', 'Days & time', d.schedule, 'placeholder="Mon – Fri, 9am – 4pm" maxlength="120"')}${input('location', 'Location', d.location, 'placeholder="Kilimani, Nairobi" maxlength="160"')}</div>
      <div class="grid2">${input('fee', 'Fee', d.fee, 'placeholder="KSh 25,000" maxlength="80"')}${input('seats', 'Seats', d.seats, 'placeholder="8 seats left" maxlength="40"')}</div>
      <div class="checks">${check('published', 'Show to students', d.published)}</div>
      ${saveBar('class')}`;
  }

  function photoEditor(d, hint = 'A clear, well-lit photo. It is resized before upload.') {
    return `<div class="photo-edit">
      <div class="photo-box" id="photo-box">${d.image ? `<img src="${esc(d.image)}" alt="">` : '<span>No photo yet</span>'}</div>
      <div class="photo-actions">
        <b>Photo</b><p class="muted small">${hint}</p>
        <div class="row"><label class="btn btn-primary btn-sm" for="f-photo">${d.image ? 'Replace photo' : 'Upload photo'}</label>
          <input type="file" id="f-photo" accept="image/jpeg,image/png,image/webp" hidden>
          ${d.image ? '<button type="button" class="btn btn-ghost btn-sm" id="photo-remove">Remove</button>' : ''}</div>
        <p class="err" id="photo-err"></p>
      </div>
    </div>`;
  }

  function linkInfo(url) {
    if (!url) return '<b>No link yet</b><span>Paste a YouTube, Vimeo, TikTok, Instagram or Google Drive link above, or leave it empty for a text-only lesson.</span>';
    const v = videoInfo(url);
    if (!v) return '<b>Check this link</b><span>That does not look like a web link. It should start with https://</span>';
    return `<b>Current link</b><a href="${esc(v.href)}" target="_blank" rel="noopener noreferrer">${esc(v.href)}</a><span>${esc(v.embed ? `${v.host} video: it plays inside the lesson.` : `${v.host} link: students get a button that opens it in a new tab.`)}</span>`;
  }

  function markDirty(kind) {
    dirty = true; pendingSwitch = null;
    const st = $('#state'); st.textContent = 'Unsaved changes'; st.classList.add('dirty');
    $('#discard').hidden = false;
    if (kind === 'lessons') $('#qstatus').textContent = completeQs(KINDS.lessons.pack(draft)) + '/5 ready';
  }

  function wireEditor(kind) {
    const ed = $('#editor');
    ed.querySelectorAll('[data-k]').forEach((el) => el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'date' ? 'change' : 'input', () => {
      draft[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.value;
      if (el.dataset.k === 'title') $('#ed-title').textContent = el.value || 'Untitled';
      if (el.dataset.k === 'videoUrl') $('#linkinfo').innerHTML = linkInfo(el.value.trim());
      if (el.dataset.k === 'stepsText') $('#steps-count').textContent = el.value.split('\n').filter((s) => s.trim()).length + ' steps · one step per line';
      if (kind === 'classes' && /Date$/.test(el.dataset.k)) { const s = C.classStatus(draft); const b = $('#class-status'); b.className = `badge st-${s} big`; b.textContent = { ongoing: 'Ongoing now', upcoming: 'Starting soon', tba: 'Incoming: no dates yet', past: 'Finished: hidden from students' }[s]; }
      markDirty(kind);
    }));
    if (kind === 'lessons') {
      ed.querySelectorAll('.qcard').forEach((card) => {
        const q = draft.quiz[Number(card.dataset.qi)];
        card.querySelectorAll('[data-q]').forEach((el) => el.addEventListener('input', () => { q[el.dataset.q] = el.value; markDirty(kind); }));
        card.querySelectorAll('[data-o]').forEach((el) => el.addEventListener('input', () => { q.options[Number(el.dataset.o)] = el.value; markDirty(kind); }));
        card.querySelectorAll('input[type=radio]').forEach((el) => el.addEventListener('change', () => {
          q.answer = Number(el.value);
          card.querySelectorAll('.optrow').forEach((r, i) => r.classList.toggle('is-right', i === q.answer));
          markDirty(kind);
        }));
      });
      ed.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
        textMode = b.dataset.mode;
        ed.querySelectorAll('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.mode === textMode));
        $('#body-wrap').hidden = textMode === 'preview';
        const pv = $('#body-preview'); pv.hidden = textMode === 'write';
        if (textMode === 'preview') pv.innerHTML = renderText(draft.body);
      }));
    }
    if ($('#f-photo')) {
      $('#f-photo').addEventListener('change', async (e) => {
        const file = e.target.files[0]; if (!file) return;
        $('#photo-err').textContent = '';
        $('#photo-box').innerHTML = '<span>Uploading…</span>';
        try {
          const dataUrl = await resizeImage(file, PREVIEW ? 900 : 1600, PREVIEW ? 0.78 : 0.85);
          draft.image = await api.upload(dataUrl);
          $('#photo-box').innerHTML = `<img src="${esc(draft.image)}" alt="">`;
          markDirty(kind);
          toast(`Photo ready. Press "Save ${KINDS[kind].one}" to keep it.`);
        } catch (err) { $('#photo-err').textContent = err.message; $('#photo-box').innerHTML = draft.image ? `<img src="${esc(draft.image)}" alt="">` : '<span>No photo yet</span>'; }
      });
      $('#photo-remove')?.addEventListener('click', () => { draft.image = ''; $('#photo-box').innerHTML = '<span>No photo yet</span>'; markDirty(kind); });
    }
    $('#save').addEventListener('click', () => saveItem(kind));
    $('#discard').addEventListener('click', () => { select(kind, sel[kind]); kindTab(kind); toast('Changes discarded'); });
    armed($('#delete'), 'Click again to delete for good', async () => {
      try {
        await api.remove(kind, sel[kind]);
        data[kind] = data[kind].filter((x) => x.id !== sel[kind]);
        sel[kind] = data[kind][0]?.id || null; draft = null; dirty = false; kindTab(kind); toast('Deleted');
      } catch (e) { toast(e.message, true); }
    });
  }

  async function saveItem(kind) {
    const K = KINDS[kind];
    const old = data[kind].find((x) => x.id === sel[kind]);
    try {
      const saved = await api.save(kind, K.pack(draft));
      const i = data[kind].findIndex((x) => x.id === saved.id);
      data[kind][i] = saved;
      if (kind === 'lessons' && old.section !== saved.section) {
        data[kind].splice(i, 1);
        const g = listOf(kind, saved.section); const last = g[g.length - 1];
        data[kind].splice(last ? data[kind].indexOf(last) + 1 : data[kind].length, 0, saved);
        await api.order(kind, data[kind].map((x) => x.id));
      }
      select(kind, saved.id); kindTab(kind);
      toast(kind === 'lessons' && completeQs(saved) < 5 ? `Saved. ${completeQs(saved)} of 5 questions are ready.` : 'Saved');
    } catch (e) { toast(e.message, true); }
  }

  // ---------- students ----------
  async function studentsTab() {
    const body = $('#tab-body');
    if (studentId) return studentDetail(studentId);
    body.innerHTML = '<p class="muted">Loading students…</p>';
    let list;
    try { list = await api.students(); } catch (e) { body.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
    const enrolled = list.filter((s) => s.enrolled);
    const avg = enrolled.length ? Math.round(enrolled.reduce((a, s) => a + s.summary.percent, 0) / enrolled.length) : 0;
    const week = list.filter((s) => s.enrolledAt && Date.now() - s.enrolledAt < 7 * 864e5).length;
    body.innerHTML = `<div class="panel wide">
      <div class="editor-head"><h2>Students</h2><input type="search" class="input search" id="s-search" placeholder="Search name, email or phone" value="${esc(studentQuery)}" aria-label="Search students"></div>
      <div class="stat-row"><div><b>${enrolled.length}</b><span>enrolled</span></div><div><b>${week}</b><span>new this week</span></div><div><b>${avg}%</b><span>average progress</span></div><div><b>${list.length - enrolled.length}</b><span>signed in, not enrolled</span></div></div>
      ${!data.emailReady && !PREVIEW ? '<p class="help">Enrollment emails are not set up yet, so check this list for new students. See "Enrollment emails" in the README to switch them on.</p>' : ''}
      <div class="student-list" id="student-list"></div>
    </div>`;
    const draw = () => {
      const q = studentQuery.toLowerCase();
      const rows = list.filter((s) => !q || [s.name, s.email, s.phone, s.location].join(' ').toLowerCase().includes(q));
      $('#student-list').innerHTML = rows.map((s) => `<button type="button" class="student-row" data-id="${esc(s.id)}">
          <span class="av">${s.picture ? `<img src="${esc(s.picture)}" alt="" referrerpolicy="no-referrer">` : esc((s.name || '?')[0])}</span>
          <span class="who"><b>${esc(s.name)}</b><small>${esc(s.email)}${s.phone ? ' · ' + esc(s.phone) : ''}</small></span>
          <span class="when">${s.enrolled ? 'Enrolled ' + dateOf(s.enrolledAt) : '<span class="badge warn">Not enrolled</span>'}${s.unlockAll ? ' <span class="badge free">All unlocked</span>' : ''}</span>
          <span class="pct"><span class="bar"><i style="width:${s.summary.percent}%"></i></span><b>${s.summary.percent}%</b></span>
        </button>`).join('') || `<p class="muted">${list.length ? 'No student matches that search.' : 'No students yet. When someone signs in with Google and enrolls, they appear here.'}</p>`;
      $('#student-list').querySelectorAll('.student-row').forEach((b) => b.addEventListener('click', () => { studentId = b.dataset.id; studentDetail(studentId); }));
    };
    draw();
    $('#s-search').addEventListener('input', (e) => { studentQuery = e.target.value; draw(); });
  }

  async function studentDetail(id) {
    const body = $('#tab-body');
    let s;
    try { s = await api.student(id); } catch (e) { body.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
    const wa = C.waNumber(s.phone);
    const sm = s.summary;
    const toggle = (kind, x) => `<label class="tg ${x.free ? 'is-free' : ''}"><input type="checkbox" data-kind="${kind}" data-id="${esc(x.id)}" ${x.unlocked ? 'checked' : ''} ${x.free ? 'disabled' : ''}><span class="track" aria-hidden="true"></span><span class="sr-only">Unlock ${esc(x.title)}</span></label>`;
    body.innerHTML = `<div class="panel wide">
      <button type="button" class="back-btn" id="back">← All students</button>
      <div class="stu-head">
        <span class="av big">${s.picture ? `<img src="${esc(s.picture)}" alt="" referrerpolicy="no-referrer">` : esc((s.name || '?')[0])}</span>
        <div class="who"><h2>${esc(s.name)}</h2>
          <dl class="kv"><div><dt>Email</dt><dd>${esc(s.email)}</dd></div><div><dt>Phone</dt><dd>${esc(s.phone || '–')}</dd></div><div><dt>Location</dt><dd>${esc(s.location || '–')}</dd></div>
            <div><dt>Enrolled</dt><dd>${s.enrolled ? dateOf(s.enrolledAt) : 'Not yet'}</dd></div><div><dt>Last sign-in</dt><dd>${ago(s.lastLogin)}</dd></div></dl>
          <div class="row">${wa ? `<a class="btn btn-wa btn-sm" href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer">${ICON.whatsapp}<span>WhatsApp</span></a>` : ''}<a class="btn btn-ghost btn-sm" href="mailto:${esc(s.email)}">${ICON.mail}<span>Email</span></a></div>
        </div>
        <div class="big-ring" style="--p:${sm.percent}"><span><b>${sm.percent}%</b><small>progress</small></span></div>
      </div>
      <div class="stat-row"><div><b>${sm.done}/${sm.total}</b><span>steps done</span></div><div><b>${sm.points}/${sm.maxPoints}</b><span>quiz points</span></div><div><b>${s.lessons.filter((l) => l.unlocked).length}</b><span>lessons open</span></div><div><b>${s.designs.filter((d) => d.unlocked).length}</b><span>designs open</span></div></div>

      ${(() => {
        const steps = s.lessons.filter((l) => l.published);
        const next = steps.find((l) => !l.unlocked);
        const last = [...steps].reverse().find((l) => l.unlocked && !l.free);
        return `<div class="group"><div class="editor-head"><h3>Lessons</h3><span class="muted small">Unlock one step at a time, in order.</span></div>
        <div class="next-step">${next
          ? `<div><small>Next step</small><b>${steps.indexOf(next) + 1}. ${esc(next.title)}</b></div><button type="button" class="btn btn-primary" id="unlock-next" data-id="${esc(next.id)}">Unlock next step</button>`
          : '<div><b>Every lesson is open for this student.</b></div>'}
          ${last ? `<button type="button" class="btn btn-ghost btn-sm" id="undo-last" data-id="${esc(last.id)}">Undo last unlock</button>` : ''}</div>
        <div class="unlock-list">${steps.map((l, i) => `<div class="ul-row ${l === next ? 'is-next' : ''}"><span class="n">${i + 1}</span><span class="t">${esc(l.title)}</span>
          <span class="sc">${l.progress ? `<span class="score-pill ${l.progress.best === 5 ? 'full' : ''}">${l.progress.best}/5</span><small>${l.progress.attempts} ${l.progress.attempts === 1 ? 'try' : 'tries'}</small>` : '<small class="muted">Not started</small>'}</span>
          <span class="state-pill ${l.free ? 'free' : l.unlocked ? 'open' : l === next ? 'next' : ''}">${l.free ? 'Free' : l.unlocked ? 'Open' : l === next ? 'Next' : 'Locked'}</span></div>`).join('')}</div></div>`;
      })()}

      <div class="group"><div class="editor-head"><h3>Art work</h3></div>
        <div class="unlock-list">${s.designs.map((d) => `<div class="ul-row ${d.published ? '' : 'dim'}"><span class="n">•</span><span class="t">${esc(d.title)}${d.free ? ' <span class="badge free">Free</span>' : ''}</span><span class="sc"></span>${toggle('designs', d)}</div>`).join('') || '<p class="muted">No designs yet.</p>'}</div></div>

      <div class="group"><h3>Remove student</h3><p class="muted small" style="margin:0">Deletes their account and progress. If they sign in again they start fresh.</p><div class="row"><button type="button" class="btn btn-danger btn-sm" id="del-stu">Delete student</button></div></div>
    </div>`;
    $('#back').addEventListener('click', () => { studentId = null; studentsTab(); });
    const patch = async (p, msg) => { try { await api.saveStudent(id, { unlockAll: false, ...p }); toast(msg); studentDetail(id); } catch (e) { toast(e.message, true); } };
    const openLessons = () => s.lessons.filter((l) => l.unlocked && !l.free).map((l) => l.id);
    $('#unlock-next')?.addEventListener('click', (e) => patch({ unlocked: { lessons: [...openLessons(), e.target.dataset.id] } }, 'Next step unlocked for ' + s.name));
    $('#undo-last')?.addEventListener('click', (e) => patch({ unlocked: { lessons: openLessons().filter((x) => x !== e.target.dataset.id) } }, 'Last unlock undone'));
    body.querySelectorAll('.tg input[data-kind]').forEach((el) => el.addEventListener('change', () => {
      const ids = s.designs.filter((x) => !x.free).filter((x) => (x.id === el.dataset.id ? el.checked : x.unlocked)).map((x) => x.id);
      patch({ unlocked: { designs: ids } }, el.checked ? 'Design unlocked' : 'Design locked');
    }));
    armed($('#del-stu'), 'Click again to delete', async () => {
      try { await api.removeStudent(id); studentId = null; toast('Student deleted'); studentsTab(); } catch (e) { toast(e.message, true); }
    });
  }

  // ---------- orders ----------
  const OSTATUS = [['new', 'New'], ['confirmed', 'Confirmed'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']];
  async function ordersTab() {
    const body = $('#tab-body');
    body.innerHTML = '<p class="muted">Loading orders…</p>';
    let list;
    try { list = await api.adminOrders(); } catch (e) { body.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
    const count = (st) => list.filter((o) => o.status === st).length;
    const shown = orderFilter === 'all' ? list : list.filter((o) => o.status === orderFilter);
    body.innerHTML = `<div class="panel wide">
      <div class="editor-head"><h2>Orders</h2>${data.site.shopOpen ? '<span class="badge free big">Shop open</span>' : '<span class="badge big">Shop closed: students see "Coming soon"</span>'}</div>
      <div class="filters">${[['all', 'All', list.length], ...OSTATUS.map(([k, n]) => [k, n, count(k)])].map(([k, n, c]) => `<button type="button" data-f="${k}" aria-pressed="${orderFilter === k}">${n} <span>${c}</span></button>`).join('')}</div>
      <div class="orders">${shown.map((o) => {
        const wa = C.waNumber(o.phone);
        return `<article class="order-card">
          <div class="oc-head"><b>${esc(o.number)}</b><span class="muted small">${new Date(o.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            <select data-order="${esc(o.id)}" aria-label="Status of order ${esc(o.number)}">${OSTATUS.map(([k, n]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
          <div class="oc-who"><b>${esc(o.name)}</b><span>${esc(o.phone || '')}${o.location ? ' · ' + esc(o.location) : ''}</span><span class="muted small">${esc(o.email)}</span></div>
          <ul class="oc-items">${o.items.map((l) => `<li><span>${l.qty} × ${esc(l.title)}</span><span>${C.ksh(l.price * l.qty)}</span></li>`).join('')}</ul>
          ${o.note ? `<p class="oc-note"><b>Note:</b> ${esc(o.note)}</p>` : ''}
          <div class="oc-foot"><b>Total ${C.ksh(o.total)}</b>${wa ? `<a class="btn btn-wa btn-sm" href="https://wa.me/${wa}?text=${encodeURIComponent(`Hello ${o.name}, about your order ${o.number} (${C.ksh(o.total)}):`)}" target="_blank" rel="noopener noreferrer">${ICON.whatsapp}<span>WhatsApp customer</span></a>` : ''}</div>
        </article>`;
      }).join('') || `<p class="muted">${list.length ? 'No orders with this status.' : 'No orders yet. When a student places an order, it appears here and you get an email.'}</p>`}</div>
    </div>`;
    body.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { orderFilter = b.dataset.f; ordersTab(); }));
    body.querySelectorAll('[data-order]').forEach((sel) => sel.addEventListener('change', async () => {
      try { await api.setOrderStatus(sel.dataset.order, sel.value); toast('Order marked ' + sel.options[sel.selectedIndex].text.toLowerCase()); ordersTab(); } catch (e) { toast(e.message, true); }
    }));
  }

  // ---------- site & contact ----------
  function siteTab() {
    const s = data.site;
    const f = (k, label, ph = '', type = 'text', hint = '') => `<label class="field"><span>${label}</span><input type="${type}" id="s-${k}" data-s="${k}" value="${esc(s[k])}" placeholder="${esc(ph)}">${hint ? `<small>${hint}</small>` : ''}</label>`;
    const ww = [...(s.whatWeDo || [])]; while (ww.length < 4) ww.push({ title: '', text: '' });
    $('#tab-body').innerHTML = `<form class="panel" id="site-form">
      <h2>Site & contact</h2>
      <div class="group"><h3>School</h3>
        ${f('name', 'School name', 'Maridadi Nail Academy')}${f('tagline', 'Tagline', 'Where every hand becomes a canvas.')}</div>
      <div class="group"><h3>Home page</h3>
        ${f('heroTitle', 'Big headline', 'Every hand becomes a canvas.', 'text', 'The last word is shown in italic colour.')}
        <label class="field"><span>Intro text</span><textarea id="s-heroText" data-s="heroText" rows="3" maxlength="600">${esc(s.heroText)}</textarea></label>
        <b class="small">What we do</b>
        ${ww.map((w, i) => `<div class="grid-ww"><input type="text" class="input" id="ww-t${i}" data-ww="${i}" data-f="title" value="${esc(w.title)}" placeholder="Title (e.g. Physical classes)" aria-label="What we do ${i + 1} title"><input type="text" class="input" id="ww-x${i}" data-ww="${i}" data-f="text" value="${esc(w.text)}" placeholder="One or two sentences" aria-label="What we do ${i + 1} text"></div>`).join('')}
        <small class="muted">Leave a row empty to hide it.</small></div>
      <div class="group"><h3>Classes page</h3>
        <label class="field"><span>Message when no dates are set ("Incoming")</span><textarea id="s-classesNote" data-s="classesNote" rows="2" maxlength="600">${esc(s.classesNote)}</textarea></label></div>
      <div class="group"><h3>Contact details</h3>
        <div class="grid2">${f('whatsapp', 'WhatsApp number', '0746906609', 'tel', 'Used for every WhatsApp button and the unlock popup.')}${f('phone', 'Phone (for calls)', '0746906609', 'tel')}</div>
        <div class="grid2">${f('email', 'Business email', 'hello@yourschool.co.ke', 'email', 'Shown to students. Enrollment emails also go here unless ADMIN_EMAIL is set.')}${f('tiktok', 'TikTok', '@yourschool or full link')}</div>
        <div class="grid2">${f('instagram', 'Instagram', '@yourschool or full link')}${f('location', 'Studio location', 'Nairobi, Kenya')}</div>
        ${f('hours', 'Opening hours', 'Mon – Sat, 9am – 6pm')}</div>
      <div class="group"><h3>Shop</h3>
        <label class="check"><input type="checkbox" id="s-shopOpen" ${s.shopOpen ? 'checked' : ''}><span>Shop is open<small>When off, signed-in students see "Products coming soon". Add products in the Products tab first.</small></span></label></div>
      <div class="group"><h3>About page</h3>
        <label class="field"><span>About the school</span><textarea id="s-about" data-s="about" rows="6">${esc(s.about)}</textarea><small>Uses the same formatting as lesson text.</small></label></div>
      <div class="row"><button class="btn btn-primary" type="submit">Save site & contact</button></div>
    </form>`;
    $('#site-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const next = {};
      root.querySelectorAll('[data-s]').forEach((el) => (next[el.dataset.s] = el.value.trim()));
      next.shopOpen = $('#s-shopOpen').checked;
      next.whatWeDo = ww.map((_, i) => ({ title: $(`#ww-t${i}`).value.trim(), text: $(`#ww-x${i}`).value.trim() }));
      try { data.site = await api.saveSite(next); brand(); toast('Saved'); } catch (err) { toast(err.message, true); }
    });
  }

  // ---------- backup & setup ----------
  function backupTab() {
    $('#tab-body').innerHTML = `<div class="panel">
      <h2>Setup</h2>
      <ul class="setup">
        <li class="${data.googleReady ? 'ok' : ''}"><b>Google sign-in</b><span>${data.googleReady ? 'On' : 'Off: add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (see README).'}</span></li>
        <li class="${data.emailReady || PREVIEW ? 'ok' : ''}"><b>Enrollment emails</b><span>${PREVIEW ? 'Works on the real site' : data.emailReady ? 'On' : 'Off: add the SMTP settings (see README).'}</span></li>
      </ul>
      <div class="row"><button class="btn btn-ghost btn-sm" type="button" id="test-email">Send a test email</button></div>
      <div class="group"><h3>Backup</h3>
        <p style="margin:0">Download a copy of all lessons, art work, services, products, classes and site details. Students and orders are not included.</p>
        <div class="row"><button class="btn btn-primary" type="button" id="dl">Download backup</button>
          <label class="btn btn-ghost" for="up">Load a backup file</label><input type="file" id="up" accept="application/json,.json" hidden></div>
        ${PREVIEW ? '<p class="muted small" style="margin:0">Downloads do not work inside the preview.</p>' : ''}</div>
      <div class="group"><h3>Start over</h3>
        <p style="margin:0">Replace lessons, art work, services and classes with the original starting content. Site details, products, students and orders are kept.</p>
        <div class="row"><button class="btn btn-danger" type="button" id="reset">Restore the starting content</button></div></div>
    </div>`;
    $('#test-email').addEventListener('click', async () => { try { const r = await api.testEmail(); toast('Test email sent to ' + r.to); } catch (e) { toast(e.message, true); } });
    $('#dl').addEventListener('click', async () => {
      const d = await api.adminData();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ site: d.site, lessons: d.lessons, designs: d.designs, classes: d.classes, services: d.services, products: d.products }, null, 2)], { type: 'application/json' }));
      a.download = `academy-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
    });
    $('#up').addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try { await api.importData(JSON.parse(await file.text())); data = await api.adminData(); draft = null; brand(); toast('Backup loaded'); }
      catch (err) { toast(err instanceof SyntaxError ? 'That file is not a backup.' : err.message, true); }
    });
    armed($('#reset'), 'Click again to replace the content', async () => {
      try { await api.reset(); data = await api.adminData(); draft = null; sel = { lessons: null, designs: null, classes: null, services: null, products: null }; toast('Starting content restored'); tab = 'lessons'; render(); }
      catch (err) { toast(err.message, true); }
    });
  }

  // ---------- go ----------
  document.getElementById('logout').addEventListener('click', async (e) => { e.preventDefault(); await api.adminLogout().catch(() => {}); data = null; loginView(); });
  document.getElementById('preview-note').hidden = !PREVIEW;
  window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  brand();
  api.adminMe().then((m) => (m.admin ? start() : loginView())).catch(loginView);
})();
