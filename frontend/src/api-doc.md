# FACES Health RAG Chatbot — API Documentation (Frontend Integration)

## Base URL

| Environment | URL |
|-------------|-----|
| Production (Contabo) | `http://167.86.78.35` |
| Local (Docker) | `http://localhost` (Nginx) or `http://localhost:8000` (direct API) |
| Swagger UI | `{BASE_URL}/docs` |

---

## Session Flow (Frontend এ কিভাবে ব্যবহার করবে)

```
1. User প্রথম message পাঠায় → POST /chat (session_id ছাড়া)
2. Response এ session_id আসে → Frontend এ store করো (state/localStorage)
3. পরবর্তী সব message → POST /chat (সেই session_id সহ)
4. New conversation চাইলে → DELETE /sessions/{id}/history (অথবা session_id ছাড়া POST /chat)
5. Page close / logout → DELETE /sessions/{id} (optional cleanup)
```

Session 1 ঘন্টা নিষ্ক্রিয় থাকলে auto-expire হয়। Expired session এ request পাঠালে নতুন session তৈরি হয়।

---

## Endpoints

### 1. POST /chat

**Frontend এর মূল endpoint।** Question পাঠাও, answer পাও।

**Request:**

```
POST /chat
Content-Type: application/json
```

```json
{
  "question": "What is Botox and how does it work?",
  "session_id": null,
  "k": 5
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `question` | string | Yes | — | User এর প্রশ্ন |
| `session_id` | string \| null | No | null | আগের session continue করতে চাইলে দাও। null দিলে নতুন session তৈরি হয়। |
| `k` | integer | No | 5 | কতগুলো document retrieve করবে (1-10 recommended)। Frontend এ expose করার দরকার নেই। |

**Response (200):**

```json
{
  "answer": "Botox, or Botulinum Toxin Type A, is a purified protein...",
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `answer` | string | Chatbot এর উত্তর |
| `session_id` | string | UUID — পরবর্তী request এ এটা পাঠাতে হবে |

**Error Responses:**

| Status | When | Response |
|--------|------|----------|
| 500 | Ollama down / generation failed | `{"detail": "Generation failed: ..."}` |
| 503 | Vector store missing | `{"detail": "Vector store not found..."}` |

**Frontend Example (fetch):**

```javascript
const BASE_URL = "http://167.86.78.35";
let sessionId = null;

async function sendMessage(question) {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: question,
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  const data = await response.json();
  sessionId = data.session_id;
  return data.answer;
}
```

**Response Time:** 5-25 seconds (Ollama generation dependent)। Frontend এ loading indicator দেখাও।

---

### 2. GET /sessions/{session_id}/history

Chat history দেখো। Chat UI তে conversation reload করতে ব্যবহার করো।

**Request:**

```
GET /sessions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/history
```

**Response (200):**

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "history": [
    {
      "question": "What is Botox?",
      "answer": "Botox, or Botulinum Toxin Type A, is a purified protein..."
    },
    {
      "question": "How long does it last?",
      "answer": "Typically, Botox results last between 3 to 6 months..."
    }
  ],
  "count": 2
}
```

| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Session ID |
| `history` | array | Q&A pairs, chronological order |
| `history[].question` | string | User এর প্রশ্ন |
| `history[].answer` | string | Bot এর উত্তর |
| `count` | integer | Total exchanges |

**Error:**

| Status | When | Response |
|--------|------|----------|
| 404 | Session না থাকলে / expired | `{"detail": "Session not found."}` |

**Frontend Example:**

```javascript
async function loadHistory(sessionId) {
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/history`);

  if (response.status === 404) {
    return [];
  }

  const data = await response.json();
  return data.history;
}
```

---

### 3. DELETE /sessions/{session_id}/history

History clear করো, session alive থাকে। "New Conversation" button এ ব্যবহার করো।

**Request:**

```
DELETE /sessions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/history
```

**Response (200):**

```json
{
  "message": "History cleared for session a1b2c3d4-e5f6-7890-abcd-ef1234567890."
}
```

**Error:**

| Status | When | Response |
|--------|------|----------|
| 404 | Session না থাকলে | `{"detail": "Session not found."}` |

**Frontend Example:**

```javascript
async function clearHistory(sessionId) {
  await fetch(`${BASE_URL}/sessions/${sessionId}/history`, {
    method: "DELETE",
  });
}
```

---

### 4. DELETE /sessions/{session_id}

Session সম্পূর্ণ মুছে ফেলো। Logout / page unload এ ব্যবহার করো (optional)।

**Request:**

```
DELETE /sessions/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response (200):**

```json
{
  "message": "Session a1b2c3d4-e5f6-7890-abcd-ef1234567890 deleted."
}
```

**Error:**

| Status | When | Response |
|--------|------|----------|
| 404 | Session না থাকলে | `{"detail": "Session not found."}` |

**Frontend Example:**

```javascript
window.addEventListener("beforeunload", () => {
  if (sessionId) {
    navigator.sendBeacon(
      `${BASE_URL}/sessions/${sessionId}`,
      // sendBeacon only supports POST; use fetch for DELETE
    );
    // Alternative: fire-and-forget fetch
    fetch(`${BASE_URL}/sessions/${sessionId}`, { method: "DELETE" });
  }
});
```

---

### 5. GET /health

System health check। Frontend এ API available কিনা check করতে ব্যবহার করো।

**Request:**

```
GET /health
```

**Response (200):**

```json
{
  "status": "ok",
  "vector_store": true,
  "ollama": true,
  "active_sessions": 3
}
```

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `status` | string | `"ok"` \| `"degraded"` | `"ok"` = সব ঠিক, `"degraded"` = কিছু down |
| `vector_store` | boolean | — | FAISS index loaded? |
| `ollama` | boolean | — | Ollama reachable? |
| `active_sessions` | integer | — | বর্তমান active session সংখ্যা |

**Frontend Example:**

```javascript
async function checkHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}
```

---

## Error Response Format

সব error একই format এ আসে:

```json
{
  "detail": "Error message here"
}
```

| Status Code | Meaning | Frontend Action |
|-------------|---------|-----------------|
| 200 | Success | Data process করো |
| 404 | Session not found / expired | নতুন session শুরু করো (`session_id: null`) |
| 500 | Server error / Ollama failure | Retry দেখাও বা error message দেখাও |
| 503 | Vector store missing | "Service unavailable" দেখাও |

---

## CORS

API তে CORS middleware যোগ করা হয়নি। Frontend আলাদা domain থেকে call করলে CORS error আসবে।

**সমাধান options:**
1. Nginx এ CORS headers যোগ করো (recommended)
2. `api.py` তে FastAPI CORS middleware যোগ করো
3. Frontend কে same domain এ deploy করো

---

## Frontend Integration Tips

### Session Management

```javascript
// Session ID persist করো (page refresh এও টিকে থাকবে)
const SESSION_KEY = "faces_session_id";

function getSessionId() {
  return localStorage.getItem(SESSION_KEY);
}

function setSessionId(id) {
  localStorage.setItem(SESSION_KEY, id);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
```

### Typical Chat Component Flow

```
1. Component mount → getSessionId() from localStorage
2. If sessionId exists → GET /sessions/{id}/history → populate chat UI
3. If 404 → clearSession(), start fresh
4. User sends message → POST /chat → show loading → display answer
5. "New Chat" button → DELETE /sessions/{id}/history → clear UI → clearSession()
```

### Loading State

Response time 5-25 seconds হতে পারে। UI তে:
- Typing indicator / skeleton দেখাও
- Send button disable করো
- AbortController দিয়ে cancel option দাও (optional)

### Rate Limit

Nginx rate limit: 10 requests/second per IP, burst 20। Normal chat usage এ hit হবে না। কিন্তু rapid-fire automated requests পাঠালে 429 আসতে পারে।
