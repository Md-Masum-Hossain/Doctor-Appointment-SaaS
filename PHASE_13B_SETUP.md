# Phase 13B Setup & Testing Guide

## 🚀 Quick Start

### 1. Ensure Backend is Running

Backend must be running for API calls:

```bash
cd server
npm run dev
```

Verify backend is at: `http://localhost:5000`

### 2. Start Frontend

```bash
cd client
npm run dev
```

Frontend will be at: `http://localhost:5173`

### 3. Navigate to AI Chat

Open in browser:

```
http://localhost:5173/ai-health-assistant
```

---

## 💬 Test the Chat

### Example 1: Normal Symptom

**User message:**
```
I have a sore throat and mild fever
```

**Expected response:**
- ✅ AI message appears on left (gray bubble)
- ✅ Typing indicator while loading
- ✅ Specialization card shows (e.g., "General Medicine")
- ✅ No emergency alert
- ✅ Message scrolls into view

### Example 2: Emergency Symptoms

**User message:**
```
I have chest pain and breathing difficulty
```

**Expected response:**
- ✅ Red emergency alert displays
- ✅ AI response appears below
- ✅ `emergency: true` flag set
- ✅ Warning text prepended to response

### Example 3: Multiple Messages

Send several messages:
1. "I have a headache"
2. "It started this morning"
3. "Should I see a doctor?"

**Expected:**
- ✅ Chat maintains conversation flow
- ✅ All messages visible with timestamps
- ✅ Auto-scrolls to latest message

---

## ⌨️ Keyboard Testing

| Test | How | Expected |
|------|-----|----------|
| **Enter to send** | Type message + press Enter | Message sends immediately |
| **Shift+Enter newline** | Type + Shift+Enter | New line in textarea |
| **Textarea resize** | Type long message | Textarea grows (max 5 lines) |

---

## 📁 File Structure

All files created in:

```
client/src/features/ai/
├── components/
│   ├── ChatMessage.jsx
│   ├── ChatInput.jsx
│   ├── TypingIndicator.jsx
│   ├── EmergencyAlert.jsx
│   ├── SuggestedSpecializationCard.jsx
│   └── EmptyChatState.jsx
├── hooks/
│   └── useAIChat.js
├── pages/
│   └── AIHealthAssistantPage.jsx
└── services/
    └── aiApi.js
```

Updated files:
- `client/src/routes/AppRouter.jsx` — Added route

---

## 🔗 Route

```
/ai-health-assistant
```

Public accessible page (no auth required).

---

## 🎨 Color Scheme

Colors from `client/src/constants/theme.js`:

- **Primary:** #2563EB (Blue) — User messages, buttons
- **Accent:** #14B8A6 (Teal) — Specialization pill
- **Background:** #F8FAFC (Light Slate) — Page background
- **Text:** #0F172A (Dark Slate) — Text color

---

## 🐛 Troubleshooting

### Issue: Chat not responding

**Check:**
1. Is backend running? (`npm run dev` in server folder)
2. Is `.env` file set with `GEMINI_API_KEY`?
3. Check browser console for API errors

### Issue: Styling looks weird

**Check:**
1. Tailwind CSS is building: Run `npm run dev` in client
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart dev server

### Issue: Animations not smooth

**Check:**
1. Framer Motion is installed: `npm ls framer-motion`
2. No console errors blocking rendering
3. Try different browser

---

## 📊 Component Dependency Tree

```
AIHealthAssistantPage
  ├── useAIChat() hook
  │   └── aiApi.sendMessage()
  ├── ChatMessage
  ├── ChatInput
  ├── TypingIndicator
  ├── EmergencyAlert
  ├── EmptyChatState
  └── Framer Motion animations
```

---

## 🔐 Environment Variables

No additional env vars needed for frontend.

Backend needs: `GEMINI_API_KEY` (set in `server/.env`)

---

## 🎯 Success Checklist

- ✅ Page loads at `/ai-health-assistant`
- ✅ Can type and send messages
- ✅ AI responses appear within seconds
- ✅ Typing indicator shows while loading
- ✅ Emergency alerts display correctly
- ✅ Specialization cards show
- ✅ Messages scroll auto
- ✅ No console errors
- ✅ Responsive on mobile
- ✅ Animations smooth

---

## 📞 Support

For issues, check:
- [PHASE_13A_COMPLETE.md](PHASE_13A_COMPLETE.md) — Backend setup
- [PHASE_13B_COMPLETE.md](PHASE_13B_COMPLETE.md) — Full frontend docs