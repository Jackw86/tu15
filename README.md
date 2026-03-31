# TeamUp PWA — Partner Demo

A fully functional Progressive Web App built on the same Firebase backend as the native app.
Partners open one URL — no install, no app store, works on any device.

---

## What partners will see

- Full auth flow (email magic link)
- Create / join teams with invite codes
- Schedule with RSVP (Yes / No / Maybe)
- Live team feed with emoji reactions
- Realtime group chat
- Profile, team switching, member list

---

## Getting it live — complete guide

### Step 1 — Fork / push to GitHub

```bash
# Option A: new repo from scratch
git init
git add .
git commit -m "TeamUp PWA launch"
gh repo create teamup-pwa --public
git push -u origin main

# Option B: push to existing repo
git remote add origin https://github.com/YOUR_USERNAME/teamup-pwa.git
git push -u origin main
```

---

### Step 2 — Add your Firebase config

Open `index.html` and find the Firebase config block (~line 30):

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

Replace all `YOUR_*` values with your real Firebase project config.

**Where to find it:**
1. Go to https://console.firebase.google.com
2. Select your project
3. Click ⚙️ Project Settings → Your apps → Web app
4. Copy the `firebaseConfig` object

---

### Step 3 — Enable Firebase Auth methods

In Firebase Console:
1. Authentication → Sign-in method
2. Enable **Email/Password** → also enable **Email link (passwordless sign-in)**
3. Enable **Phone** (requires billing plan — Blaze is free up to 10k/month)
4. Under **Authorized domains**, add your GitHub Pages URL:
   `YOUR_USERNAME.github.io`

---

### Step 4 — Enable GitHub Pages

1. Go to your repo on GitHub
2. Settings → Pages
3. Source: **GitHub Actions**
4. The `.github/workflows/deploy.yml` file handles everything automatically

Every push to `main` triggers a new deploy. Takes ~60 seconds.

Your PWA will be live at:
```
https://YOUR_USERNAME.github.io/teamup-pwa/
```

---

### Step 5 — Update the magic link URL

In `index.html`, update the email link settings URL to match your GitHub Pages URL:

```js
const actionCodeSettings = {
  url: 'https://YOUR_USERNAME.github.io/teamup-pwa/',
  handleCodeInApp: true,
};
```

---

### Step 6 — Generate app icons (optional but recommended)

```bash
# Option A: node canvas (best quality)
npm install canvas
node generate-icons.js

# Option B: use any online tool
# Upload a 512x512 image to https://www.pwabuilder.com/imageGenerator
# Download and put icon-192.png and icon-512.png in /icons/
```

---

### Step 7 — Update Firestore rules

Deploy the production Firestore rules from the main project:

```bash
firebase deploy --only firestore:rules,storage
```

The PWA uses the same Firestore schema as the native app — no changes needed.

---

### Step 8 — Share with partners 🚀

Send partners this URL:
```
https://YOUR_USERNAME.github.io/teamup-pwa/
```

On mobile (iOS Safari or Android Chrome), they'll see an "Add to Home Screen" prompt
and can install it like a native app — full screen, offline capable, push notifications.

---

## Firestore rules note

The PWA uses the same `firestore.rules` as the native app — deploy them from the
main project root. The rules already cover web clients via the Firebase JS SDK.

---

## Customising the branding

All brand values are at the top of `index.html` in the `:root` CSS block:

```css
:root {
  --primary:  #3b82f6;   /* ← change to your brand colour */
  --bg:       #0a0a0f;   /* ← change for light mode */
  ...
}
```

And the app name is set in:
- `<title>` tag
- `.brand-name` heading in `renderWelcome()`
- `manifest.json` → `name` and `short_name`

---

## File structure

```
teamup-pwa/
├── index.html          ← entire app (auth + all screens + Firebase)
├── manifest.json       ← PWA install config
├── sw.js               ← service worker (offline, push notifications)
├── generate-icons.js   ← icon generation helper
├── icons/
│   ├── icon-192.png    ← PWA icon (create with generate-icons.js)
│   └── icon-512.png    ← PWA icon large
├── docs/
│   ├── privacy-policy.html   ← from main project
│   └── terms-of-service.html ← from main project
└── .github/
    └── workflows/
        └── deploy.yml  ← auto-deploy to GitHub Pages on push
```

---

## Custom domain (optional)

Want `app.yourclub.com` instead of `github.io`?

1. Buy a domain (e.g. Namecheap, Cloudflare)
2. GitHub repo → Settings → Pages → Custom domain → enter your domain
3. Add a CNAME DNS record: `app` → `YOUR_USERNAME.github.io`
4. Add your custom domain to Firebase Auth authorized domains
5. Update `actionCodeSettings.url` in `index.html`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Error: auth/unauthorized-domain" | Add your GitHub Pages URL to Firebase Auth → Authorized domains |
| Magic link redirects to wrong URL | Update `actionCodeSettings.url` in `index.html` to match your Pages URL |
| App shows blank screen | Open browser console — likely a Firebase config key is wrong |
| Can't join/create teams | Check Firestore rules are deployed and your project ID is correct |
| Icons not showing | Run `generate-icons.js` or add PNG files manually to `/icons/` |

---

## Tech stack

- **No build step** — pure HTML/CSS/JS, zero dependencies to install
- **Firebase JS SDK v10** — same Firestore schema as native app
- **Service Worker** — offline shell, installable to home screen
- **GitHub Pages** — free hosting, CDN-backed, HTTPS automatic
- **Auto-deploy** — every git push deploys in ~60 seconds

---

*Built with the TeamUp agent team. Same data. Same rules. One URL.*
