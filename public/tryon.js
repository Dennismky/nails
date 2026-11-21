// Art work try-on: one stationary hand in deep (ebony) skin tones, lit like a studio product shot.
// Swipe the hand (or use the arrows / the design strip) and the press-on nails fly off and the next set
// flies in and lands on each finger. Designs are drawn in each nail's own 100 x 150 box (tip at the top).
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // ---------- the hand ----------
  // Fingers from the knuckle: base point, lean (degrees), length, width. Index 0 is the thumb.
  const FINGERS = [
    { name: 'thumb', x: 212, y: 612, a: -44, L: 170, W: 60 },
    { name: 'index', x: 236, y: 462, a: -7, L: 222, W: 55 },
    { name: 'middle', x: 292, y: 450, a: -1, L: 246, W: 57 },
    { name: 'ring', x: 347, y: 458, a: 5, L: 226, W: 54 },
    { name: 'pinky', x: 398, y: 486, a: 13, L: 178, W: 47 },
  ];
  // The nail sits near the tip, a little beyond it (a short almond free edge).
  const nailBox = (f) => {
    const w = f.W * 0.72, h = f.L * (f.name === 'thumb' ? 0.36 : 0.33);
    return { w, h, x: -w / 2, y: -f.L - h * 0.13 };
  };
  const PALM = 'M214 492 C206 452 420 450 424 498 C430 560 420 636 402 700 L394 820 L240 820 L232 700 C216 640 200 566 214 492 Z';
  const NAIL_PATH = 'M7 150 C2 112 0 62 13 28 C24 3 76 3 87 28 C100 62 98 112 93 150 Q50 131 7 150 Z';

  // Small seeded random so glitter and spots look the same every time.
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // ---------- designs (drawn inside the nail shape) ----------
  const NUDE = '#c08a78', NUDE_DEEP = '#a9705f', MILK = '#f1e3dc';
  const base = (c, id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".92"/><stop offset="1" stop-color="${c}" stop-opacity=".8"/></linearGradient></defs><rect x="-10" y="-10" width="120" height="170" fill="url(#${id})"/>`;
  const tip = (c, depth = 36) => `<path d="M-10 -10 H110 V${depth} Q50 ${depth + 30} -10 ${depth} Z" fill="${c}"/>`;
  const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 4 C-6 -4 -14 2 -8 9 L0 16 L8 9 C14 2 6 -4 0 4 Z" fill="${c}"/>`;
  const daisy = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-9" rx="5.5" ry="9" fill="#fff" transform="rotate(${r})"/>`).join('')}<circle r="4.6" fill="#f2c14e"/></g>`;

  const DESIGNS = [
    {
      id: 'classic-french', name: 'Classic French', level: 'Beginner',
      desc: 'Crisp white tips over a warm-toned sheer nude. The pinkish-brown base keeps the nail bed glowing on deep skin, never chalky.',
      draw: (i, u) => base(NUDE, u + 'b') + tip('#fbf8f4'),
    },
    {
      id: 'pastel-french', name: 'Pastel French', level: 'Beginner',
      desc: 'A different soft pastel tip on every finger. Pastels pop beautifully against ebony skin on a warm nude base.',
      draw: (i, u) => base(NUDE, u + 'b') + tip(['#f7e39b', '#c9b6e8', '#a8e0cf', '#a9cdf2', '#ffc4a8'][i]),
    },
    {
      id: 'pink-french', name: 'Soft Pink French', level: 'Beginner',
      desc: 'Baby-pink tips instead of white: softer contrast, still clean and bridal.',
      draw: (i, u) => base(NUDE, u + 'b') + tip('#f3b3c1', 40),
    },
    {
      id: 'baby-boomer', name: 'Baby Boomer', level: 'Beginner',
      desc: 'A milky fade from nude at the cuticle to white at the tip. Sponge it on in thin layers for a seamless blend.',
      draw: (i, u) => `<defs><linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdfbf8"/><stop offset=".45" stop-color="#ecd2ca"/><stop offset="1" stop-color="${NUDE}"/></linearGradient></defs><rect x="-10" y="-10" width="120" height="170" fill="url(#${u}g)"/>`,
    },
    {
      id: 'polka-dots', name: 'Polka Dots', level: 'Beginner',
      desc: 'The first design to learn with a dotting tool. White dots on nude, with a black accent nail for contrast.',
      draw: (i) => {
        const dark = i === 3, c = dark ? '#fff' : '#fbf8f4';
        let s = `<rect x="-10" y="-10" width="120" height="170" fill="${dark ? '#121212' : NUDE}"/>`;
        for (let r = 0; r < 6; r++) for (let k = 0; k < 4; k++) s += `<circle cx="${(r % 2 ? 26 : 8) + k * 34}" cy="${12 + r * 26}" r="5.2" fill="${c}"/>`;
        return s;
      },
    },
    {
      id: 'daisy', name: 'Daisy Dots', level: 'Beginner',
      desc: 'Five dots and a yellow centre make a daisy. Put flowers on two nails and simple dots on the rest.',
      draw: (i) => `<rect x="-10" y="-10" width="120" height="170" fill="${MILK}"/>` + (i === 1 || i === 3 ? daisy(50, 60, 1.6) + daisy(70, 108, .8) : `<circle cx="38" cy="54" r="4" fill="#fff"/><circle cx="62" cy="86" r="3" fill="#f2c14e"/>`),
    },
    {
      id: 'hearts', name: 'Mini Hearts', level: 'Beginner',
      desc: 'Tiny red hearts on a milky pink base: two dots dragged into a V. Perfect for Valentine\'s or every day.',
      draw: (i) => `<rect x="-10" y="-10" width="120" height="170" fill="#f0d0d0"/>` + [[50, 58, 1.7], [30, 104, .9], [70, 30, .8]].slice(0, i % 2 ? 3 : 1).map(([x, y, s]) => heart(x, y, s, '#c8102e')).join(''),
    },
    {
      id: 'glitter-fade', name: 'Gold Glitter Fade', level: 'Easy',
      desc: 'Gold glitter dense at the tip, fading into a nude base. Warm gold flatters deep skin tones.',
      draw: (i, u) => {
        const r = rng(7 + i * 31); let s = base(NUDE, u + 'b') + `<defs><linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a441" stop-opacity=".95"/><stop offset=".55" stop-color="#d9a441" stop-opacity=".15"/><stop offset="1" stop-color="#d9a441" stop-opacity="0"/></linearGradient></defs><rect x="-10" y="-10" width="120" height="170" fill="url(#${u}f)"/>`;
        for (let k = 0; k < 90; k++) { const y = Math.pow(r(), 1.8) * 150; s += `<circle cx="${r() * 100}" cy="${y}" r="${0.8 + r() * 2.2}" fill="${r() > .5 ? '#ffe7a3' : '#c58b2a'}" opacity="${1 - y / 170}"/>`; }
        return s;
      },
    },
    {
      id: 'mirror-chrome', name: 'Mirror Chrome', level: 'Intermediate',
      desc: 'Liquid-metal shine from chrome powder rubbed over a no-wipe top coat.',
      draw: (i, u) => `<defs><linearGradient id="${u}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6f7075"/><stop offset=".28" stop-color="#f4f5f8"/><stop offset=".45" stop-color="#8d8f96"/><stop offset=".62" stop-color="#ffffff"/><stop offset="1" stop-color="#5b5c61"/></linearGradient></defs><rect x="-10" y="-10" width="120" height="170" fill="url(#${u}c)"/>`,
    },
    {
      id: 'soft-marble', name: 'Soft Marble', level: 'Intermediate',
      desc: 'Grey and gold veins on milky white, softened with blooming gel.',
      draw: (i) => `<rect x="-10" y="-10" width="120" height="170" fill="#f4f1ee"/><path d="M-5 ${40 + i * 6} C25 ${55 + i * 4} 40 ${30 + i * 8} 70 ${70 - i * 3} S105 95 110 ${110 - i * 5}" stroke="#7d7d7d" stroke-width="2.4" fill="none" opacity=".75"/><path d="M10 150 C30 ${110 - i * 4} 55 ${120 - i * 6} 90 ${60 + i * 5}" stroke="#a0a0a0" stroke-width="1.2" fill="none" opacity=".6"/><path d="M-5 ${95 - i * 4} C30 ${80 + i * 3} 60 ${105 - i * 4} 105 ${75 + i * 4}" stroke="#c9a14a" stroke-width="1.4" fill="none"/>`,
    },
    {
      id: 'leopard', name: 'Leopard', level: 'Easy',
      desc: 'Caramel base, brown blobs, then broken black outlines around each one.',
      draw: (i) => {
        const r = rng(3 + i * 17); let s = `<rect x="-10" y="-10" width="120" height="170" fill="#c99a69"/>`;
        for (let k = 0; k < 7; k++) {
          const x = 10 + r() * 80, y = 8 + r() * 135, rx = 7 + r() * 5, ry = 5 + r() * 4, rot = r() * 180;
          s += `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse rx="${rx}" ry="${ry}" fill="#7a4e2b"/><path d="M${-rx - 2} 0 A${rx + 2} ${ry + 2} 0 0 1 ${rx * 0.4} ${-ry - 2}" stroke="#1d120b" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M${rx + 2} 2 A${rx + 2} ${ry + 2} 0 0 1 ${-rx * 0.2} ${ry + 2}" stroke="#1d120b" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;
        }
        return s;
      },
    },
    {
      id: 'gold-lines', name: 'Gold Line Art', level: 'Easy',
      desc: 'Negative space: a sheer nude with one fine gold stroke and a dot. Minimal and elegant.',
      draw: (i, u) => base(NUDE, u + 'b') + [`<path d="M20 150 C30 100 70 90 80 30" stroke="#d4a646" stroke-width="2.6" fill="none"/><circle cx="80" cy="24" r="3.6" fill="#d4a646"/>`, `<path d="M-5 70 Q50 40 105 70" stroke="#d4a646" stroke-width="2.6" fill="none"/>`, `<path d="M50 10 V140" stroke="#d4a646" stroke-width="2.4"/><circle cx="50" cy="75" r="4" fill="#d4a646"/>`, `<path d="M-5 100 Q50 60 105 30" stroke="#d4a646" stroke-width="2.6" fill="none"/>`, `<circle cx="50" cy="60" r="16" stroke="#d4a646" stroke-width="2.4" fill="none"/>`][i],
    },
    {
      id: 'burgundy-gold', name: 'Burgundy & Gold', level: 'Beginner',
      desc: 'Deep burgundy is a classic on ebony skin. Add gold glitter on the ring finger as the feature nail.',
      draw: (i, u) => {
        if (i !== 3) return `<defs><linearGradient id="${u}r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3e0712"/><stop offset=".5" stop-color="#6d1325"/><stop offset="1" stop-color="#3a0610"/></linearGradient></defs><rect x="-10" y="-10" width="120" height="170" fill="url(#${u}r)"/>`;
        const r = rng(99); let s = `<rect x="-10" y="-10" width="120" height="170" fill="#b8862f"/>`;
        for (let k = 0; k < 120; k++) s += `<circle cx="${r() * 100}" cy="${r() * 150}" r="${0.8 + r() * 2}" fill="${r() > .5 ? '#ffe7a3' : '#8a5f17'}"/>`;
        return s;
      },
    },
    {
      id: 'pastel-swirl', name: 'Pastel Swirls', level: 'Easy',
      desc: 'Loose lilac, pink and blue swirls with a thin brush on a sheer nude. No two nails the same.',
      draw: (i, u) => base(NUDE, u + 'b') + ['#c9b6e8', '#f3b3c1', '#a9cdf2'].map((c, k) => `<path d="M${-10 + k * 8} ${30 + k * 40 + i * 5} C25 ${k * 40 + i * 9} 60 ${70 + k * 30 - i * 6} 110 ${20 + k * 45}" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round" opacity=".95"/>`).join(''),
    },
  ];

  let uid = 0;
  function nailSvg(design, i, extraClass = '') {
    const u = `n${++uid}`;
    return `<g class="press ${extraClass}">
      <clipPath id="${u}clip"><path d="${NAIL_PATH}"/></clipPath>
      <g clip-path="url(#${u}clip)">${design.draw(i, u)}
        <rect x="-10" y="-10" width="120" height="170" fill="url(#tg-gloss)"/>
        <path d="M18 22 C14 50 14 92 20 128" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".38" fill="none"/>
      </g>
      <path d="${NAIL_PATH}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1.6"/>
    </g>`;
  }

  // ---------- markup ----------
  function handSvg() {
    const finger = (f, k) => {
      const nb = nailBox(f);
      const top = -f.L, wb = f.W * 1.06, wm = f.W * 0.92, wt = f.W * 0.84;
      // slightly tapered, with a gentle swell at the middle knuckle
      const path = `M${-wb / 2} 46 C${-wb / 2} ${-f.L * 0.3} ${-wm / 2 - 2} ${-f.L * 0.55} ${-wm / 2} ${-f.L * 0.62} C${-wt / 2} ${-f.L * 0.8} ${-wt / 2} ${top + wt * 0.3} ${-wt / 2} ${top + wt / 2} Q${-wt / 2} ${top - 4} 0 ${top - 6} Q${wt / 2} ${top - 4} ${wt / 2} ${top + wt / 2} C${wt / 2} ${top + wt * 0.3} ${wt / 2} ${-f.L * 0.8} ${wm / 2} ${-f.L * 0.62} C${wm / 2 + 2} ${-f.L * 0.55} ${wb / 2} ${-f.L * 0.3} ${wb / 2} 46 Z`;
      return `<g class="finger f-${f.name}" transform="translate(${f.x} ${f.y}) rotate(${f.a})">
        <path d="${path}" fill="url(#tg-skin)"/>
        <path d="${path}" fill="url(#tg-rim)" opacity=".9"/>
        <path d="${path}" fill="url(#tg-base)"/>
        <ellipse cx="0" cy="${-f.L * 0.6}" rx="${f.W * 0.26}" ry="${f.W * 0.14}" fill="#8a5a40" opacity=".22"/>
        <path d="M${-f.W * 0.2} ${-f.L * 0.58} q${f.W * 0.2} ${-5} ${f.W * 0.4} 0 M${-f.W * 0.15} ${-f.L * 0.61} q${f.W * 0.15} ${-3} ${f.W * 0.3} 0" stroke="#1b0d08" stroke-width="1.3" opacity=".32" fill="none" stroke-linecap="round"/>
        <path d="M${-f.W * 0.16} ${-f.L * 0.82} q${f.W * 0.16} ${-3} ${f.W * 0.32} 0" stroke="#1b0d08" stroke-width="1.1" opacity=".25" fill="none" stroke-linecap="round"/>
        <g transform="translate(${nb.x} ${nb.y}) scale(${nb.w / 100} ${nb.h / 150})">
          <path d="${NAIL_PATH}" fill="#8f5a4b"/><path d="${NAIL_PATH}" fill="url(#tg-bed)"/>
          <g class="slot" data-i="${k}"></g>
          <path d="M7 150 Q50 131 93 150" stroke="#2a150e" stroke-width="5" fill="none" opacity=".55"/>
        </g>
      </g>`;
    };
    return `<svg class="tryon-hand" viewBox="50 150 470 650" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A hand in deep skin tones wearing the selected nail design">
      <defs>
        <linearGradient id="tg-skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f100a"/><stop offset=".22" stop-color="#4a2a1d"/><stop offset=".42" stop-color="#6b412d"/><stop offset=".6" stop-color="#55321f"/><stop offset=".86" stop-color="#2c170f"/><stop offset="1" stop-color="#170b06"/></linearGradient>
        <linearGradient id="tg-rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9b3a0" stop-opacity=".35"/><stop offset=".07" stop-color="#d9b3a0" stop-opacity="0"/><stop offset=".93" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".22"/></linearGradient>
        <radialGradient id="tg-palm" cx=".45" cy=".35" r=".75"><stop offset="0" stop-color="#6b412d"/><stop offset=".55" stop-color="#47281b"/><stop offset="1" stop-color="#1c0e08"/></radialGradient>
        <linearGradient id="tg-bed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9d6cc" stop-opacity=".5"/><stop offset=".25" stop-color="#b98575" stop-opacity=".2"/><stop offset="1" stop-color="#5a3428" stop-opacity=".4"/></linearGradient>
        <linearGradient id="tg-gloss" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".25" stop-color="#fff" stop-opacity=".14"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
        <linearGradient id="tg-base" x1="0" y1="0" x2="0" y2="1"><stop offset=".8" stop-color="#4a2a1d" stop-opacity="0"/><stop offset=".97" stop-color="#4c2b1e" stop-opacity="1"/></linearGradient>
        <filter id="tg-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
      </defs>
      <ellipse cx="300" cy="770" rx="230" ry="26" fill="#000" opacity=".55" filter="url(#tg-soft)"/>
      ${finger(FINGERS[0], 0)}
      <path d="${PALM}" fill="url(#tg-palm)"/>
      <path d="${PALM}" fill="none" stroke="#e8c7b5" stroke-opacity=".1" stroke-width="2"/>
      <path d="M250 530 C256 600 262 660 270 760 M296 520 C298 600 300 660 302 760 M342 528 C340 600 338 660 334 760" stroke="#1c0d07" stroke-width="2.4" opacity=".14" fill="none" stroke-linecap="round"/>
      ${[4, 3, 2, 1].map((k) => finger(FINGERS[k], k)).join('')}
      <path d="M214 478 C240 458 300 450 330 452 C372 456 410 470 420 492" stroke="#9a6a4f" stroke-width="10" opacity=".08" fill="none" stroke-linecap="round" filter="url(#tg-soft)"/>
    </svg>`;
  }

  function mount(el, { onLearn, learnIds = [] } = {}) {
    let cur = 0, busy = false;
    el.innerHTML = `
      <div class="tryon-stage" tabindex="0" aria-label="Nail design try-on. Swipe or use the arrow keys to change the design.">
        <div class="tryon-glow" aria-hidden="true"></div>
        ${handSvg()}
        <button type="button" class="tryon-arrow prev" aria-label="Previous design">‹</button>
        <button type="button" class="tryon-arrow next" aria-label="Next design">›</button>
        <div class="tryon-hint" aria-hidden="true"><span></span>Swipe to try designs</div>
      </div>
      <div class="tryon-info" aria-live="polite"></div>
      <div class="tryon-rail" role="listbox" aria-label="Nail designs">${DESIGNS.map((d, k) => `<button type="button" class="chip-d" role="option" data-k="${k}" aria-label="${esc(d.name)}"><svg viewBox="-6 -6 112 162" aria-hidden="true">${nailSvg(d, 2)}</svg><span>${esc(d.name)}</span></button>`).join('')}</div>`;
    const svg = el.querySelector('.tryon-hand');
    const slots = [...svg.querySelectorAll('.slot')];
    const info = el.querySelector('.tryon-info');
    const chips = [...el.querySelectorAll('.chip-d')];

    function showInfo() {
      const d = DESIGNS[cur];
      info.innerHTML = `<div class="ti-top"><span class="ti-count">${String(cur + 1).padStart(2, '0')} / ${String(DESIGNS.length).padStart(2, '0')}</span><span class="ti-level">${esc(d.level)}</span></div>
        <h3>${esc(d.name)}</h3><p>${esc(d.desc)}</p>
        ${learnIds.includes(d.id) ? `<button type="button" class="btn btn-ghost btn-sm ti-learn" data-learn="${esc(d.id)}">See the steps</button>` : ''}`;
      info.querySelector('[data-learn]')?.addEventListener('click', () => onLearn && onLearn(d.id));
      chips.forEach((c, k) => { c.classList.toggle('on', k === cur); c.setAttribute('aria-selected', k === cur); });
      const on = chips[cur]; const rail = on.parentElement;
      rail.scrollTo({ left: on.offsetLeft - rail.clientWidth / 2 + on.clientWidth / 2, behavior: 'smooth' });
    }
    // Press-ons: the old set flies off one way, the new set flies in from the other and lands finger by finger.
    function apply(k, dir) {
      cur = (k + DESIGNS.length) % DESIGNS.length;
      const order = dir >= 0 ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];
      slots.forEach((slot) => {
        const i = +slot.dataset.i, delay = order.indexOf(i) * 70;
        slot.querySelectorAll('.press').forEach((old) => {
          old.classList.remove('in'); old.style.setProperty('--dir', dir || 1); old.style.setProperty('--delay', delay * 0.5 + 'ms'); old.classList.add('out');
          setTimeout(() => old.remove(), 700 + delay);
        });
        slot.insertAdjacentHTML('beforeend', nailSvg(DESIGNS[cur], i, dir ? 'in' : ''));
        const n = slot.lastElementChild; n.style.setProperty('--dir', dir || 1); n.style.setProperty('--delay', 120 + delay + 'ms');
      });
      showInfo();
    }
    const go = (d) => { if (busy) return; busy = true; setTimeout(() => (busy = false), 380); apply(cur + d, d); el.querySelector('.tryon-hint')?.remove(); };
    el.querySelector('.prev').addEventListener('click', () => go(-1));
    el.querySelector('.next').addEventListener('click', () => go(1));
    chips.forEach((c) => c.addEventListener('click', () => { const k = +c.dataset.k; if (k !== cur) { apply(k, k > cur ? 1 : -1); el.querySelector('.tryon-hint')?.remove(); } }));
    const stage = el.querySelector('.tryon-stage');
    stage.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    // Swipe: the nails follow the finger a little while dragging, then the next set flies in.
    let sx = null, sy = null, dx = 0;
    stage.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; sx = e.clientX; sy = e.clientY; dx = 0; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', (e) => {
      if (sx === null) return;
      dx = e.clientX - sx;
      if (Math.abs(dx) > Math.abs(e.clientY - sy)) svg.style.setProperty('--drag', Math.max(-60, Math.min(60, dx * 0.35)) + 'px');
    });
    const end = () => { if (sx === null) return; svg.style.setProperty('--drag', '0px'); if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1); sx = null; };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    apply(0, 0);
  }

  window.MNATryOn = { mount, DESIGNS };
})();
