# PHASE 13A — Gemini AI Backend Integration + AI Chat API

**Date Completed:** May 13, 2026  
**Status:** ✅ Complete  
**Scope:** Backend AI integration and API foundation using Google Gemini

---

## 📋 Quick Summary

Phase 13A establishes a production-ready backend AI module that uses **Google Gemini API** to deliver:

- **Conversational health guidance** — AI assistant responds to health questions without diagnosing
- **Doctor specialization recommendations** — Suggests relevant medical specialties
- **Emergency warning detection** — Pre-checks for critical keywords before calling Gemini
- **Secure API key handling** — Keys stored in `.env`, never exposed to frontend

The module implements clean architecture (controller → service → utils) with robust error handling, JSON validation, and timeout protection.

---

## 📦 Installation

### 1. Install Gemini SDK

```bash
npm install @google/generative-ai
```

**Already installed in:** `server/package.json`

### 2. Configure Environment Variables

Update `server/.env` with your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIMEOUT_MS=15000
```

**Get your API key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and paste into `GEMINI_API_KEY`

### 3. Verify Installation

Check that the package is installed:

```bash
npm ls @google/generative-ai
```

---

## 🏗️ Backend Folder Structure

All AI files are located in: `server/src/modules/ai/`

```
server/src/modules/ai/
├── ai.controller.js       # Request handler for chat endpoint
├── ai.routes.js           # Route definitions
├── ai.service.js          # Gemini API integration & response handling
├── ai.utils.js            # Emergency detection, JSON parsing, validation
├── ai.prompt.js           # System prompt for Gemini
├── ai.validation.js       # Request body schema validation
└── ai.route.js            # Compatibility re-export (backward compatible)
```

### File Descriptions

| File | Purpose |
|------|---------|
| **ai.controller.js** | Express route handler; receives request, calls service, returns JSON response |
| **ai.routes.js** | Defines routes and middleware (e.g., `POST /api/v1/ai/chat`) |
| **ai.service.js** | Core Gemini API logic; calls Google AI, parses response, handles errors |
| **ai.utils.js** | Utilities: emergency keyword detection, JSON parsing, timeout handling, response validation |
| **ai.prompt.js** | System prompt that instructs Gemini how to behave |
| **ai.validation.js** | Zod schema for validating incoming message payload |
| **ai.route.js** | Backward-compatible re-export for existing imports |

---

## 🔌 API Route Integration

### Base Route

```
/api/v1/ai
```

### Endpoint: Chat with AI

```
POST /api/v1/ai/chat
```

---

## 📡 Request & Response Format

### Request

```json
{
  "message": "I have fever and headache"
}
```

**Validation:**
- `message` is required
- Must be a string
- Length: 1–2000 characters
- Whitespace trimmed

### Response (Success)

```json
{
  "success": true,
  "message": "AI response generated successfully",
  "data": {
    "reply": "It sounds like you might be experiencing symptoms of a cold or flu. To help you feel better, stay hydrated, rest, and consider taking over-the-counter pain relievers like acetaminophen or ibuprofen. If symptoms persist for more than a week, please consult a doctor.",
    "recommendedSpecialization": "General Medicine",
    "emergency": false
  }
}
```

### Response (Emergency Detected)

When critical keywords are detected:

```json
{
  "success": true,
  "message": "AI response generated successfully",
  "data": {
    "reply": "Emergency warning: Your symptoms may indicate an urgent condition. Please contact local emergency services or go to the nearest emergency department immediately. Chest pain can indicate a serious heart condition. Seek immediate medical attention.",
    "recommendedSpecialization": "Cardiology",
    "emergency": true
  }
}
```

### Response (Error)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "path": "body.message",
      "message": "Message cannot be empty"
    }
  ]
}
```

---

## 🧠 AI System Prompt

The Gemini model is instructed via this system prompt (defined in `ai.prompt.js`):

### Key Rules

1. **NOT a doctor** — Always identify as a healthcare assistant, not a physician
2. **No diagnosis** — Never state or imply disease diagnosis
3. **No prescriptions** — Never prescribe medication or dosage
4. **General guidance only** — Offer wellness tips, self-care, hydration, rest
5. **Encourage professional care** — Always recommend consulting a licensed doctor
6. **JSON-only output** — Return ONLY valid JSON (no markdown, no explanations)
7. **Suggest specializations** — Recommend relevant medical specialties based on symptoms

