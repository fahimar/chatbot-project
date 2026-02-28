#!/bin/bash

# Docker Start Helper Script
echo "🐳 Checking Docker status..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop:"
    echo "  1. Open Docker Desktop from Applications"
    echo "  2. Wait for Docker to start (green icon in menu bar)"
    echo "  3. Run this script again"
    echo ""
    echo "Or run: open -a Docker"
    exit 1
fi

echo "✅ Docker is running!"
echo ""

# Stop any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down 2>/dev/null

# Clean up ports
echo "🧹 Cleaning up ports..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo ""
echo "🚀 Starting chatbot with Docker Compose..."
echo ""

# Build and start with new API key
docker-compose up --build -d

# Wait a moment
sleep 5

# Check status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "================================="
echo "🎉 Chatbot started!"
echo "================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo ""
