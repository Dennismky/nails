# Maridadi Nail Academy

A nail technician school website for Kenya: physical classes, an online course and an art work gallery.
No dependencies. You need only Node.js 18 or newer.

**What visitors see:** Home (what we do, physical classes), Classes, About, Contact. Course and Art work cards
show a transparent lock.

**What students see:** they sign in with Google and enroll with their phone number. Lesson 1 and any
lesson or design you mark "free" open straight away. Everything else stays locked until you unlock it for
that student. Clicking a lock shows a popup with your WhatsApp and email. Students land on **Art work**
when they sign in, and their progress is saved to their account.

**Shop:** signed-in students see a Shop page, add products to a cart and place an order. You get an email,
the order appears in Admin → Orders, and the customer can send it to you on WhatsApp. Prices are always taken
from your product list, never from the browser. There are no online payments yet: you confirm each order and
arrange payment yourself.

**What you see (`/admin`):**

| Tab | What you do there |
|---|---|
| Students | Every student, their contact details and progress %. Open one to see scores, then unlock lessons and designs one by one, or everything at once. |
| Lessons | Text, video link, the 5 quiz questions, order (drag or ↑ ↓), "free for every student", draft/published. |
| Art work | Upload a photo, write the description, tools and steps (one per line), free or locked. |
| Orders | Shop orders: customer, items, total, note. Mark them new, confirmed, delivered or cancelled, and WhatsApp the customer. |
| Services | Your services with photo, price and time. Anyone can see them and book on WhatsApp. |
| Products | Shop items with photo, price (KSh), category and stock. |
| Classes | Physical classes with start/end dates. No date shows as "Incoming", and finished classes hide themselves. |
| Site & contact | The **Shop open** switch (students see "Coming soon" until it is on), school name, home page text, what we do, WhatsApp, email, phone, TikTok, Instagram, About. |
| Backup | Setup status, test email, download/load a backup, restore the starting content. |

## Run it

```bash
ADMIN_PASSWORD="choose-a-strong-password" node server.js
```

Students: http://localhost:4000 · Admin: http://localhost:4000/admin

## Settings

| Name | What it is |
|---|---|
| `ADMIN_PASSWORD` | Your admin password. Admin login is off until it is set. |
| `BASE_URL` | The site's public address, e.g. `https://maridadinails.co.ke`. Needed for Google sign-in. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in (below). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Enrollment emails (below). |
| `ADMIN_EMAIL` | Where enrollment emails go. Defaults to the business email in Site & contact. |
| `SESSION_SECRET` | A long random string that signs logins. Set it in production. |
| `DATA_DIR` | Where lessons, students and photos are saved (default `./data`). Must be a persistent disk. |
| `PORT` | Default 4000. |

### Google sign-in

1. Go to https://console.cloud.google.com, create a project, then **APIs & Services → OAuth consent screen**:
   choose External, fill in the app name and your email, and publish it.
2. **Credentials → Create credentials → OAuth client ID → Web application.**
3. Under *Authorised redirect URIs* add `BASE_URL/auth/google/callback`
   (for example `https://maridadinails.co.ke/auth/google/callback`, and `http://localhost:4000/auth/google/callback` for testing).
4. Copy the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Enrollment emails (Gmail)

1. On the Gmail account that sends the emails, turn on 2-Step Verification, then create an **App password**
   (Google Account → Security → App passwords).
2. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=youraddress@gmail.com`, `SMTP_PASS=<the app password>`.
3. In Admin → Backup, press **Send a test email**.

Any email provider that offers SMTP over SSL on port 465 works the same way (Zoho, cPanel hosting mail, and so on).
Without email set up, new students still appear in Admin → Students.

## Putting it online

Use a host that runs Node.js and keeps files (a VPS, or Render/Railway with a disk attached). Point `DATA_DIR`
at the disk, set the settings above, serve over HTTPS, and run `node server.js`.
Vercel's serverless functions do not keep files, so this server does not run there as it is.

## How access works

- Locked lessons and designs never leave the server: visitors get titles only.
- Quiz answers stay on the server. Students send their choices and the server marks them.
- Admin login uses a password and a signed cookie. Student login uses Google OAuth and a signed cookie (30 days).

## Preview build

`node scripts/build-preview.mjs` builds a version that runs without a server, for trying the site out.
In it, "Sign in" makes a pretend student, and everything is saved only in that browser.
