# Joy Guru Tours & Travels — Enterprise Platform

> **Premium Northeast India Travel & Cab Booking Platform**  
> Silchar, Assam, India | Government Certified Transport Provider

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- MongoDB >= 6.x (local or Atlas)
- npm >= 9.x

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd joy-guru-travel-platform

# Install all dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and fill in your credentials

# Seed the database with sample data
node server/seeds/seedDatabase.js

# Start development (both frontend + backend)
npm run dev
```

### Access the Application
| Service | URL |
|---------|-----|
| Frontend (Live Server) | http://localhost:5500 |
| Backend API | http://localhost:5000 |
| API Health Check | http://localhost:5000/api/health |

### Default Credentials (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@joygurutravels.com | admin@2025 |
| User | rahul@example.com | rahul@2025 |
| User | ananya@example.com | ananya@2025 |

---

## 📁 Project Structure

```
joy-guru-travel-platform/
├── client/                         # Frontend static assets
│   ├── components/                 # Reusable HTML component fragments
│   │   ├── Navbar/Navbar.html
│   │   ├── Footer/Footer.html
│   │   ├── Sidebar/Sidebar.html
│   │   ├── Cards/VehicleCard.html
│   │   ├── Cards/BookingCard.html
│   │   ├── Cards/InvoiceCard.html
│   │   ├── Modal/OtpModal.html
│   │   └── Modal/RazorpayModal.html
│   ├── css/                        # Modular stylesheet layers
│   │   ├── base/variables.css
│   │   ├── base/main.css
│   │   ├── layout/animations.css
│   │   ├── components/utilities.css
│   │   └── pages/                  # Page-specific styles
│   ├── js/                         # Modular JavaScript engines
│   │   ├── core/main.js            # State engine + UI utilities
│   │   ├── core/navigation.js      # Nav hooks + DOM events
│   │   ├── core/demo.js            # Guided tour assistant
│   │   ├── booking/booking.js      # Search & route selection
│   │   ├── payment/payment.js      # Razorpay checkout flow
│   │   ├── dashboard/dashboard.js  # Invoice, timeline, profile tabs
│   │   ├── admin/admin.js          # Admin panel table + modals
│   │   └── auth/auth.js            # Login, signup, OTP flows
│   └── public/                     # Deployable HTML pages
│       ├── index.html              # Landing Page
│       ├── Search Results.html
│       ├── Login & Signup.html
│       ├── Booking & Payment.html
│       ├── User Dashboard & Invoice.html
│       ├── Tour Packages.html
│       └── Admin Control Center.html
│
├── server/                         # Backend Express API
│   ├── app.js                      # Entry point
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js
│   │   ├── Booking.js
│   │   ├── Vehicle.js
│   │   ├── Driver.js
│   │   ├── Invoice.js
│   │   └── Payment.js
│   ├── controllers/                # Route logic
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   └── invoiceController.js
│   ├── routes/                     # Express routers
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── invoiceRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT protect + adminOnly guards
│   ├── services/
│   │   ├── emailService.js         # NodeMailer templates
│   │   └── whatsappService.js      # Twilio WhatsApp stubs
│   └── seeds/
│       └── seedDatabase.js         # Test data seed script
│
├── docs/                           # Enterprise documentation
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── PRD.md
│
├── package.json
└── .env.example
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Tailwind CSS v4, Vanilla JS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Payments | Razorpay (simulated / live-ready) |
| Email | NodeMailer + Gmail SMTP |
| WhatsApp | Twilio API (stub, production-ready) |
| Dev Tools | Nodemon, Concurrently, Live-Server |

---

## 📜 License

MIT — Joy Guru Tours & Travels, Silchar, Assam, India © 2025
