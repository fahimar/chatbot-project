#!/bin/bash

# Cleanup Ports Script
# Kills any processes using ports 8000 and 3000

echo "🧹 Cleaning up ports..."

# Kill processes on port 8000 (Backend)
if lsof -ti:8000 > /dev/null 2>&1; then
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo "✅ Cleaned port 8000 (Backend)"
else
    echo "ℹ️  Port 8000 is already free"
fi

# Kill processes on port 3000 (Frontend)
if lsof -ti:3000 > /dev/null 2>&1; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo "✅ Cleaned port 3000 (Frontend)"
else
    echo "ℹ️  Port 3000 is already free"
fi

echo ""
echo "✅ Ports cleaned! You can now start your servers."
