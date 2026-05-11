# Payment Module Documentation

## Overview
The payment module provides a complete payment management system with manual verification support. It allows patients to submit payments for appointments and enables admins to verify, reject, or refund those payments.

## Features
- ✅ Manual payment submission with transaction ID verification
- ✅ Admin payment verification/rejection workflow
- ✅ Payment refunding capability
- ✅ Automatic appointment payment status synchronization
- ✅ Complete audit trail (verified by, verification time, rejection reasons)
- ✅ Pagination and filtering
- ✅ Transaction ID uniqueness enforcement

## Backend Architecture

### Models

#### Payment Model (`server/src/models/Payment.js`)
```javascript
{
  appointment: ObjectId (required, indexed),
  patient: ObjectId (required, indexed),
  doctor: ObjectId (required, indexed),
  amount: Number (required, positive),
  currency: String (default: 'BDT', enum: ['BDT', 'USD']),
  method: String (default: 'manual', enum: ['manual', 'stripe', 'sslcommerz']),
  transactionId: String (required, unique, indexed),
  status: String (enum: ['pending', 'verified', 'failed', 'refunded'], default: 'pending'),
  paymentProof: String (optional),
  description: String (optional),
  verifiedBy: ObjectId (references User),
  verifiedAt: Date,
  rejectionReason: String (only when rejected),
  refundedAt: Date,
  refundReason: String (only when refunded),
  timestamps: true
}
```

### API Endpoints

#### Patient Endpoints

**POST /api/v1/payments** - Create Payment
- **Auth**: Requires patient role
- **Body**:
  ```json
  {
    "appointment": "appointment_id",
    "amount": 500,
    "method": "manual",
    "transactionId": "TXN-20240101-001",
    "paymentProof": "https://example.com/receipt.jpg",
    "description": "Payment for doctor consultation"
  }
  ```
- **Validation**:
  - appointment: valid MongoDB ID
  - amount: must match doctor's fee
  - transactionId: required, unique
  - method: must be one of ['manual', 'stripe', 'sslcommerz']

**GET /api/v1/payments/my** - Get Patient Payments
- **Auth**: Requires patient role
- **Query Params**:
  - `page`: Default 1
  - `limit`: Default 10, max 100
  - `status`: Filter by status ['pending', 'verified', 'failed', 'refunded']
  - `sortBy`: 'createdAt' or 'amount'
  - `sortOrder`: 'asc' or 'desc'

**GET /api/v1/payments/:id** - Get Payment By ID
- **Auth**: Required (patient can only view own)
- **Authorization**: Patient can view own payments, admin can view any

#### Admin Endpoints

**GET /api/v1/payments/admin/all** - Get All Payments
- **Auth**: Requires admin role
- **Query Params**: Same as patient payments

**GET /api/v1/payments/admin/stats** - Get Payment Statistics
- **Auth**: Requires admin role
- **Response**:
  ```json
  {
    "pending": { "count": 5, "totalAmount": 2500 },
    "verified": { "count": 20, "totalAmount": 10000 },
    "failed": { "count": 2, "totalAmount": 1000 },
    "refunded": { "count": 1, "totalAmount": 500 }
  }
  ```

**PATCH /api/v1/payments/:id/verify** - Verify Payment
- **Auth**: Requires admin role
- **Effect**:
  - Changes payment status to 'verified'
  - Updates appointment.paymentStatus to 'paid'
  - Records verifiedBy and verifiedAt

**PATCH /api/v1/payments/:id/reject** - Reject Payment
- **Auth**: Requires admin role
- **Body**:
  ```json
  {
    "rejectionReason": "Receipt is invalid"
  }
  ```
- **Effect**:
  - Changes payment status to 'failed'
  - Records rejection reason
  - Appointment stays 'unpaid'

**PATCH /api/v1/payments/:id/refund** - Refund Payment
- **Auth**: Requires admin role
- **Body**:
  ```json
  {
    "refundReason": "Appointment cancelled"
  }
  ```
- **Requirements**: Only verified payments can be refunded
- **Effect**:
  - Changes payment status to 'refunded'
  - Updates appointment.paymentStatus to 'refunded'

## Frontend Components

### Services

#### `paymentService` (`client/src/services/paymentService.js`)
```javascript
{
  createPayment(paymentData),
  getMyPayments(params),
  getAdminPayments(params),
  getPaymentById(id),
  verifyPayment(id),
  rejectPayment(id, rejectionReason),
  refundPayment(id, refundReason),
  getPaymentStats()
}
```

### Components

#### `PaymentStatusBadge` (`client/src/components/common/PaymentStatusBadge.jsx`)
Status-based color-coded badge component:
- pending: yellow
- verified/paid: green
- failed: red
- refunded: blue
- unpaid: gray

Usage:
```jsx
<PaymentStatusBadge status="verified" />
```

