// Builds a self-contained preview of the site (no server needed) into preview/.
// The preview keeps the course in the browser, so admin edits there are only for trying things out.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedCourse } from '../seed.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (f) => fs.readFileSync(path.join(root, 'public', f), 'utf8');
const out = process.argv[2] || path.join(root, 'preview');
fs.mkdirSync(out, { recursive: true });

const day = 864e5, now = Date.now();
const example = (name, email, phone, location, daysAgo, scores, extra = {}) => ({
  id: 'ex-' + email.split('@')[0], googleId: 'example', email, name: name + ' (example)', picture: '', phone, location, enrolled: true,
  createdAt: now - daysAgo * day, enrolledAt: now - daysAgo * day, lastLogin: now - day, unlockAll: false,
  unlocked: { lessons: [], designs: [] }, progress: Object.fromEntries(Object.entries(scores).map(([id, best]) => [id, { best, last: best, attempts: 1, at: now - day }])), ...extra });
const base = seedCourse();
base.site.shopOpen = true;
base.products = [
  { id: 'ex-gel-kit', title: 'Starter gel kit (example)', category: 'Kits', price: 4500, stock: 'in', image: '', published: true, description: 'Base, top coat and three colours: everything to practise gel at home.' },
  { id: 'ex-cuticle-oil', title: 'Cuticle oil (example)', category: 'Aftercare', price: 650, stock: 'low', image: '', published: true, description: 'Daily care for nails and cuticles.' },
  { id: 'ex-lamp', title: 'LED lamp (example)', category: 'Tools', price: 3200, stock: 'out', image: '', published: true, description: 'Rechargeable LED lamp for curing gel.' },
];
const data = { ...base, students: [
  example('Achieng Otieno', 'achieng@example.com', '0712 345 678', 'Kisumu', 3, { welcome: 5, anatomy: 4, hygiene: 5 }, { unlocked: { lessons: ['anatomy', 'hygiene', 'disorders'], designs: ['mirror-chrome'] } }),
  example('Wanjiku Kamau', 'wanjiku@example.com', '0722 111 222', 'Nairobi', 1, { welcome: 3 }),
] };
const seed = `<script>window.__SEED__ = ${JSON.stringify(data).replace(/</g, '\\u003c')};</script>`;
const inline = (html, { page }) => {
  html = html
    .replace('<link rel="stylesheet" href="styles.css">', `<style>${pub('styles.css')}</style>`)
    .replace('<link rel="stylesheet" href="admin.css">', `<style>${pub('admin.css')}</style>`)
    .replace(/<link rel="icon"[^>]*>\n?/, '')
    .replace('<script src="core.js"></script>\n', '')
    .replace('<script src="common.js"></script>', () => `${seed}\n<script>${pub('core.js')}</script>\n<script>${pub('common.js')}</script>`)
    .replace('<script src="app.js"></script>', () => `<script>${pub('app.js')}</script>`)
    .replace('<script src="admin.js"></script>', () => `<script>${pub('admin.js')}</script>`);
  if (page) {
    // The main artifact page gets its own document skeleton at publish time.
    const head = html.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>\n?|<meta name="viewport"[^>]*>\n?/g, '');
    const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
    html = head + body;
  }
  return html;
};
fs.writeFileSync(path.join(out, 'index.html'), inline(pub('index.html'), { page: true }));
fs.writeFileSync(path.join(out, 'admin.html'), inline(pub('admin.html'), { page: false }));
console.log('Preview written to', out);
