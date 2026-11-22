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
  // Each design is drawn in a 100 x 150 box (tip at the top, cuticle at the bottom). On the photo the nail
  // itself fills roughly x 13-87, y 12-138 of that box, so details are sized for that.
  const NUDE = '#c38d7b', MILK = '#f1e4de';
  const R = (x) => Math.round(x * 10) / 10;
  // Opaque warm nude, a touch deeper at the cuticle (it must hide whatever is on the nail underneath).
  const base = (c, id, c2 = '#b27a69') => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect x="-10" y="-10" width="120" height="170" fill="url(#${id})"/>`;
  const soft = (u, sd) => `<filter id="${u}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
  // French tip: a curved smile line with a soft edge, like real gel.
  const tip = (u, c, depth = 34) => `<defs>${soft(u + 'ts', 1.2)}</defs>
    <path d="M-10 -10 H110 V${depth} Q50 ${depth + 26} -10 ${depth} Z" fill="${c}" opacity=".55" filter="url(#${u}ts)"/>
    <path d="M-10 -10 H110 V${depth - 2} Q50 ${depth + 22} -10 ${depth - 2} Z" fill="${c}"/>`;
  const heart = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 3.5 C-5 -3.5 -12.5 1.5 -7 8 L0 14.5 L7 8 C12.5 1.5 5 -3.5 0 3.5 Z" fill="${c}"/><ellipse cx="-4" cy="2.6" rx="1.6" ry="1" fill="#fff" opacity=".55" transform="rotate(-30 -4 2.6)"/></g>`;
  const daisy = (x, y, s, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${[0, 60, 120, 180, 240, 300].map((r) => `<ellipse cx="0" cy="-7.2" rx="3.6" ry="6.6" fill="#fff" stroke="#e7dcd6" stroke-width=".5" transform="rotate(${r})"/>`).join('')}<circle r="3.4" fill="#f0b93a"/><circle r="3.4" fill="#c98a1c" opacity=".35" transform="translate(.8 .8) scale(.6)"/></g>`;
  // points round an ellipse, for irregular leopard spots and their broken outlines
  const ell = (cx, cy, rx, ry, rot, a0, a1, n = 14) => {
    const c = Math.cos(rot), s = Math.sin(rot), pts = [];
    for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; pts.push([R(cx + x * c - y * s), R(cy + x * s + y * c)]); }
    return pts;
  };
  const line = (pts) => 'M' + pts.map((p) => p.join(' ')).join(' L');

  const LOOKS = [
    {
      id: 'classic-french', name: 'Classic French', level: 'Beginner',
      desc: 'Crisp white tips over a warm-toned sheer nude. The pinkish-brown base keeps the nail bed glowing on deep skin, never chalky.',
      draw: (i, u) => base(NUDE, u + 'b') + tip(u, '#fbf8f3'),
    },
    {
      id: 'pastel-french', name: 'Pastel French', level: 'Beginner',
      desc: 'A different soft pastel tip on every finger. Pastels pop beautifully against ebony skin on a warm nude base.',
      draw: (i, u) => base(NUDE, u + 'b') + tip(u, ['#f6e39a', '#cdb8ec', '#a6e2cf', '#a8cdf3', '#ffc3a6'][i]),
    },
    {
      id: 'pink-french', name: 'Soft Pink French', level: 'Beginner',
      desc: 'Baby-pink tips instead of white: softer contrast, still clean and bridal.',
      draw: (i, u) => base(NUDE, u + 'b') + tip(u, '#f4b6c4', 36),
    },
    {
      id: 'baby-boomer', name: 'Baby Boomer', level: 'Beginner',
      desc: 'A milky fade from nude at the cuticle to white at the tip. Sponge it on in thin layers for a seamless blend.',
      draw: (i, u) => `<defs><linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcfaf7"/><stop offset=".22" stop-color="#f8f0ec"/><stop offset=".58" stop-color="#e2bfb3"/><stop offset="1" stop-color="${NUDE}"/></linearGradient></defs><rect x="-10" y="-10" width="120" height="170" fill="url(#${u}g)"/>`,
    },
    {
      id: 'polka-dots', name: 'Polka Dots', level: 'Beginner',
      desc: 'The first design to learn with a dotting tool. White dots on nude, with a black accent nail for contrast.',
      draw: (i, u) => {
        const dark = i === 3, c = dark ? '#fbfbfb' : '#fdfaf6';
        let s = dark ? `<rect x="-10" y="-10" width="120" height="170" fill="#141313"/>` : base(NUDE, u + 'b');
        for (let r = 0; r < 9; r++) for (let k = 0; k < 6; k++) s += `<circle cx="${R(4 + k * 19 + (r % 2 ? 9.5 : 0))}" cy="${R(10 + r * 16)}" r="3.2" fill="${c}"/>`;
        return s;
      },
    },
    {
      id: 'daisy', name: 'Daisy Dots', level: 'Beginner',
      desc: 'Five petals and a yellow centre make a daisy. Flowers on two nails and simple dots on the rest.',
      draw: (i, u) => base(MILK, u + 'b', '#e9d6cf') + (i === 1 || i === 3 ? daisy(50, 70, 1.5, i * 12) + daisy(70, 112, .7, 20) + `<circle cx="30" cy="40" r="2.2" fill="#fff"/>` : `<circle cx="42" cy="58" r="2.6" fill="#fff"/><circle cx="58" cy="80" r="2" fill="#f0b93a"/><circle cx="46" cy="100" r="1.8" fill="#fff"/>`),
    },
    {
      id: 'hearts', name: 'Mini Hearts', level: 'Beginner',
      desc: 'Tiny red hearts on a milky pink base: two dots dragged into a V. Perfect for Valentine\'s or every day.',
      draw: (i, u) => base('#f2d5d6', u + 'b', '#e7c0c2') + (i % 2 ? heart(50, 62, 1.5, '#c40f2c') : heart(44, 50, .85, '#c40f2c') + heart(60, 96, .65, '#c40f2c')),
    },
    {
      id: 'glitter-fade', name: 'Gold Glitter Fade', level: 'Easy',
      desc: 'Fine gold glitter packed at the tip, fading into a nude base. Warm gold flatters deep skin tones.',
      draw: (i, u) => {
        const r = rng(7 + i * 31);
        let s = base(NUDE, u + 'b') + `<defs><linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c99434"/><stop offset=".3" stop-color="#c99434" stop-opacity=".7"/><stop offset=".7" stop-color="#c99434" stop-opacity="0"/></linearGradient></defs><rect x="-10" y="-10" width="120" height="170" fill="url(#${u}f)"/>`;
        for (let k = 0; k < 230; k++) {
          const y = Math.pow(r(), 2) * 140; const sz = 1.3 + r() * 1.6; const t = r();
          s += `<rect x="${R(r() * 104 - 2)}" y="${R(y)}" width="${R(sz * 1.6)}" height="${R(sz * 1.6)}" transform="rotate(${Math.round(r() * 90)})" transform-origin="center" fill="${t > .7 ? '#fff8dc' : t > .3 ? '#f0c057' : '#a8741f'}" opacity="${R(Math.max(.2, 1 - y / 125))}"/>`;
        }
        for (let k = 0; k < 9; k++) { const x = 15 + r() * 70, y = 8 + r() * 46; s += `<path d="M${R(x)} ${R(y - 3)} L${R(x + .6)} ${R(y - .6)} L${R(x + 3)} ${R(y)} L${R(x + .6)} ${R(y + .6)} L${R(x)} ${R(y + 3)} L${R(x - .6)} ${R(y + .6)} L${R(x - 3)} ${R(y)} L${R(x - .6)} ${R(y - .6)} Z" fill="#fffbe9"/>`; }
        return s;
      },
    },
    {
      id: 'mirror-chrome', name: 'Mirror Chrome', level: 'Intermediate',
      desc: 'A liquid-metal mirror from chrome powder rubbed over a no-wipe top coat.',
      draw: (i, u) => `<defs><linearGradient id="${u}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2d3036"/><stop offset=".14" stop-color="#9aa0aa"/><stop offset=".24" stop-color="#f7f9fc"/><stop offset=".3" stop-color="#ffffff"/><stop offset=".42" stop-color="#7d838d"/><stop offset=".55" stop-color="#2a2d33"/><stop offset=".7" stop-color="#b9bfc8"/><stop offset=".8" stop-color="#f2f4f8"/><stop offset=".9" stop-color="#7a808a"/><stop offset="1" stop-color="#25282d"/></linearGradient>
        <linearGradient id="${u}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs>
        <rect x="-10" y="-10" width="120" height="170" fill="url(#${u}c)"/><rect x="-10" y="-10" width="120" height="170" fill="url(#${u}v)"/>`,
    },
    {
      id: 'soft-marble', name: 'Soft Marble', level: 'Intermediate',
      desc: 'Hazy grey veins with a few sharp ones and a thread of gold on milky white, softened with blooming gel.',
      draw: (i, u) => {
        const r = rng(5 + i * 13), j = (v) => R(v + (r() - .5) * 14);
        const v1 = `M-8 ${j(30)} C${j(20)} ${j(50)} ${j(40)} ${j(28)} ${j(60)} ${j(64)} S${j(92)} ${j(84)} 110 ${j(112)}`;
        const v2 = `M${j(10)} 152 C${j(26)} ${j(118)} ${j(52)} ${j(126)} ${j(80)} ${j(70)}`;
        const v3 = `M-8 ${j(96)} C${j(28)} ${j(84)} ${j(58)} ${j(104)} 110 ${j(78)}`;
        return `<defs>${soft(u + 'm1', 2.2)}${soft(u + 'm2', .7)}</defs><rect x="-10" y="-10" width="120" height="170" fill="#f4f2ef"/>
          <g filter="url(#${u}m1)" opacity=".55"><path d="${v1}" stroke="#8a8a8a" stroke-width="5" fill="none"/><path d="${v2}" stroke="#a3a3a3" stroke-width="4" fill="none"/></g>
          <g filter="url(#${u}m2)"><path d="${v1}" stroke="#6d6d6d" stroke-width="1.1" fill="none"/><path d="${v2}" stroke="#8c8c8c" stroke-width=".8" fill="none"/></g>
          <path d="${v3}" stroke="#c9a04a" stroke-width="1.2" fill="none" opacity=".9"/>`;
      },
    },
    {
      id: 'leopard', name: 'Leopard', level: 'Easy',
      desc: 'A tan base, irregular brown spots, broken black outlines (C shapes, never full circles) and tiny filler dots.',
      draw: (i, u) => {
        const r = rng(3 + i * 17);
        let s = `<defs><radialGradient id="${u}lb" cx=".45" cy=".4" r=".8"><stop offset="0" stop-color="#e6b77d"/><stop offset="1" stop-color="#c9955b"/></radialGradient></defs><rect x="-10" y="-10" width="120" height="170" fill="url(#${u}lb)"/>`;
        // spots on a jittered grid so they never merge into one blob
        for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 4; gx++) {
          if (r() < 0.2) continue;
          const cx = 8 + gx * 27 + (gy % 2 ? 13 : 0) + (r() - .5) * 8, cy = 8 + gy * 21 + (r() - .5) * 7;
          const rx = 4.2 + r() * 3.2, ry = 3.2 + r() * 2.4, rot = r() * Math.PI;
          // irregular brown blob
          const blob = ell(cx, cy, rx, ry, rot, 0, Math.PI * 2, 10).map(([x, y]) => [R(x + (r() - .5) * 1.6), R(y + (r() - .5) * 1.6)]);
          s += `<path d="${line(blob)} Z" fill="#9b6231" stroke="#9b6231" stroke-width="1" stroke-linejoin="round"/>`;
          // 1-3 broken black outline pieces, each a different length and thickness
          const pieces = 1 + Math.floor(r() * 3); let a = r() * Math.PI * 2;
          for (let k = 0; k < pieces; k++) {
            const len = 0.9 + r() * 1.6;
            s += `<path d="${line(ell(cx, cy, rx + 1.6, ry + 1.6, rot, a, a + len, 10))}" stroke="#1b120c" stroke-width="${R(1.4 + r() * 1.3)}" fill="none" stroke-linecap="round"/>`;
            a += len + 0.5 + r() * 0.9;
          }
        }
        for (let k = 0; k < 9; k++) s += `<circle cx="${R(r() * 100)}" cy="${R(r() * 145)}" r="${R(.8 + r() * .8)}" fill="#1b120c"/>`;
        return s;
      },
    },
    {
      id: 'gold-lines', name: 'Gold Line Art', level: 'Easy',
      desc: 'Negative space: a sheer nude with one fine gold stroke and a dot. Minimal and elegant.',
      draw: (i, u) => base(NUDE, u + 'b') + `<defs><linearGradient id="${u}gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".5" stop-color="#e2b04a"/><stop offset="1" stop-color="#fbe39a"/></linearGradient></defs>` +
        [`<path d="M28 140 C34 100 62 88 70 34" stroke="url(#${u}gd)" stroke-width="2.8" fill="none"/><circle cx="70" cy="30" r="3.6" fill="url(#${u}gd)"/>`, `<path d="M8 72 Q50 46 92 72" stroke="url(#${u}gd)" stroke-width="2.8" fill="none"/>`, `<path d="M50 18 V132" stroke="url(#${u}gd)" stroke-width="2.6"/><circle cx="50" cy="74" r="3.6" fill="url(#${u}gd)"/>`, `<path d="M10 104 Q50 66 92 34" stroke="url(#${u}gd)" stroke-width="2.8" fill="none"/>`, `<circle cx="50" cy="64" r="11" stroke="url(#${u}gd)" stroke-width="2.6" fill="none"/>`][i],
    },
    {
      id: 'burgundy-gold', name: 'Burgundy & Gold', level: 'Beginner',
      desc: 'Deep burgundy is a classic on ebony skin. Fine gold glitter on the ring finger makes the feature nail.',
      draw: (i, u) => {
        if (i !== 3) return `<defs><radialGradient id="${u}r" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#7a1529"/><stop offset=".6" stop-color="#55091a"/><stop offset="1" stop-color="#330410"/></radialGradient></defs><rect x="-10" y="-10" width="120" height="170" fill="url(#${u}r)"/>`;
        const r = rng(99); let s = `<rect x="-10" y="-10" width="120" height="170" fill="#a8792a"/>`;
        for (let k = 0; k < 300; k++) { const t = r(); s += `<circle cx="${R(r() * 104 - 2)}" cy="${R(r() * 154 - 2)}" r="${R(1 + r() * 1.5)}" fill="${t > .7 ? '#fff1c2' : t > .3 ? '#d9a744' : '#6f4a12'}"/>`; }
        return s;
      },
    },
    {
      id: 'pastel-swirl', name: 'Pastel Swirls', level: 'Easy',
      desc: 'Loose lilac, pink and blue swirls with a thin brush on a sheer nude. No two nails the same.',
      draw: (i, u) => base(NUDE, u + 'b') + `<defs>${soft(u + 'sw', .5)}</defs><g filter="url(#${u}sw)">` + ['#cdb8ec', '#f4b6c4', '#a8cdf3'].map((c, k) => `<path d="M${-10 + k * 6} ${30 + k * 36 + i * 4} C22 ${k * 34 + i * 8} 58 ${66 + k * 26 - i * 5} 110 ${18 + k * 40}" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${-10 + k * 6} ${28 + k * 36 + i * 4} C22 ${k * 34 + i * 8 - 2} 58 ${64 + k * 26 - i * 5} 110 ${16 + k * 40}" stroke="#fff" stroke-width="1.2" fill="none" opacity=".6" stroke-linecap="round"/>`).join('') + `</g>`,
    },
  ];

  let uid = 0;
  const LOOK = Object.fromEntries(LOOKS.map((d) => [d.id, d]));
  // An admin-uploaded nail-art image, filling the nail.
  const textureLook = (url) => ({ draw: () => `<rect x="-10" y="-10" width="120" height="170" fill="${NUDE}"/><image href="${esc(url)}" x="-10" y="-10" width="120" height="170" preserveAspectRatio="xMidYMid slice"/>` });
  // Turn the site's Art work designs into what the hand wears.
  const fromCatalog = (list) => list.map((d) => {
    const look = d.tryon === 'texture' ? (d.texture ? textureLook(d.texture) : null) : LOOK[d.tryon];
    return look ? { id: d.id, name: d.title, level: d.level || '', desc: d.description || '', draw: look.draw } : null;
  }).filter(Boolean);

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

  // ---------- the real hand (photo) ----------
  // window.MNATryOnHand (tryon-hand.js): the photo, and for each nail its exact mask, light/shine layer,
  // centre, angle (cuticle -> tip) and size, all in photo pixels.
  const PHOTO = () => window.MNATryOnHand;
  function photoHandSvg(H) {
    return `<svg class="tryon-hand photo" viewBox="0 0 ${H.w} ${H.h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A hand in deep skin tones wearing the selected nail design">
      <image href="${esc(H.img)}" width="${H.w}" height="${H.h}"/>
      ${H.nails.map((n, k) => `<g class="slot" data-k="${k}"></g>`).join('')}
    </svg>`;
  }
  // A press-on for one real nail: the design is laid along the nail, cut to the nail's exact shape,
  // then shaded with that nail's own light and shine so it looks curved and glossy.
  function photoNailSvg(design, n, extraClass = '') {
    const u = `p${++uid}`;
    const sx = (n.nw * 1.35) / 100, sy = (n.nl * 1.35) / 150;
    return `<g class="press ${extraClass}">
      <mask id="${u}m" maskUnits="userSpaceOnUse" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}"><image href="${n.mask}" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}"/></mask>
      <g mask="url(#${u}m)"><g transform="translate(${n.cx} ${n.cy}) rotate(${n.a + 90}) scale(${sx} ${sy}) translate(-50 -75)">${design.draw(n.f, u)}</g></g>
      <image href="${n.shade}" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}"/>
    </g>`;
  }

  function mount(el, { designs, onLearn, learnIds = [] } = {}) {
    const DESIGNS = designs ? fromCatalog(designs) : LOOKS;
    let cur = 0, busy = false;
    if (!DESIGNS.length) { el.innerHTML = ''; el.hidden = true; return; }
    el.innerHTML = `
      <div class="tryon-stage" tabindex="0" aria-label="Nail design try-on. Swipe or use the arrow keys to change the design.">
        <div class="tryon-glow" aria-hidden="true"></div>
        ${PHOTO() ? photoHandSvg(PHOTO()) : handSvg()}
        <button type="button" class="tryon-arrow prev" aria-label="Previous design">‹</button>
        <button type="button" class="tryon-arrow next" aria-label="Next design">›</button>
        <div class="tryon-hint" aria-hidden="true"><span></span>Swipe to try designs</div>
        ${PHOTO() && PHOTO().credit ? `<span class="tryon-credit">${esc(PHOTO().credit)}</span>` : ''}
      </div>
      <div class="tryon-info" aria-live="polite"></div>
      <div class="tryon-rail" role="listbox" aria-label="Nail designs">${DESIGNS.map((d, k) => `<button type="button" class="chip-d" role="option" data-k="${k}" aria-label="${esc(d.name)}"><svg viewBox="-6 -6 112 162" aria-hidden="true">${nailSvg(d, 2)}</svg><span>${esc(d.name)}</span></button>`).join('')}</div>`;
    const svg = el.querySelector('.tryon-hand');
    if (PHOTO()) {
      const H = PHOTO(), stageEl = el.querySelector('.tryon-stage');
      const fit = () => { const r = stageEl.getBoundingClientRect(); const ph = H.phone; svg.setAttribute('viewBox', r.width < 560 ? `${ph.x} ${ph.y} ${ph.w} ${ph.h}` : `0 0 ${H.w} ${H.h}`); };
      fit(); new ResizeObserver(fit).observe(stageEl);
      stageEl.classList.add('is-photo');
    }
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
      const H = PHOTO();
      // nails land one after another, starting from the side the new set comes from
      const xs = slots.map((sl) => (H ? H.nails[+sl.dataset.k].cx : +sl.dataset.i));
      const rank = xs.map((x) => xs.filter((y) => (dir >= 0 ? y > x : y < x)).length);
      slots.forEach((slot, si) => {
        const i = H ? H.nails[+slot.dataset.k].f : +slot.dataset.i, delay = rank[si] * (H ? 55 : 70);
        slot.querySelectorAll('.press').forEach((old) => {
          old.classList.remove('in'); old.style.setProperty('--dir', dir || 1); old.style.setProperty('--delay', delay * 0.5 + 'ms'); old.classList.add('out');
          setTimeout(() => old.remove(), 700 + delay);
        });
        slot.insertAdjacentHTML('beforeend', H ? photoNailSvg(DESIGNS[cur], H.nails[+slot.dataset.k], dir ? 'in' : '') : nailSvg(DESIGNS[cur], i, dir ? 'in' : ''));
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

  window.MNATryOn = { mount, LOOKS };
})();