### Response JSON Format (Fixed Contract)

Gemini MUST return JSON with exactly this structure:

```json
{
  "reply": "string",
  "recommendedSpecialization": "string",
  "emergency": false
}
```

---

## 🚨 Emergency Detection Logic

### Pre-Gemini Checks

Before calling Gemini, the system scans for emergency keywords:

```javascript
const emergencyKeywordPatterns = [
  /\bchest pain\b/i,
  /\bbreathing difficulty\b/i,
  /\bsevere bleeding\b/i,
  /\bstroke\b/i,
  /\bunconscious\b/i,
  /\bseizure\b/i,
]
```

### Behavior When Emergency Detected

1. **Flag:** `emergency: true`
2. **Prepend warning:** Add critical warning text to AI response
3. **Recommend:** Suggest appropriate emergency specialty

---

## 🔐 Security & Best Practices

### API Key Protection

- ✅ API key stored in `GEMINI_API_KEY` environment variable
- ✅ Never exposed to frontend
- ✅ Never logged or printed
- ✅ Load via `process.env.GEMINI_API_KEY`

### Input Validation

- ✅ Validate message length (1–2000 chars)
- ✅ Trim whitespace
- ✅ Type checking with Zod schema
- ✅ Clear error messages for invalid inputs

### Error Handling

- ✅ Timeout protection (15 seconds default, configurable)
- ✅ JSON parsing errors caught and reported
- ✅ Malformed responses detected and rejected
- ✅ Gemini API failures don't crash the server
- ✅ Errors logged with appropriate HTTP status codes

### Response Validation

- ✅ Ensure Gemini returned valid JSON
- ✅ Check required fields exist
- ✅ Sanitize string values
- ✅ Provide fallback values where safe

---

## 🏛️ Architecture & Code Patterns

### Controller → Service → Utils Flow

```
ai.controller.js (Handler)
  ↓ Call service
ai.service.js (Business Logic)
  ├─ Check emergency (utility)
  ├─ Call Gemini API
  ├─ Parse JSON (utility)
  └─ Validate payload (utility)
ai.utils.js (Reusable Helpers)
  ├─ emergencyKeywordPatterns
  ├─ detectEmergency()
  ├─ parseGeminiJsonResponse()
  ├─ ensureValidAiPayload()
  ├─ withTimeout()
  └─ prependEmergencyWarning()
```

### Error Handling

All errors use centralized `AppError` class:

```javascript
throw new AppError('Message', statusCode)
// Example: throw new AppError('Gemini API key is not configured', 500)
```

The global error handler in `middlewares/errorHandler.js` catches and formats errors.

### Request Validation

Validation happens via middleware before controller:

```javascript
aiRouter.post('/chat', validateRequest(aiChatSchema), chatWithAi)
```

---

## 📚 Code Walkthrough

### 1. Controller (`ai.controller.js`)

```javascript
export const chatWithAi = asyncHandler(async (req, res) => {
  const { message } = req.validated.body
  const result = await aiService.generateChatResponse(message)

  res.status(200).json({
    success: true,
    message: 'AI response generated successfully',
    data: result,
  })
})
```

**Flow:**
1. Extract validated message from request
2. Call service
3. Return formatted response

### 2. Service (`ai.service.js`)

```javascript
export const aiService = {
  async generateChatResponse(message) {
    // 1. Check for emergency keywords
    const emergencyDetected = detectEmergency(message)
    
    // 2. Get Gemini model
    const model = getGeminiModel()
    
    // 3. Call Gemini with system prompt + message
    const result = await withTimeout(
      model.generateContent({...}),
      GEMINI_TIMEOUT_MS,
      'Gemini request timed out'
    )
    
    // 4. Parse response (handle JSON extraction)
    const parsed = parseGeminiJsonResponse(rawText)
    
    // 5. Validate payload
    const sanitized = ensureValidAiPayload(parsed)
    
    // 6. Prepend emergency warning if needed
    return {
      reply: prependEmergencyWarning(sanitized.reply, emergencyDetected),
      recommendedSpecialization: sanitized.recommendedSpecialization,
      emergency: emergencyDetected,
    }
  },
}
```

