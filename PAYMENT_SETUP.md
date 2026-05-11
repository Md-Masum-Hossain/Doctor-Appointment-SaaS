# PHASE 7: Payment Module Setup Guide

## Quick Start

### Backend Setup

1. **Payment Routes Added**: Routes registered in `server/src/app.js`
   ```javascript
   app.use('/api/v1/payments', paymentRouter)
   ```

2. **Database Model**: Payment model created with all required fields
   - Indexes for efficient querying
   - Transaction support for data consistency

3. **Start the Server**:
   ```bash
   cd server
   npm run dev
   ```

### Frontend Setup

1. **Payment Routes Added**: Added to `client/src/routes/AppRouter.jsx`
   ```
   /patient/payments → PatientPaymentsPage
   /admin/payments → AdminPaymentsPage
   ```

2. **Start the Client**:
   ```bash
   cd client
   npm run dev
   ```

## Testing the Payment Module

### Test Case 1: Patient Creates Payment

**Steps**:
1. Login as patient
2. Navigate to "My Appointments"
3. Find a pending appointment
4. Click "Create Payment" (or navigate to `/patient/payments`)
5. Fill in the form:
   - Transaction ID: `TXN-TEST-001`
   - Payment Proof: (optional) `https://example.com/receipt.jpg`
   - Description: `Payment for appointment`
6. Click "Submit Payment"

**Expected Result**:
- Payment created with status = "pending"
- Appears in payment list
- Payment amount matches doctor's fee

### Test Case 2: Admin Verifies Payment

**Steps**:
1. Login as admin
2. Navigate to `/admin/payments`
3. See stats cards for pending, verified, failed, refunded
4. Click "Review" on a pending payment
5. Modal shows payment details
6. Click "Verify Payment"
7. Confirm verification

**Expected Result**:
- Payment status changes to "verified"
- Appointment paymentStatus changes to "paid"
- Payment disappears from "Pending" tab
- Appears in "Verified" tab
- Stats update

### Test Case 3: Admin Rejects Payment

**Steps**:
1. Create a new payment as patient
2. Login as admin
3. Go to `/admin/payments`
4. Click "Review" on the pending payment
5. Click "Reject Payment"
6. Enter rejection reason: `Receipt is blurry and unreadable`
7. Click "Confirm Rejection"

**Expected Result**:
- Payment status changes to "failed"
- Rejection reason saved
- Payment moves to "Failed" tab
- Appointment paymentStatus stays "unpaid"
- Patient can create a new payment

### Test Case 4: Admin Refunds Payment

**Steps**:
1. Verify a payment first (use Test Case 2)
2. Click on the verified payment
3. Click "Refund Payment"
4. Enter refund reason: `Appointment cancelled by doctor`
5. Confirm refund

**Expected Result**:
- Payment status changes to "refunded"
- Refund reason recorded
- Appointment paymentStatus changes to "refunded"
- Payment moves to "Refunded" tab

### Test Case 5: Duplicate Transaction ID Prevention

**Steps**:
1. Create a payment with transaction ID: `TXN-DUPLICATE`
2. Try creating another payment with the same transaction ID

**Expected Result**:
- Second payment fails
- Error message: `This transaction ID has already been used`

### Test Case 6: Amount Validation

**Steps**:
1. Find an appointment with a doctor fee of 500 BDT
2. Try creating a payment with amount = 400 BDT
3. Observe the response

**Expected Result**:
- Payment creation fails
- Error message: `Amount must match doctor's fee of 500`

### Test Case 7: Pagination

**Steps**:
1. Create multiple payments (10+)
2. Navigate to patient payments page
3. Check pagination controls

**Expected Result**:
- Payments shown 10 per page
- Pagination buttons work
- Page selection works

### Test Case 8: Payment Status Filtering

**Steps**:
1. As admin, go to `/admin/payments`
2. Click on different status tabs: pending, verified, failed, refunded

**Expected Result**:
- Payments filtered by status
- Count in tab matches filtered results
- Can toggle between tabs

## API Testing with Postman/cURL

### Create Payment (Patient)
```bash
POST /api/v1/payments
Authorization: Bearer {patient_token}
Content-Type: application/json

{
  "appointment": "66a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 500,
  "method": "manual",
  "transactionId": "TXN-20240101-001",
  "paymentProof": "https://example.com/receipt.jpg",
  "description": "Payment for consultation"
}
```

### Get My Payments (Patient)
```bash
GET /api/v1/payments/my?page=1&limit=10&status=pending
Authorization: Bearer {patient_token}
```

### Get All Payments (Admin)
```bash
GET /api/v1/payments/admin/all?page=1&limit=10
Authorization: Bearer {admin_token}
```

### Verify Payment (Admin)
```bash
PATCH /api/v1/payments/66a1b2c3d4e5f6g7h8i9j0k1/verify
Authorization: Bearer {admin_token}
Content-Type: application/json

{}
```

### Reject Payment (Admin)
```bash
PATCH /api/v1/payments/66a1b2c3d4e5f6g7h8i9j0k1/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "rejectionReason": "Receipt is invalid"
}
```

### Refund Payment (Admin)
```bash
PATCH /api/v1/payments/66a1b2c3d4e5f6g7h8i9j0k1/refund
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "refundReason": "Appointment cancelled"
}
```

## Troubleshooting

### Payment Not Appearing in List
- Check if appointment is not cancelled
- Verify transaction ID is unique
- Ensure amount matches doctor fee

### Transaction ID Not Unique Error
- Use a different transaction ID
- Check if the ID was used before

### Admin Cannot Verify Payment
- Ensure admin is logged in
- Check if payment status is "pending"
- Verify appointment exists

### Appointment Payment Status Not Updating
- Check MongoDB transaction logs
- Verify appointment ID is valid
- Check if payment verification completed successfully

## File Structure
```
server/
├── src/
│   ├── models/
│   │   └── Payment.js          ← Payment schema
│   └── modules/
│       └── payment/
│           ├── payment.controller.js    ← API handlers
│           ├── payment.service.js       ← Business logic
│           ├── payment.validation.js    ← Input validation
│           └── payment.route.js         ← Route definitions

client/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── PaymentStatusBadge.jsx
│   │   ├── payments/
│   │   │   └── PaymentForm.jsx
│   ├── hooks/
│   │   └── usePaymentsQuery.js
│   ├── pages/
│   │   ├── PatientPaymentsPage.jsx
│   │   └── AdminPaymentsPage.jsx
│   ├── services/
│   │   └── paymentService.js
│   └── routes/
│       └── AppRouter.jsx
```

## Next Steps

1. **Integration Testing**: Run the full test suite
2. **Load Testing**: Test with multiple concurrent payments
3. **UI Refinement**: Polish the payment pages
4. **Documentation**: Add user guides
5. **Gateway Integration**: Add Stripe/SSLCommerz when needed

## Notes
- Payment module uses manual verification (no gateway)
- Transaction IDs are manually entered by patients
- Admin verifies payment manually
- Perfect for MVP or testing
- Ready for gateway integration in future phases
