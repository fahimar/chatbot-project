#!/bin/bash

# AI Chatbot - Automated Setup Script
# This script automates the entire setup process

set -e  # Exit on error

echo "🤖 AI Chatbot - Automated Setup"
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python found: $PYTHON_VERSION"
else
    print_error "Python 3 not found. Please install Python 3.10+"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 16+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm not found. Please install npm"
    exit 1
fi

echo ""
echo "🔑 Setting up environment variables..."

# Check if API key is provided
if [ -z "$GEMINI_API_KEY" ]; then
    print_warning "GEMINI_API_KEY not set in environment"
    read -p "Enter your Gemini API Key: " API_KEY
else
    API_KEY=$GEMINI_API_KEY
    print_success "Using GEMINI_API_KEY from environment"
fi

# Create root .env file
cat > .env << EOF
GEMINI_API_KEY=$API_KEY
CORS_ORIGINS=http://localhost:3000,http://frontend:3000
EOF
print_success "Created root .env file"

# Create backend .env file
cat > backend/.env << EOF
GEMINI_API_KEY=$API_KEY
CORS_ORIGINS=http://localhost:3000,*
PORT=8000
EOF
print_success "Created backend/.env file"

# Create frontend .env.local file
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000
EOF
print_success "Created frontend/.env.local file"

echo ""
echo "📦 Installing backend dependencies..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Created Python virtual environment"
else
    print_warning "Virtual environment already exists"
fi

# Activate and install
source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r app/requirements.txt
print_success "Backend dependencies installed"
deactivate

cd ..

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
print_success "Frontend dependencies installed"
cd ..

echo ""
echo "================================="
print_success "Setup complete! 🎉"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "Or use the quick start script:"
echo "   ./start.sh"
echo ""