### 3. Utils (`ai.utils.js`)

Each utility is modular and reusable:

- **`detectEmergency(message)`** — Regex pattern matching for critical keywords
- **`parseGeminiJsonResponse(rawText)`** — Robust JSON extraction from raw text
- **`ensureValidAiPayload(payload)`** — Type checking and field validation
- **`withTimeout(promise, ms, message)`** — Race-based timeout helper
- **`prependEmergencyWarning(reply, emergency)`** — Prepend critical warning text

---

## ✅ Implementation Checklist

- ✅ Gemini SDK installed (`@google/generative-ai`)
- ✅ Environment variables documented (`.env.example`)
- ✅ Controller implemented with proper asyncHandler
- ✅ Service with Gemini API integration
- ✅ Emergency detection logic (pre-check, keyword-based)
- ✅ JSON parsing with error recovery
- ✅ Timeout protection (configurable)
- ✅ Request validation (Zod schema)
- ✅ Response validation (payload checks)
- ✅ Error handling (AppError, async catch)
- ✅ Routes wired in app.js
- ✅ Backward compatibility (ai.route.js re-export)
- ✅ System prompt defined (ai.prompt.js)
- ✅ Clean architecture (controller → service → utils)
- ✅ No frontend exposure of API keys
- ✅ Production-ready code quality

---

## 🧪 Testing the Endpoint (Manual)

### Using cURL

```bash
curl -X POST http://localhost:5000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I have a sore throat"}'
```

### Using Postman

1. Create new POST request
2. URL: `http://localhost:5000/api/v1/ai/chat`
3. Body (JSON):
   ```json
   {
     "message": "I have a sore throat"
   }
   ```
4. Send

### Expected Response

```json
{
  "success": true,
  "message": "AI response generated successfully",
  "data": {
    "reply": "A sore throat can be caused by various conditions like a cold, flu, or strep throat. To manage the pain, you can try drinking warm liquids, using throat lozenges, or gargling with salt water. If it persists for more than a week or is accompanied by fever, please see a doctor.",
    "recommendedSpecialization": "General Medicine",
    "emergency": false
  }
}
```

---

## 🔄 Next Steps (Phase 14+)

- [ ] Build frontend chat UI component
- [ ] Integrate chat UI with `/api/v1/ai/chat` endpoint
- [ ] Add chat history/conversation threading
- [ ] Implement rate limiting for AI endpoint
- [ ] Add analytics/logging for AI interactions
- [ ] Extend with multi-turn conversations
- [ ] Caching for common questions

---

## 📝 File Changes Summary

| File | Change |
|------|--------|
| `server/src/modules/ai/ai.controller.js` | Replaced with `chatWithAi` handler |
| `server/src/modules/ai/ai.service.js` | Replaced with Gemini integration |
| `server/src/modules/ai/ai.validation.js` | Updated schema for `message` field |
| `server/src/modules/ai/ai.routes.js` | New file with `/chat` endpoint |
| `server/src/modules/ai/ai.prompt.js` | New file with system prompt |
| `server/src/modules/ai/ai.utils.js` | New file with utility functions |
| `server/src/modules/ai/ai.route.js` | Updated to re-export for compatibility |
| `server/src/app.js` | Updated import from `ai.route.js` → `ai.routes.js` |
| `server/.env.example` | Added `GEMINI_*` variables |
| `server/package.json` | Added `@google/generative-ai` dependency |

---

## 📖 References

- [Google Generative AI SDK (Node.js)](https://www.npmjs.com/package/@google/generative-ai)
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Prompt Engineering Guide](https://ai.google.dev/docs/prompt_engineering)

---

## 🎯 Success Criteria

✅ Backend AI integration complete  
✅ `/api/v1/ai/chat` endpoint working  
✅ Emergency detection functional  
✅ Secure environment configuration  
✅ Production-ready error handling  
✅ Clean, maintainable architecture  
✅ No frontend chat UI yet (as requested)

**Phase 13A is complete and ready for frontend integration in Phase 14.**