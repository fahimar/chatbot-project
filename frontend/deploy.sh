#!/bin/bash
# ─────────────────────────────────────────────────────────────
# FACES Health Frontend — Contabo Server Deploy Script
# Usage: bash deploy.sh [port]   (default port: 3001)
# ─────────────────────────────────────────────────────────────

set -e  # Exit on any error

PORT=${1:-3001}
APP_NAME="faces-frontend"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   FACES Health — Deploy to Contabo       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Step 1: Pull latest code ──────────────────────────────────
echo "📥 [1/5] Pulling latest code..."
git pull origin faces_app/frontend
echo "✅ Code up to date"

# ── Step 2: Install dependencies ─────────────────────────────
echo ""
echo "📦 [2/5] Installing dependencies..."
npm install --production=false
echo "✅ Dependencies installed"

# ── Step 3: Build ─────────────────────────────────────────────
echo ""
echo "🔨 [3/5] Building production app..."
npm run build
echo "✅ Build complete"

# ── Step 4: Stop existing process ────────────────────────────
echo ""
echo "🛑 [4/5] Stopping existing process on port $PORT..."
# Kill any process using the port
fuser -k ${PORT}/tcp 2>/dev/null || true
# Kill pm2 if running (check both global and local)
pm2 delete $APP_NAME 2>/dev/null || npx pm2 delete $APP_NAME 2>/dev/null || true
echo "✅ Old process stopped"

# ── Step 5: Start with PM2 (npx, no global install) ──────────
echo ""
echo "🚀 [5/5] Starting server with PM2 on port $PORT..."

npx pm2 start npm \
  --name "$APP_NAME" \
  --restart-delay=3000 \
  --max-restarts=10 \
  -- start -- -p $PORT

npx pm2 save
echo "✅ Server started"

# ── Summary ──────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅ Deploy complete!                    ║"
echo "║   🌐 http://$(hostname -I | awk '{print $1}'):$PORT        ║"
echo "╚══════════════════════════════════════════╝"
echo ""
npx pm2 status $APP_NAME
echo ""
echo "💡 Useful commands:"
echo "   npx pm2 logs $APP_NAME     # View logs"
echo "   npx pm2 restart $APP_NAME  # Restart app"
echo "   npx pm2 stop $APP_NAME     # Stop app"