#### `PaymentForm` (`client/src/components/payments/PaymentForm.jsx`)
Modal form for patients to submit payments:
- Displays appointment details and fee
- Validates transaction ID (required)
- Optional payment proof URL
- Optional description
- Uses TanStack Query mutation
- Error handling and loading states

Usage:
```jsx
<PaymentForm 
  appointmentId={appointmentId}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

### Pages

#### `PatientPaymentsPage` (`client/src/pages/PatientPaymentsPage.jsx`)
Patient view of all their payments:
- Lists payments with pagination
- Shows: Amount, Method, Transaction ID, Status, Date
- Create new payment button
- Status filtering

#### `AdminPaymentsPage` (`client/src/pages/AdminPaymentsPage.jsx`)
Admin payment management dashboard:
- Stats cards showing counts by status
- Filter tabs for easy navigation
- Verification modal with full payment details
- Actions: Verify, Reject, Refund
- Requires reason for rejection/refund

### Hooks

#### `usePaymentsQuery.js` (`client/src/hooks/usePaymentsQuery.js`)
```javascript
usePaymentsQuery(options)           // Patient payments
useAdminPaymentsQuery(options)      // Admin payments
usePaymentStats()                   // Dashboard stats
useCreatePaymentMutation()          // Create payment
useVerifyPaymentMutation()          // Verify payment
useRejectPaymentMutation()          // Reject payment
useRefundPaymentMutation()          // Refund payment
```

## Payment Flow

### Patient Payment Submission
1. Patient views appointment details
2. Clicks "Create Payment" or navigates to payments page
3. Submits PaymentForm with:
   - Transaction ID (required)
   - Payment proof URL (optional)
   - Description (optional)
4. Payment created with status = "pending"
5. Patient sees payment in "Pending" status

### Admin Payment Verification
1. Admin navigates to /admin/payments
2. Sees stats and list of pending payments
3. Clicks "Review" on a pending payment
4. Modal shows full payment details and appointment info
5. Admin can:
   - **Verify**: Payment status → "verified", Appointment paymentStatus → "paid"
   - **Reject**: Payment status → "failed", records rejection reason
6. System records who verified/rejected and when

### Payment Refund Process
1. Admin navigates to verified payments
2. Selects a payment and initiates refund
3. Provides refund reason
4. Payment status → "refunded"
5. Appointment paymentStatus → "refunded"

## Transaction Support
All write operations use MongoDB transactions to ensure data consistency:
- Creating payment validates appointment and patient
- Verifying payment updates both Payment and Appointment
- Rejecting payment only updates Payment
- Refunding payment updates both Payment and Appointment

## Error Handling

### Common Errors
- **404 Not Found**: Appointment or Payment not found
- **400 Bad Request**: 
  - Amount doesn't match doctor fee
  - Duplicate transaction ID
  - Cannot create payment for cancelled appointment
  - Cannot verify non-pending payment
  - Cannot refund non-verified payment
- **403 Forbidden**: Unauthorized access (patient accessing other's payment)
- **409 Conflict**: Business logic conflicts

## Integration Points

### Appointment Module
- Payment.appointment references Appointment
- Appointment.paymentStatus updated when payment verified/refunded
- Payment amount must match doctor's fee (DoctorProfile.fee)

### User Module
- Payment.patient references User
- Payment.doctor references DoctorProfile.user
- Payment.verifiedBy references User (admin)

## Security Considerations
- ✅ Role-based authorization (patient vs admin)
- ✅ Data validation at multiple layers
- ✅ Authorization checks in service layer
- ✅ Transaction ID uniqueness prevents duplicates
- ✅ Audit trail (verified by, timestamp)
- ✅ Amount validation against actual fee

## Future Enhancements
1. **Stripe Integration**
   - Replace "manual" method with Stripe
   - Webhook handling for payment confirmation
   - Automatic payment verification

2. **SSLCommerz Integration**
   - Payment gateway for Bangladesh
   - IPN validation
   - Payment status syncing

3. **Email Notifications**
   - Payment submission confirmation
   - Verification/rejection notifications
   - Refund confirmation

4. **Payment Receipts**
   - Generate PDF receipts
   - Email delivery
   - Download from dashboard

5. **Advanced Analytics**
   - Payment trends
   - Revenue reports
   - Doctor earnings tracking

## Testing Checklist
- [ ] Patient can create payment
- [ ] Patient sees validation errors
- [ ] Admin can view all payments
- [ ] Admin can verify pending payment
- [ ] Admin can reject with reason
- [ ] Admin can refund verified payment
- [ ] Appointment paymentStatus updates correctly
- [ ] Payment stats display accurate counts
- [ ] Pagination works on both pages
- [ ] Status filtering works
- [ ] Transaction ID duplicate prevention works
