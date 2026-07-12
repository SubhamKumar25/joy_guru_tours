# Joy Guru Travel Platform — REST API Reference

Base URL: `http://localhost:5000/api`

All authenticated endpoints require: `Authorization: Bearer <token>`

---

## 🔐 Auth Endpoints

### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+91 94350 12345",
  "password": "securepassword123"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "user": { "id": "...", "name": "Rahul Sharma", "email": "...", "role": "user", "tier": "silver" }
}
```

---

### POST `/auth/login`
Authenticate and obtain JWT.

**Request Body:**
```json
{ "email": "rahul@example.com", "password": "securepassword123" }
```

**Response 200:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "Rahul Sharma", "role": "user", "walletBalance": 1250 }
}
```

---

### GET `/auth/me` 🔒
Get authenticated user profile.

**Response 200:**
```json
{ "success": true, "user": { "name": "...", "email": "...", "tier": "gold", ... } }
```

---

## 📋 Booking Endpoints

### POST `/bookings` 🔒
Create a new booking.

**Request Body:**
```json
{
  "vehicleName": "Toyota Innova Crysta",
  "vehicleType": "suv",
  "driverName": "Bimal Das",
  "driverPhone": "+91 94350 99999",
  "pickup": "Silchar Airport (IXS), Assam",
  "destination": "Shillong, Meghalaya",
  "travelDate": "2025-10-15",
  "travelTime": "09:30 AM",
  "baseFare": 6499,
  "gst": 300,
  "discount": 500,
  "couponCode": "NORTHEAST2025",
  "payableAmount": 6299,
  "advancePaid": 1500,
  "balanceDue": 4799
}
```

**Response 201:**
```json
{ "success": true, "message": "Booking created successfully", "booking": { "bookingId": "JG-20251015-4829", ... } }
```

---

### GET `/bookings/my` 🔒
Get all bookings for the authenticated user.

**Response 200:**
```json
{ "success": true, "count": 2, "bookings": [...] }
```

---

### GET `/bookings` 🔒🛡️ (Admin)
Get all bookings across all users.

---

### GET `/bookings/:id` 🔒
Get single booking by Booking ID (e.g., `JG-20251015-4829`).

---

### PUT `/bookings/:id/status` 🔒🛡️ (Admin)
Update booking status. Used to collect balance payment.

**Request Body:**
```json
{ "status": "Fully Paid", "collectedBy": "cash" }
```

---

## 💳 Payment Endpoints

### POST `/payments/create-order` 🔒
Create a Razorpay order before payment.

**Request Body:**
```json
{ "bookingId": "JG-20251015-4829", "amount": 1500 }
```

**Response 200:**
```json
{ "success": true, "order": { "id": "order_...", "amount": 150000, "currency": "INR" } }
```

---

### POST `/payments/verify` 🔒
Verify Razorpay payment signature after successful payment.

**Request Body:**
```json
{
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "hmac_signature",
  "bookingId": "JG-20251015-4829",
  "amount": 1500
}
```

---

### GET `/payments/:bookingId` 🔒
Get all payments for a booking.

---

## 🧾 Invoice Endpoints

### GET `/invoices/:bookingId` 🔒
Retrieve (auto-generate if absent) tax invoice for a booking.

**Response 200:**
```json
{
  "success": true,
  "invoice": {
    "invoiceNumber": "INV-20251015-4829",
    "gstin": "18AABCJ1920D1ZX",
    "sacCode": "9964",
    "baseFare": 6499,
    "cgst": 150,
    "sgst": 150,
    "grossTotal": 6299,
    "paymentStatus": "Advance Paid",
    ...
  }
}
```

---

### GET `/invoices` 🔒🛡️ (Admin)
List all invoices.

---

## 🏥 Health Check

### GET `/health`
```json
{ "success": true, "message": "Joy Guru Travel Platform API is running!", "version": "1.0.0" }
```

---

## 🔑 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (missing fields) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (admin role required) |
| 404 | Not Found |
| 409 | Conflict (email already exists) |
| 500 | Internal Server Error |
