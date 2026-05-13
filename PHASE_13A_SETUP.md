# Phase 13A Setup Instructions

## 🚀 Quick Start

### 1. Install Dependency
```bash
cd server
npm install @google/generative-ai
```

### 2. Configure Environment
Update `server/.env`:
```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIMEOUT_MS=15000
```

Get API key: https://aistudio.google.com/app/apikey

### 3. Test Endpoint
```bash
curl -X POST http://localhost:5000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I have a fever"}'
```

---

## 📁 Backend AI Files

All AI integration files are in `server/src/modules/ai/`:

- `ai.controller.js` — Request handler
- `ai.routes.js` — Route definitions (`POST /api/v1/ai/chat`)
- `ai.service.js` — Gemini API integration
- `ai.utils.js` — Emergency detection, JSON parsing, validation
- `ai.prompt.js` — System prompt
- `ai.validation.js` — Request schema
- `ai.route.js` — Backward compatibility shim

---

## 🔌 API Endpoint

**POST** `/api/v1/ai/chat`

### Request
```json
{
  "message": "I have fever and headache"
}
```

### Response
```json
{
  "success": true,
  "message": "AI response generated successfully",
  "data": {
    "reply": "...",
    "recommendedSpecialization": "General Medicine",
    "emergency": false
  }
}
```

---

## 🚨 Emergency Keywords Detected

- chest pain
- breathing difficulty
- severe bleeding
- stroke
- unconscious
- seizure

When detected: `emergency: true` + warning prepended to reply

---

## ✅ What's Included

✓ Gemini API integration  
✓ Secure API key handling  
✓ Emergency keyword detection  
✓ JSON response parsing + validation  
✓ Timeout protection (15s default)  
✓ Request validation (Zod schema)  
✓ Error handling  
✓ Clean architecture (controller → service → utils)  
✓ Production-ready code  

**NO frontend UI yet** (Phase 14+)

---

## 📖 Full Documentation

See `PHASE_13A_COMPLETE.md` for detailed architecture, code walkthroughs, and next steps.