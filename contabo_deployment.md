# 🚀 FACES Health Frontend — Contabo Server Deployment

## 📋 Overview
FACES Health chatbot frontend deployed on Contabo VPS server at `http://167.86.78.35:3001`

**Server:** vmi3105748.contaboserver.net  
**User:** deploy  
**App Port:** 3001  
**Process Manager:** PM2 (via npx)  

---

## 🔧 Deployment Issues Fixed

### Issue 1: Missing `.next` Build Folder
**Error:**
```
Error: Could not find a production build in the '.next' directory.
```

**Cause:** `.next` is in `.gitignore` — not committed to git. Server had code but no build.

**Fix:** Added `npm run build` step to deployment script before starting server.

---

### Issue 2: Missing `src/lib/facesApi.js`
**Error:**
```
Module not found: Can't resolve '../lib/facesApi'
```

**Cause:** Root `.gitignore` had `lib/` pattern which ignored `frontend/src/lib/facesApi.js`

**Fix:**
- Added to `frontend/.gitignore`:
  ```
  # Allow committing our local helper libs (root .gitignore ignores "lib/")
  !src/lib/
  !src/lib/*
  ```
- Committed and pushed `src/lib/facesApi.js`

---

### Issue 3: PM2 Global Install Permission Error
**Error:**
```
npm ERR! code EACCES
npm ERR! Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Cause:** `npm install -g pm2` requires sudo permissions

**Fix:** Changed all PM2 commands to use `npx pm2` (local execution, no global install needed)
```bash
# Before
pm2 start npm --name "faces-frontend" -- start -- -p 3001

# After
npx pm2 start npm --name "faces-frontend" -- start -- -p 3001
```

---

## 📁 Files Created

### `frontend/deploy.sh`
Automated deployment script with 5 steps:
1. Pull latest code from git
2. Install npm dependencies
3. Build production bundle (`npm run build`)
4. Stop existing process (kill port + PM2)
5. Start with PM2 using `npx`

**Usage:**
```bash
bash deploy.sh [port]   # default port: 3001
```

---

## ✅ Successful Deployment

### Final Output:
```
╔══════════════════════════════════════════╗
║   ✅ Deploy complete!                    ║
║   🌐 http://167.86.78.35:3001            ║
╚══════════════════════════════════════════╝

┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ faces-frontend     │ fork     │ 0    │ online    │ 0%       │ 86.4mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

**App Status:** ✅ Running  
**URL:** http://167.86.78.35:3001

---

## �️ Useful Commands

### Server SSH
```bash
ssh deploy@vmi3105748
cd ~/chatbot-project/frontend
```

### PM2 Management
```bash
npx pm2 logs faces-frontend      # View real-time logs
npx pm2 restart faces-frontend   # Restart app
npx pm2 stop faces-frontend      # Stop app
npx pm2 status                   # Check status
npx pm2 monit                    # Live monitoring
```

### Redeploy
```bash
git pull origin faces_app/frontend
bash deploy.sh 3001
```

### Manual Build (if needed)
```bash
npm install
npm run build
npm run start -- -p 3001
```

---

## 🌐 Architecture

```
Browser → http://167.86.78.35:3001 (Next.js Frontend)
              ↓
         /api/chat (Next.js API Route)
              ↓
         http://167.86.78.35:8088 (FACES RAG Backend)
```

**Session Flow:**
1. User sends first question → `session_id: null`
2. Backend returns `{answer, session_id: "abc-123"}`
3. Frontend stores in `localStorage` + `sessionIdRef.current`
4. Next questions use same `session_id` → conversation context maintained
5. History API: `GET /faces-api/sessions/{id}/history`

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.35 (Pages Router) |
| Runtime | Node.js v25.5.0 |
| Process Manager | PM2 (via npx) |
| Proxy | Next.js rewrites (`/faces-api/*` → `167.86.78.35:8088/*`) |
| API Client | Native `fetch` API |
| Styling | Tailwind CSS 3.3.2 |

---

## 🔐 Environment Variables

**Not required** — all API calls proxied through Next.js:
- `/api/chat` → server-side proxy to FACES backend
- `/faces-api/*` → Next.js rewrite to `167.86.78.35:8088`

No hardcoded external URLs in browser code.

---

## 📝 Git Commits

1. `78a5481` — Add `deploy.sh` for Contabo deployment
2. `c8d3abf` — Add `facesApi.js` client helper (unignore `src/lib/`)
3. `b28eadc` — Fix deploy script to use `npx pm2` (avoid permission errors)

---

## ⚠️ Known Issues

1. **npm audit warnings:** 10 vulnerabilities (1 low, 2 moderate, 6 high, 1 critical)  
   → Not blocking deployment, but should run `npm audit fix` later

2. **Browserslist outdated:** 11 months old  
   → Run `npx update-browserslist-db@latest` on next deploy

---

## 🎯 Next Steps

- [ ] Set up Nginx reverse proxy for domain name
- [ ] Configure SSL/TLS certificate (Let's Encrypt)
- [ ] Add PM2 log rotation (`pm2 install pm2-logrotate`)
- [ ] Set up monitoring/alerts
- [ ] Configure auto-deploy webhook from GitHub