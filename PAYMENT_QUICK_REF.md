# PHASE 7 Payment Module - Developer Quick Reference

## 🚀 Quick Navigation

### Backend Implementation
```
Backend Routes: /api/v1/payments
├── POST   /         - Create payment (patient)
├── GET    /my       - Patient payments (patient)
├── GET    /:id      - Get payment (protected)
├── GET    /admin/all       - All payments (admin)
├── GET    /admin/stats     - Stats (admin)
├── PATCH  /:id/verify      - Verify (admin)
├── PATCH  /:id/reject      - Reject (admin)
└── PATCH  /:id/refund      - Refund (admin)

Files:
├── Models/      Payment.js
├── Routes/      payment.route.js
├── Controller/  payment.controller.js
├── Service/     payment.service.js
└── Validation/  payment.validation.js
```

### Frontend Implementation
```
Frontend Routes:
├── /patient/payments      - Patient payments page
└── /admin/payments        - Admin management page

Components:
├── PaymentStatusBadge.jsx
├── PaymentForm.jsx
├── PatientPaymentsPage.jsx
└── AdminPaymentsPage.jsx

Services & Hooks:
├── paymentService.js
└── usePaymentsQuery.js
```

## 📋 API Endpoint Reference

### Create Payment (Patient)
```http
POST /api/v1/payments
Authorization: Bearer {token}

{
  "appointment": "6abc...xyz",
  "amount": 500,
  "method": "manual",
  "transactionId": "TXN-20240101-001",
  "paymentProof": "https://...",
  "description": "..."
}
```

### Get Patient Payments
```http
GET /api/v1/payments/my?page=1&limit=10&status=pending
Authorization: Bearer {token}
```

### Verify Payment (Admin)
```http
PATCH /api/v1/payments/:id/verify
Authorization: Bearer {admin_token}
```

### Reject Payment (Admin)
```http
PATCH /api/v1/payments/:id/reject
Authorization: Bearer {admin_token}

{
  "rejectionReason": "..."
}
```

### Refund Payment (Admin)
```http
PATCH /api/v1/payments/:id/refund
Authorization: Bearer {admin_token}

{
  "refundReason": "..."
}
```

## 🔌 Service Method Reference

### paymentService (Backend)
```javascript
// Create
await paymentService.createPayment(patientId, payload)

// Retrieve
await paymentService.getPatientPayments(patientId, query)
await paymentService.getAdminPayments(query)
await paymentService.getPaymentById(paymentId, userId, userRole)

// Admin Actions
await paymentService.verifyPayment(paymentId, adminId)
await paymentService.rejectPayment(paymentId, adminId, reason)
await paymentService.refundPayment(paymentId, adminId, reason)

// Stats
await paymentService.getPaymentStats()
```

### paymentService (Frontend)
```javascript
// Create
paymentService.createPayment(data)

// Retrieve
paymentService.getMyPayments(params)
paymentService.getAdminPayments(params)
paymentService.getPaymentById(id)

// Admin Actions
paymentService.verifyPayment(id)
paymentService.rejectPayment(id, reason)
paymentService.refundPayment(id, reason)

// Stats
paymentService.getPaymentStats()
```

## 🎯 Component Usage Examples

### PaymentStatusBadge
```jsx
import { PaymentStatusBadge } from '@/components/common'

<PaymentStatusBadge status="verified" />
<PaymentStatusBadge status="pending" className="mb-4" />
```

### PaymentForm
```jsx
import { PaymentForm } from '@/components/payments'

<PaymentForm 
  appointmentId={appointmentId}
  onSuccess={() => refetch()}
  onCancel={() => setShowForm(false)}
/>
```

### Custom Query Hooks
```jsx
import { usePaymentsQuery, useAdminPaymentsQuery } from '@/hooks'

// Patient
const { data, isLoading } = usePaymentsQuery({ page: 1 })

// Admin
const { data, isLoading } = useAdminPaymentsQuery({ status: 'pending' })

// With mutation
const createMutation = useCreatePaymentMutation()
createMutation.mutate(paymentData)
```

## 🔍 Data Model Reference

