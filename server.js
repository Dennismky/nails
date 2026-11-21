// Élan Beauty on your computer (or any server with a disk).
// Run:  ADMIN_PASSWORD="your-secret" node server.js      (see README.md for Google sign-in and email)
// Students: http://localhost:4000      Admin: http://localhost:4000/admin
import http from 'node:http';
import { handler, startupNotes, PORT, BASE_URL } from './handler.js';

for (const n of startupNotes()) console.warn('  ' + n);
http.createServer(handler).listen(PORT, () => console.log(`Élan Beauty on ${BASE_URL}  (admin: ${BASE_URL}/admin)`));
