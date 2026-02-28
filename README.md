# 🤖 AI Chatbot - Google Gemini Powered

একটি modern, full-stack AI chatbot application যা Google Gemini API ব্যবহার করে intelligent conversations প্রদান করে।

## ✨ Features

- 💬 Real-time AI conversations powered by Google Gemini
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔄 Automatic retry mechanism for reliability
- ⚡ Fast response times
- 🐳 Docker support for easy deployment
- 🔒 CORS enabled for secure API communication
- 📱 Mobile-friendly responsive design

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14
- **Language:** JavaScript/React 18
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python)
- **Web Server:** Uvicorn
- **AI Model:** Google Gemini 1.5 Flash
- **Validation:** Pydantic

### DevOps
- **Containerization:** Docker & Docker Compose
- **Deployment:** Railway (configured)

## 📋 Prerequisites

আপনার system এ নিচের software গুলো installed থাকতে হবে:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** এবং npm ([Download](https://nodejs.org/))
- **Docker & Docker Compose** (optional, for containerized deployment)
- **Google Gemini API Key** ([Get Free API Key](https://makersuite.google.com/app/apikey))

## 🚀 Installation & Setup

### Method 1: Manual Setup (Recommended for Development)

#### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd chatbot-project
```

#### Step 2: Setup Environment Variables

##### Root Directory (.env)
```bash
# Create .env file in root directory
cat > .env << EOF
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGINS=http://localhost:3000,http://frontend:3000
EOF
```

##### Backend (.env)
```bash
# Create backend/.env file
cat > backend/.env << EOF
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGINS=http://localhost:3000,*
PORT=8000
EOF
```

##### Frontend (.env.local)
```bash
# Create frontend/.env.local file
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000
EOF
```

**⚠️ Important:** `your_gemini_api_key_here` কে আপনার actual Gemini API key দিয়ে replace করুন।

#### Step 3: Install Backend Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r app/requirements.txt
cd ..
```

#### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

#### Step 5: Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

#### Step 6: Open in Browser

Browser এ navigate করুন:
```
http://localhost:3000
```

---

### Method 2: Docker Compose (Easy Deployment)

#### Step 1: Setup Environment Variables

প্রথমে root directory তে `.env` file তৈরি করুন:

```bash
cat > .env << EOF
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGINS=http://localhost:3000,http://frontend:3000
EOF
```

#### Step 2: Build and Run with Docker

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Step 3: Access Application

```
Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs
```

---

## 📁 Project Structure

```
chatbot-project/
├── docker-compose.yml          # Docker orchestration
├── .env                        # Root environment variables
│
├── backend/                    # Python FastAPI Backend
│   ├── Dockerfile             # Backend container config
│   ├── .env                   # Backend environment variables
│   ├── main.py                # FastAPI application entry
│   └── app/
│       ├── __init__.py
│       ├── gemini_service.py  # Gemini AI integration
│       └── requirements.txt   # Python dependencies
│
└── frontend/                   # Next.js Frontend
    ├── Dockerfile             # Frontend container config
    ├── .env.local             # Frontend environment variables
    ├── package.json           # NPM dependencies
    ├── next.config.js         # Next.js configuration
    ├── tailwind.config.js     # Tailwind CSS config
    │
    ├── pages/
    │   ├── _app.js            # App wrapper
    │   ├── index.js           # Home page
    │   └── api/
    │       └── chat.js        # API proxy route
    │
    └── src/
        ├── components/
        │   ├── ChatInterface.js   # Main chat component
        │   ├── ChatMessage.js     # Message display component
        │   ├── MessageInput.js    # Input field component
        │   └── Layout.js          # Layout wrapper
        │
        └── styles/
            ├── globals.css        # Global styles
            └── Chat.module.css    # Component styles
```

---

## 🔌 API Endpoints

### Backend API (Port 8000)

#### 1. Health Check
```http
GET /
```
**Response:**
```json
{
  "status": "healthy",
  "message": "Chatbot API is running"
}
```

#### 2. Chat Endpoint
```http
POST /api/chat
```
**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"},
    {"role": "user", "content": "Tell me a joke"}
  ]
}
```

**Response:**
```json
{
  "response": "Why did the programmer quit his job? Because he didn't get arrays!"
}
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Port Already in Use

**Problem:** `Address already in use` error

**Solution:**
```bash
# Find process using port 8000
lsof -ti:8000

# Kill the process
kill -9 <PID>

# Or use different port
python3 -m uvicorn main:app --port 8001
```

#### 2. Module Not Found Error

**Problem:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd backend
source venv/bin/activate
pip install -r app/requirements.txt
```

#### 3. API Key Error

**Problem:** `Authentication error` or `401 Unauthorized`

**Solution:**
- Verify your Gemini API key is correct
- Check `.env` files have the correct key
- Ensure no extra spaces in API key
- Get a new key from: https://makersuite.google.com/app/apikey

#### 4. Frontend Can't Connect to Backend

**Problem:** `Failed to connect to AI service`

**Solution:**
- Ensure backend is running on port 8000
- Check `frontend/.env.local` has correct `BACKEND_URL`
- Verify CORS settings in backend

#### 5. Too Many Open Files (macOS)

**Problem:** `EMFILE: too many open files`

**Solution:**
```bash
ulimit -n 10240
```

---

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:8000

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

### Test Frontend

Open browser and navigate to:
```
http://localhost:3000
```

Try these test messages:
- "Hello, how are you?"
- "Tell me a joke"
- "What is artificial intelligence?"
- "আসসালামু আলাইকুম" (Supports Bangla!)

---

## 🔧 Development Commands

### Backend Commands

```bash
# Activate virtual environment
cd backend && source venv/bin/activate

# Run development server
python3 -m uvicorn main:app --reload

# Run on specific port
python3 -m uvicorn main:app --port 8001 --reload

# Install new package
pip install package-name
pip freeze > app/requirements.txt

# Deactivate virtual environment
deactivate
```

### Frontend Commands

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Install new package
npm install package-name

# Fix vulnerabilities
npm audit fix
```

### Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend sh
```

---

## 🚢 Deployment

### Deploy to Railway

1. Create account on [Railway](https://railway.app)
2. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
3. Login and deploy:
   ```bash
   railway login
   railway init
   railway up
   ```
4. Set environment variables in Railway dashboard
5. Connect custom domain (optional)

### Environment Variables for Production

Ensure these are set in your deployment platform:

```env
GEMINI_API_KEY=your_production_api_key
CORS_ORIGINS=https://yourdomain.com
PORT=8000
NODE_ENV=production
```

---

## 📝 Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API Key | - | ✅ Yes |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` | ✅ Yes |
| `PORT` | Backend server port | `8000` | ❌ No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Public API URL | `http://localhost:3000` | ✅ Yes |
| `BACKEND_URL` | Backend service URL | `http://localhost:8000` | ✅ Yes |
| `NEXT_PUBLIC_API_TIMEOUT` | API timeout (ms) | `30000` | ❌ No |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Google Gemini API](https://ai.google.dev/) for AI capabilities
- [Next.js](https://nextjs.org/) for the frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

## 📧 Contact & Support

যদি কোনো সমস্যা হয় বা প্রশ্ন থাকে:

- Create an issue in the repository
- Email: your-email@example.com
- Documentation: [Link to docs]

---

## 🎯 Roadmap

Upcoming features:

- [ ] User authentication
- [ ] Chat history persistence with database
- [ ] File upload support (images, PDFs)
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Streaming responses (real-time typing)
- [ ] Rate limiting
- [ ] User profiles
- [ ] Export chat history
- [ ] Custom AI model selection

---

**Made with ❤️ using Google Gemini AI**
