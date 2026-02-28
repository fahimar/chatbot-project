#!/bin/bash

# AI Chatbot - Stop Script
# Stops all running servers

echo "🛑 Stopping AI Chatbot servers..."

# Kill processes on ports
if lsof -ti:8000 > /dev/null 2>&1; then
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo "✅ Backend stopped (port 8000)"
else
    echo "ℹ️  Backend was not running"
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo "✅ Frontend stopped (port 3000)"
else
    echo "ℹ️  Frontend was not running"
fi

# Clean up log files (optional)
if [ -f "backend.log" ]; then
    rm backend.log
    echo "🧹 Cleaned backend.log"
fi

if [ -f "frontend.log" ]; then
    rm frontend.log
    echo "🧹 Cleaned frontend.log"
fi

echo ""
echo "✅ All servers stopped!"
