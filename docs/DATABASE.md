# Joy Guru Travel Platform — Database Schema Reference

Database: **MongoDB** (Mongoose ODM)  
Connection: `MONGO_URI` in `.env`

---

## Collections Overview

| Collection | Model | Purpose |
|-----------|-------|---------|
| `users` | User | Customer, Admin & Driver accounts |
| `bookings` | Booking | All cab booking records |
| `vehicles` | Vehicle | Fleet of cabs/SUVs/travelers |
| `drivers` | Driver | Driver profiles & assignment |
| `invoices` | Invoice | GST tax invoice records |
| `payments` | Payment | Individual payment transactions |

---

## 👤 User Schema

```js
{
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  password: String (hashed, bcrypt),
  role: Enum ['user', 'admin', 'driver'] (default: 'user'),
  tier: Enum ['silver', 'gold', 'platinum'] (default: 'silver'),
  walletBalance: Number (default: 0),
  sosContact: { name, phone, relation },
  savedPlaces: [{ label, address }],
  isActive: Boolean (default: true),
  createdAt, updatedAt (auto)
}
```

---

## 📋 Booking Schema

```js
{
  bookingId: String (unique, e.g. "JG-20251015-4829"),
  customer: ObjectId → User,
  customerName, customerPhone, customerEmail: String,
  
  vehicle: ObjectId → Vehicle,
  vehicleName, vehicleType: String,
  
  driver: ObjectId → Driver,
  driverName, driverPhone: String,
  
  route: String (e.g. "Silchar Airport ⇄ Shillong"),
  pickup, destination: String,
  travelDate, travelTime: String,
  
  baseFare, gst, discount: Number,
  couponCode: String,
  payableAmount, advancePaid, balanceDue: Number,
  
  status: Enum [
    'Pending', 'Confirmed', 'Advance Paid',
    'Driver Assigned', 'Trip Started',
    'Completed', 'Fully Paid', 'Cancelled'
  ],
  
  paymentMethod: Enum ['razorpay', 'cash', 'upi', 'card'],
  razorpayOrderId, razorpayPaymentId: String,
  
  isTourPackage: Boolean,
  packageName: String,
  createdAt, updatedAt (auto)
}
```

---

## 🚗 Vehicle Schema

```js
{
  name: String (e.g. "Toyota Innova Crysta"),
  type: Enum ['suv', 'sedan', 'traveler', 'hatchback', 'tempo'],
  registrationNumber: String (unique),
  year, capacity, luggageCapacity: Number,
  fuelType: Enum ['petrol', 'diesel', 'cng', 'electric'],
  hasAC: Boolean,
  baseFarePerKm, outstationRate: Number,
  rating: Number,
  assignedDriver: ObjectId → Driver,
  isActive: Boolean
}
```

---

## 🧑‍✈️ Driver Schema

```js
{
  name: String,
  phone: String (unique),
  email: String,
  licenseNumber: String (unique),
  licenseExpiry: Date,
  assignedVehicle: ObjectId → Vehicle,
  rating: Number,
  totalTrips: Number,
  currentStatus: Enum ['available', 'on_trip', 'offline'],
  isActive: Boolean
}
```

---

## 🧾 Invoice Schema

```js
{
  invoiceNumber: String (unique, e.g. "INV-20251015-4829"),
  booking: ObjectId → Booking,
  bookingId: String,
  customer: ObjectId → User,
  customerName, customerEmail, customerPhone: String,
  
  sacCode: String (default: '9964'),
  gstin: String (default: '18AABCJ1920D1ZX'),
  baseFare, discountAmount: Number,
  couponCode: String,
  cgst, sgst, totalTax, grossTotal: Number,
  
  advancePaid, balanceDue: Number,
  paymentStatus: Enum ['Advance Paid', 'Fully Paid', 'Pending'],
  
  travelDate, pickup, destination, vehicleName, driverName: String,
  invoiceDate: Date,
  pdfUrl: String
}
```

---

## 💳 Payment Schema

```js
{
  booking: ObjectId → Booking,
  bookingId: String,
  customer: ObjectId → User,
  amount: Number,
  currency: String (default: 'INR'),
  type: Enum ['advance', 'balance', 'full', 'refund'],
  channel: Enum ['razorpay', 'cash', 'upi', 'card', 'bank_transfer'],
  razorpayOrderId, razorpayPaymentId, razorpaySignature: String,
  status: Enum ['pending', 'captured', 'failed', 'refunded'],
  capturedAt: Date
}
```

---

## 📊 Entity Relationship Diagram

```
User ─────────────── Booking ─────────────── Vehicle
  (customer ref)       │                   (vehicle ref)
                       │
                    Driver ─────────────── Vehicle
                  (driver ref)         (assignedVehicle ref)
                       │
                    Invoice ←────── Booking (1:1)
                       │
                    Payment ←────── Booking (1:Many)
```

---

## 🗂️ Indexes

For production performance, add the following indexes:

```js
BookingSchema.index({ customer: 1, status: 1 });
BookingSchema.index({ travelDate: 1 });
BookingSchema.index({ bookingId: 1 }, { unique: true });

PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ razorpayPaymentId: 1 });

InvoiceSchema.index({ bookingId: 1 }, { unique: true });
```