### Payment Document
```javascript
{
  _id: ObjectId,
  appointment: ObjectId,
  patient: ObjectId,
  doctor: ObjectId,
  amount: 500,
  currency: "BDT",
  method: "manual",
  transactionId: "TXN-20240101-001",
  status: "verified",  // pending, verified, failed, refunded
  paymentProof: "https://...",
  description: "string",
  verifiedBy: ObjectId,
  verifiedAt: Date,
  rejectionReason: null,
  refundedAt: null,
  refundReason: null,
  createdAt: Date,
  updatedAt: Date
}
```

## ✅ Status Flow Diagram

```
Payment Creation:
[pending] ──┬──→ [verified] ──→ [refunded]
            │
            └──→ [failed]

Status Transitions:
- pending → verified (admin verify)
- pending → failed (admin reject)
- verified → refunded (admin refund)
- failed: cannot transition (patient must create new)
- verified: can transition to refunded only
- refunded: terminal state
```

## 🛡️ Authorization Rules

| Endpoint | Role | Access |
|----------|------|--------|
| POST /payments | patient | Create own |
| GET /payments/my | patient | Own payments |
| GET /payments/:id | any | Owner or admin |
| GET /admin/all | admin | All |
| PATCH :id/verify | admin | Any |
| PATCH :id/reject | admin | Any |
| PATCH :id/refund | admin | Any |

## 🧪 Common Test Cases

```javascript
// Test 1: Create Payment
POST /api/v1/payments
{ appointment: "...", amount: 500, transactionId: "TXN-001" }
// Expected: 201, payment status = "pending"

// Test 2: Verify Payment
PATCH /api/v1/payments/{id}/verify
// Expected: 200, payment status = "verified"
// Side Effect: Appointment.paymentStatus = "paid"

// Test 3: Duplicate Transaction ID
POST /api/v1/payments
{ ..., transactionId: "TXN-001" }  // Same as Test 1
// Expected: 400, error message

// Test 4: Reject Payment
PATCH /api/v1/payments/{id}/reject
{ rejectionReason: "Invalid receipt" }
// Expected: 200, payment status = "failed"

// Test 5: Refund Payment
PATCH /api/v1/payments/{verified_id}/refund
{ refundReason: "Appointment cancelled" }
// Expected: 200, payment status = "refunded"
```

## 🔧 Common Modifications

### Add a New Payment Status
1. Update Payment model: `paymentSchema.status` enum
2. Update validation: `paymentListQuerySchema.status`
3. Add transition logic in service
4. Add UI badge color in `PaymentStatusBadge.jsx`

### Add Payment Proof Upload
1. Update Payment model: change `paymentProof` to support file
2. Integrate with file upload service
3. Update form to accept file input
4. Modify PaymentForm component

### Add Email Notifications
1. Create mailer service
2. Add email template files
3. Call mailer in service methods (createPayment, verifyPayment, etc.)
4. Add mailer configuration to env

### Integrate Stripe
1. Update Payment model: add stripePaymentIntentId
2. Create Stripe service wrapper
3. Update createPayment to handle Stripe
4. Add webhook handler for payment events
5. Create Stripe verification flow

## 📊 Common Queries

### Count pending payments
```javascript
const count = await Payment.countDocuments({ status: 'pending' })
```

### Get total revenue
```javascript
const result = await Payment.aggregate([
  { $match: { status: 'verified' } },
  { $group: { _id: null, total: { $sum: '$amount' } } }
])
```

### Get payments by doctor
```javascript
const payments = await Payment.find({ doctor: doctorId })
```

### Get payment summary
```javascript
const stats = await Payment.aggregate([
  { $group: {
      _id: '$status',
      count: { $sum: 1 },
      amount: { $sum: '$amount' }
    }}
])
```

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Transaction ID validation fails | ID exists | Use unique ID |
| Amount mismatch | Wrong fee | Verify doctor fee |
| Payment not updating | Stale query | Refresh/refetch |
| Auth fails | Wrong token | Check token validity |
| Modal won't close | State issue | Check closeHandler |
| Stats show 0 | No payments | Create test data |

## 📚 Documentation References

- **PAYMENT_MODULE.md** - Full API documentation
- **PAYMENT_SETUP.md** - Setup and testing guide
- **PHASE_7_CHECKLIST.md** - Implementation checklist
- **PHASE_7_COMPLETE.md** - Comprehensive overview

---

**Last Updated**: May 11, 2026  
**Status**: ✅ Production Ready
