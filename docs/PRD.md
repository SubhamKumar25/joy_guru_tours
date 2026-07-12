# Joy Guru Tours & Travels — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** July 2025  
**Status:** In Development

---

## 1. Product Overview

Joy Guru Tours & Travels is a **premium outstation cab booking platform** serving the Northeast India region, headquartered in Silchar, Assam. The platform enables customers to book verified, government-certified cabs for outstation trips across Assam, Meghalaya, Tripura, and neighboring states.

---

## 2. Business Objectives

- Digitize the existing cab booking and payment workflow
- Enable online advance payments via Razorpay (reducing no-shows)
- Provide professional GST-compliant tax invoices to customers
- Give admin/operators a real-time dashboard to track bookings and collect balance payments
- Send automated WhatsApp and email confirmations to both customer and driver

---

## 3. User Roles

| Role | Description |
|------|-------------|
| **Customer (User)** | Books cabs, pays advance online, views invoices in their dashboard |
| **Admin / Operator** | Manages all bookings, assigns drivers, collects balance, generates reports |
| **Driver** | Receives WhatsApp assignment notifications, accepts trips |

---

## 4. Core Features

### 4.1 Landing Page
- Hero section with premium brand messaging
- Live search form: Pickup → Destination → Date → Time → Passengers
- Popular routes section with fare display
- Tour packages preview
- Customer reviews section
- WhatsApp floating CTA button
- Guided interactive demo mode

### 4.2 Search Results
- Dynamic vehicle listing with real fare calculation
- Filter sidebar: Vehicle type, AC/Non-AC, Fare range
- Vehicle cards: Name, seats, luggage, fuel, rating, fare
- "Select Ride" → proceeds to booking checkout

### 4.3 Booking & Payment Page
- Booking summary with selected vehicle
- Fare breakdown: Base fare → Coupon discount → GST → Total
- Coupon code field (NORTHEAST2025 = ₹500 off)
- **Razorpay advance payment** (25% of total)
  - UPI, card, netbanking support
  - Razorpay signature verification
- Post-payment: WhatsApp + email confirmation triggered

### 4.4 User Dashboard
- Active booking status with driver details
- 3-step timeline: Confirmed → Driver Assigned → Trip Completed
- **GST Tax Invoice** with full breakdown:
  - GSTIN, SAC Code (9964)
  - CGST (2.5%) + SGST (2.5%)
  - Coupon discount, gross total, advance paid, balance due
- **Download PDF** functionality
- **Profile tab** (Ola/Rapido inspired):
  - Saved places (Home, Work, Favorites)
  - Joy Credits wallet
  - Member tier (Silver / Gold / Platinum)
  - Emergency SOS contact
  - Recent trip history

### 4.5 Admin Control Center
- KPI cards: Revenue, Rides, Pending Collections, Active Drivers
- Live bookings table with status, driver, fare breakdown
- **Collect Balance** modal: Cash or UPI collection simulator
- Updates booking status to "Fully Paid" in real-time
- Sends driver assignment WhatsApp notification

### 4.6 Tour Packages
- Fixed-price curated northeast packages (Cherrapunji, Dawki, Kaziranga, etc.)
- Per-head pricing for groups
- Booking CTA linking to main booking flow

---

## 5. Technical Architecture

### Frontend
- **Framework:** Pure HTML5 + Tailwind CSS v4 (browser CDN)
- **State:** LocalStorage-based StateEngine (prototype) → REST API calls (production)
- **Interactivity:** Vanilla JS modular architecture

### Backend
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB + Mongoose ODM
- **Auth:** JWT (30-day tokens) + bcryptjs password hashing
- **Payments:** Razorpay Node.js SDK
- **Notifications:** NodeMailer (SMTP) + Twilio (WhatsApp)

---

## 6. Payment Flow

```
Customer selects vehicle
    ↓
Booking created in DB (status: Confirmed)
    ↓
POST /api/payments/create-order  →  Razorpay order created
    ↓
Customer completes payment on Razorpay checkout
    ↓
POST /api/payments/verify  →  Signature verified
    ↓
Booking updated (status: Advance Paid)
    ↓
Invoice auto-generated
    ↓
WhatsApp + Email sent to customer
    ↓
WhatsApp sent to driver
    ↓
Admin collects balance on trip completion
    ↓
Booking status: Fully Paid
```

---

## 7. Out of Scope (v1.0)

- Real-time GPS ride tracking
- Mobile app (Android/iOS)
- Multi-language (Hindi, Bengali, Assamese)
- Driver app
- Rating and review system post-trip
- Automated refund processing

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Booking conversion rate | > 35% |
| Advance payment success rate | > 90% |
| Customer WhatsApp delivery rate | > 95% |
| Invoice PDF download rate | > 60% |
| Admin balance collection time | < 2 minutes |
