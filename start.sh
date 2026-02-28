#!/bin/bash

# AI Chatbot - Quick Start Script
# Starts both backend and frontend servers

echo "🚀 Starting AI Chatbot..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if .env files exist
if [ ! -f ".env" ] || [ ! -f "backend/.env" ] || [ ! -f "frontend/.env.local" ]; then
    echo "❌ Environment files not found!"
    echo "Please run ./setup.sh first"
    exit 1
fi

# Kill any existing processes on ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
source venv/bin/activate
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Backend running on http://localhost:8000 (PID: $BACKEND_PID)${NC}"
else
    echo "❌ Backend failed to start. Check backend.log for errors."
    exit 1
fi

# Start frontend in background
echo "🎨 Starting frontend server..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 5

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)${NC}"
else
    echo "❌ Frontend failed to start. Check frontend.log for errors."
    kill $BACKEND_PID
    exit 1
fi

echo ""
echo "================================="
echo -e "${BLUE}🎉 Chatbot is running!${NC}"
echo "================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "To stop servers:"
echo "  ./stop.sh"
echo ""
echo "Press Ctrl+C to view logs..."

# Follow logs
tail -f backend.log frontend.log
