# Élan Beauty

Élan Beauty: a nail studio and academy website for Kenya: physical classes, an online course and an art work gallery.
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
| Services | Your services with photo, price and time. Anyone can book an appointment: they pick a service, day and time, and the booking arrives on your WhatsApp. Set booking hours and closed days in Site & contact. |
| Products | Shop items with photo, price (KSh), category and stock. |
| Classes | Physical classes with start/end dates. No date shows as "Incoming", and finished classes hide themselves. |
| Site & contact | The **Shop open** switch (students see "Coming soon" until it is on), school name, home page text, what we do, WhatsApp, email, phone, TikTok, Instagram, About. |
| Brand | Colours (8 palettes or any two colours), fonts and logo. Owner only when `OWNER_PASSWORD` is set. |
| Backup | Setup status, test email, download/load a backup, restore the starting content. |

## Run it

```bash
ADMIN_PASSWORD="choose-a-strong-password" node server.js
```

Students: http://localhost:4000 · Admin: http://localhost:4000/admin

## Test it on your computer (no domain needed)

1. Install Node.js (LTS) from https://nodejs.org and Git from https://git-scm.com.
2. Download and start the site:

   ```bash
   git clone -b claude/vigilant-albattani-7zbotz https://github.com/Dennismky/nails.git
   cd nails
   ```

   Windows (PowerShell): `$env:ADMIN_PASSWORD="test123"; node server.js`
   Mac/Linux: `ADMIN_PASSWORD=test123 node server.js`

3. Admin: open http://localhost:4000/admin and log in with `test123`.
4. Student: open http://localhost:4000 in a **private/incognito window** and press **Sign in**.
   Until Google keys are set, this makes a test student ("Test Student 1", "2", ...), on localhost only.
   Each new private window is a new student.
5. Stop the site with Ctrl+C. Everything you added is kept in the `data` folder for next time.

To try real Google sign-in on your computer, add `http://localhost:4000/auth/google/callback` as a redirect URI
in Google Cloud (see below) and start with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set.

## Settings

| Name | What it is |
|---|---|
| `ADMIN_PASSWORD` | Your admin password. Admin login is off until it is set. |
| `BASE_URL` | The site's public address, e.g. `https://maridadinails.co.ke`. Needed for Google sign-in. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in (below). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Enrollment emails (below). |
| `ADMIN_EMAIL` | Where enrollment emails go. Defaults to the business email in Site & contact. |
| `OWNER_PASSWORD` | Optional. Your own password for the Brand tab. When it is set, the client's `ADMIN_PASSWORD` cannot change colours or logo. |
| `SESSION_SECRET` | A long random string that signs logins. Set it in production. |
| `DATA_DIR` | Where lessons, students and photos are saved when there is no database (default `./data`). Must be a persistent disk. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis (added by Vercel). When set, everything is saved there instead of files. |
| `STORE_PREFIX` | Optional. Keeps several websites apart in one database (default `elan:`). |
| `TEST_SIGNIN` | `1` lets "Sign in" make test students online while Google sign-in is not set up. Remove before going live. |
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

## Selling a copy to a client

Each client gets their own copy: their own data, admin password and domain.

1. Deploy a new copy of this folder on your host (a new app or a new folder on your server).
2. Give it its own `DATA_DIR`, a new `ADMIN_PASSWORD` for the client, your `OWNER_PASSWORD`, a new `SESSION_SECRET`,
   and `BASE_URL` set to their domain.
3. Point their domain at it (DNS A or CNAME record, as your host shows) and switch on HTTPS.
4. Google sign-in: add `https://their-domain/auth/google/callback` as a redirect URI. One Google client can
   hold many domains, or create one per client.
5. Log in at `their-domain/admin` with your **owner** password:
   - **Brand:** business name, colours, font, logo.
   - **Site & contact:** their WhatsApp, email, TikTok, location, home page text, booking hours.
   - **Services / Products / Classes:** their own offers.
6. Give the client their `ADMIN_PASSWORD`. They can run everything except the brand.

A new copy starts with the sample content and Maridadi's details, so change them before you hand it over.

## Host it on Vercel (free address, no domain needed)

1. Go to https://vercel.com, log in with GitHub, and choose **Add New → Project**.
2. Import the **Dennismky/nails** repository. Leave the settings as they are (no framework, no build command)
   and press **Deploy**. You get an address like `elan-beauty.vercel.app`.
3. Add the database: in the project open **Storage → Create Database → Upstash for Redis** (free plan) and
   connect it to the project. Vercel adds the `KV_REST_API_URL` and `KV_REST_API_TOKEN` settings for you.
4. In **Settings → Environment Variables** add:
   - `ADMIN_PASSWORD`: the admin password
   - `OWNER_PASSWORD`: your own password for the Brand tab (optional)
   - `SESSION_SECRET`: any long random text
   - `TEST_SIGNIN` = `1` while you test without Google keys (remove it before real students arrive)
5. **Deployments → ⋯ → Redeploy** so the new settings apply.
6. Open `https://<your-app>.vercel.app/admin`. In **Backup → Setup**, "Database: Connected" means everything is saved.

Later: add Google sign-in (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, redirect URI
`https://<your-app>.vercel.app/auth/google/callback`), the email settings, and your own domain under
**Settings → Domains**. Set `BASE_URL` to the domain you use.

Photos are kept in the database too, so keep them reasonably small (the admin resizes them before upload).

## Putting it online elsewhere

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
