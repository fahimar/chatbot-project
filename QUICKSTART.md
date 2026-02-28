# ⚡ Quick Start Guide

এই গাইড follow করে **5 মিনিটে** আপনার chatbot চালু করুন!

## 🎯 Quick Setup (Copy-Paste Commands)

### Step 1: Environment Setup

```bash
# Root .env file
cat > .env << 'EOF'
GEMINI_API_KEY=AIzaSyBKytRZQLJLLZE6xm0_OtSMWhOflrGDneA
CORS_ORIGINS=http://localhost:3000,http://frontend:3000
EOF

# Backend .env file
cat > backend/.env << 'EOF'
GEMINI_API_KEY=AIzaSyBKytRZQLJLLZE6xm0_OtSMWhOflrGDneA
CORS_ORIGINS=http://localhost:3000,*
PORT=8000
EOF

# Frontend .env.local file
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000
EOF
```

### Step 2: Install Dependencies

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r app/requirements.txt
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### Step 3: Run Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 4: Open Browser

```
http://localhost:3000
```

---

## 🐳 Even Faster: Docker One-Liner

```bash
docker-compose up --build -d && echo "✅ Chatbot running at http://localhost:3000"
```

---

## 🧪 Quick Test

```bash
# Test backend
curl http://localhost:8000

# Test chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

---

## 🛑 Stop Servers

```bash
# Manual: Press Ctrl+C in both terminals

# Docker:
docker-compose down
```

---

## ❓ Problems?

Check [README.md](README.md#troubleshooting) Troubleshooting section.

**That's it! আপনার chatbot ready! 🎉**
