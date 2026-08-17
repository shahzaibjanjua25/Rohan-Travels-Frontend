# Rohan Travels — Frontend

React 18 + Vite single-page app.

---

## 1. Run it

The backend must be running first (see `../backend/README.md`).

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Opens on `http://localhost:3000`.

---

## 2. Why there is a dev proxy

`vite.config.js` proxies `/api` to `http://localhost:5000`. This is not
convenience — it is what makes authentication work.

The session token lives in an httpOnly cookie with `SameSite=lax`. If the
browser saw the app on `localhost:3000` and the API on `localhost:5000`, it
would treat them as different sites and silently drop that cookie on
cross-site requests. Every call would return 401 with nothing obviously wrong
in the network tab, which is a genuinely miserable afternoon.

The proxy makes both same-origin in development, matching how it behaves in
production behind a single domain.

Change the target with `VITE_PROXY_TARGET` if your backend is not on port 5000.

---

## 3. The API client

`src/services/api.js` is the only place that talks to the network. Three
things in it are load-bearing:

**`credentials: 'include'`** on every request. Without it the browser never
sends the auth cookie and nothing works.

**`X-CSRF-Token` on every POST/PUT/PATCH/DELETE.** The backend uses
double-submit CSRF protection: it sets a readable `rt_csrf` cookie, and the
client must echo that value in a header. Same-origin policy stops another site
from reading the cookie, so it cannot forge the header. The client primes the
cookie on boot and before any mutation, so a freshly loaded tab that submits
immediately does not get a 403.

**A 401 broadcasts session-expired.** Any 401 from anywhere clears the auth
context, so a revoked or expired session shows a login screen instead of a UI
that looks signed in but fails on every action.

Nothing is stored in `localStorage`. The token is httpOnly by design and
cannot be read by JavaScript, so the only source of truth about whether
someone is signed in is asking the server — which is what the boot call to
`/auth/me` does.

---

## 4. Design

The palette comes from VFR sectional charts, the aeronautical maps pilots
navigate by: pale chart paper, ink linework, and the magenta and blue used to
mark controlled airspace. Amber is reserved for delays and warnings, the way
a departure board uses it.

Barlow descends from public signage lettering, so it belongs in an airport.
JetBrains Mono is not decorative: flight numbers, times, seat numbers and
booking references have to align in columns and stay unambiguous when read
aloud over a phone.

**The signature element is the departure board.** Search results are set as an
airport board — condensed type, tabular figures, right-aligned times — and
each row flips in on arrival the way a split-flap display resolves. The
stagger is capped at ten rows; past that it stops reading as a board settling
and starts reading as the page being slow.

Everything else is deliberately quiet so that one thing carries the identity.

Tokens live in `src/styles/tokens.css`. Change a value there and it
propagates; there are no hardcoded colours in components.

---

## 5. Structure

```
src/
├── App.jsx              Routes and guards
├── main.jsx             Entry point
├── components/
│   ├── ProtectedRoute   Auth and admin gating
│   ├── layout/Shell     Header, nav, notification badge
│   └── ui/              Field, Alert, Tag, Spinner, EmptyState, Pagination
├── contexts/
│   └── AuthContext      Session state, derived from the server
├── pages/
│   ├── FlightSearch     The departure board
│   ├── FlightDetail     Cabin choice, travellers, booking
│   ├── Bookings         List with status filters
│   ├── BookingDetail    Boarding-pass view, cancel, documents
│   ├── Dashboard        Customer and admin variants
│   ├── Notifications    Inbox
│   ├── Account          Profile, password, ledger
│   └── admin/           Flights, People
├── services/            One module per API domain
├── styles/              tokens.css, components.css
└── utils/               Formatting, constants
```

---

## 6. Notes worth knowing

- **Route guards are convenience, not security.** `ProtectedRoute` hides
  admin screens, but the API enforces the same rules on every request. A
  customer who edits their way to `/admin/users` sees the page shell and an
  empty table, because the data request is refused server-side.

- **The loading state in `ProtectedRoute` is deliberate.** Session status is
  unknown until `/auth/me` answers. Treating unknown as logged-out would
  bounce authenticated users to the login screen on every refresh.

- **Optional fields are dropped when empty**, not sent as `""`. The backend
  validates format, and an empty string fails a phone or passport pattern.

- **The fare shown before booking is an estimate.** The server prices the
  booking authoritatively, including tax and fees from settings. Showing a
  confident total the server then disagrees with would be worse than showing
  none.

- **Travel documents load only on request.** Fetching them with the booking
  would decrypt passport numbers on every page view and write an audit entry
  for reads nobody intended.

- **Accessibility floor:** every input is labelled, errors are tied to inputs
  with `aria-invalid` and `aria-describedby` (colour is not the only signal),
  focus is visible, icon-only buttons have labels, and
  `prefers-reduced-motion` disables the board animation.

---

## 7. Not built yet

- Ledger and notification admin screens (`POST /notifications`,
  `POST /ledger/adjustments` exist on the API but have no UI).
- Flight create and edit forms. Admins can change status and withdraw flights;
  creating one still needs the API directly.
- A seat map picker. `GET /bookings/flights/:flightId/seats` returns occupied
  seats, but seat choice is currently a text input.
