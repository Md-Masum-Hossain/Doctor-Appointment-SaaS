# Phase 14 Setup & Testing Guide

## 🚀 Quick Start

No new installation needed. All enhancements are to existing Phase 13A & 13B.

### 1. Backend is Running

Ensure backend still running from Phase 13:

```bash
cd server
npm run dev
```

(No new packages to install)

### 2. Frontend is Running

Ensure frontend still running from Phase 13:

```bash
cd client
npm run dev
```

### 3. Navigate to AI Chat

Same URL as before:
```
http://localhost:5173/ai-health-assistant
```

---

## 🧪 Testing New Features

### Test 1: Quick Symptom Selection

**Action:**
1. Load `/ai-health-assistant`
2. See empty state with 7 symptom chips
3. Click "Anxiety" chip

**Expected:**
- ✅ Input autofills with "I have Anxiety"
- ✅ Message sends automatically
- ✅ AI responds with Psychiatry recommendation
- ✅ No error displayed

**Screenshot points:**
- Welcome screen with chips visible
- Chip buttons have blue border color
- Selected chip triggers message

---

### Test 2: Better Emergency Alert

**Action:**
1. Send message: "I have chest pain and breathing difficulty"

**Expected:**
- ✅ Red emergency alert appears (not just message)
- ✅ Alert has alert icon + pulsing animation
- ✅ "Call Emergency" button visible
- ✅ Cardiology recommendation shown
- ✅ Calm but urgent tone in response

**Visual checks:**
- Red gradient background (from red-50 to red-100)
- Border-2 red-400
- Animated alert icon (pulses)
- Button says "Call Emergency" (tel: link works)

---

### Test 3: Improved Welcome Screen

**Action:**
1. Open `/ai-health-assistant` fresh
2. Look at welcome screen

**Expected:**
- ✅ Heart icon (not alert icon)
- ✅ "How it works" section with 4 steps
- ✅ Prominent yellow disclaimer box
- ✅ Quick symptom chips visible
- ✅ Better spacing and typography

**Visual checks:**
- Heart icon in welcome section
- Yellow disclaimer with high contrast
- Blue "How it works" card
- 7 symptom chips in a row (with wrapping)

---

### Test 4: Better Loading State

**Action:**
1. Send any message
2. Watch for loading animation

**Expected:**
- ✅ Rotating loader icon in send button
- ✅ Typing indicator shows (3 bouncing dots)
- ✅ Input disabled while loading
- ✅ Button shows loading state visually

**Visual checks:**
- Send button has animated icon
- Input appears dimmed during request
- Typing indicator (3 dots bouncing)

---

### Test 5: Better Recommendations

**Action:**
Send specific symptom combinations:

| Message | Expected Specialty |
|---------|-------------------|
| "tooth pain" | Dentistry |
| "I have anxiety and stress" | Psychiatry |
| "joint pain and arthritis" | Orthopedics |
| "eye strain and blurred vision" | Ophthalmology |
| "sore throat and fever" | General Medicine |

**Expected:**
- ✅ All return correct specialties
- ✅ Stethoscope icon shows in bubble
- ✅ Smooth fade-in animation

---

### Test 6: API Failure Fallback (Optional)

**Setup:**
Temporarily block Gemini API (modify ai.service.js to throw error)

**Expected:**
- ✅ Fallback response appears
- ✅ Recommendation still shows (keyword-based)
- ✅ No error message to user
- ✅ Chat continues normally

---

### Test 7: Message Display Quality

**Action:**
Send long message with multiple sentences

**Expected:**
- ✅ User message right-aligned (blue gradient)
- ✅ AI message left-aligned (gray)
- ✅ Both have proper padding and rounded corners
- ✅ Timestamps shown
- ✅ No overflow or wrapping issues

---

### Test 8: Responsive Design

**Action:**
Test on different screen sizes:

| Device | Screen Width |
|--------|-------------|
| Mobile | 375px |
| Tablet | 768px |
| Desktop | 1920px |

**Expected:**
- ✅ Messages readable at all sizes
- ✅ Input doesn't overflow
- ✅ Buttons properly sized
- ✅ Chat area scrolls properly
- ✅ Chips wrap/scroll on mobile

---

## 🔍 Backend Testing

### Test Emergency Detection

Open server and test ai.utils.js:

```javascript
detectEmergency("I have chest pain");           // true
detectEmergency("I have breathing difficulty");  // true
detectEmergency("I have a sore throat");        // false
detectEmergency("severe headache");              // true
```

### Test Symptoms Mapping

Test ai.symptoms.js:

```javascript
getRecommendedSpecializationFromSymptoms("I have fever and cough");
// Returns: "General Medicine" or "Pulmonology"

getRecommendedSpecializationFromSymptoms("I have chest pain");
// Returns: "Cardiology"
```

---

## 📋 Regression Tests

### Ensure Previous Features Still Work

- [ ] Basic chat still works (send/receive)
- [ ] Error messages display
- [ ] Auth headers sent with requests
- [ ] Empty state shows on load
- [ ] Clear button works
- [ ] Shift+Enter newline works
- [ ] Enter to send works
- [ ] Auto-scroll to bottom works
- [ ] Timestamps display correctly

---

## 🐛 Troubleshooting

### Issue: Chips not showing

**Check:**
1. EmptyChatState component rendered
2. SuggestedSymptomsChips component imported
3. No CSS conflicts

### Issue: Emergency alert not showing

**Check:**
1. Message contains emergency keyword
2. EnhancedEmergencyAlert component imported
3. Message parsing splits correctly

### Issue: Loader not animating

**Check:**
1. Framer Motion imported
2. Animation syntax correct
3. Browser supports animations

### Issue: Recommendations always "General Medicine"

**Check:**
1. ai.symptoms.js keywords are correct
2. Message normalization working
3. Fallback being triggered instead of AI

---

## 📊 Performance Check

### Browser DevTools

1. Open Performance tab
2. Record chat message send
3. Check:
   - Response time: < 2 seconds (Gemini API)
   - Animation frame rate: 60 FPS
   - Memory: No leaks
   - Network: 1 request to `/api/v1/ai/chat`

### Bundle Size

Phase 14 added:
- ai.symptoms.js: ~3KB
- New components: ~5KB
- Total addition: ~8KB

Acceptable impact on bundle size.

---

## 📞 Support Checklist

Before contacting support, verify:

- [ ] Backend running (`npm run dev` in server)
- [ ] Frontend running (`npm run dev` in client)
- [ ] Gemini API key set in `server/.env`
- [ ] No console errors (check browser DevTools)
- [ ] Network tab shows `/api/v1/ai/chat` requests
- [ ] Page loads at `http://localhost:5173/ai-health-assistant`

---

## ✅ Phase 14 Success Checklist

- ✅ Quick symptom chips working
- ✅ Emergency alerts prominent
- ✅ Better welcome screen
- ✅ Improved loading state
- ✅ Better specialization recommendations
- ✅ All previous features still work
- ✅ No console errors
- ✅ Responsive on all devices
- ✅ Animations smooth
- ✅ Disclaimer visible

**Phase 14 is ready for production.**