# Joy Guru Travel Platform — Deployment Guide

---

## 🖥️ Local Development

```bash
# 1. Clone and install
git clone <repo-url>
cd joy-guru-travel-platform
npm install

# 2. Setup environment
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, RAZORPAY keys

# 3. Start MongoDB locally (if not using Atlas)
mongod --dbpath /data/db

# 4. Seed database
node server/seeds/seedDatabase.js

# 5. Run dev server (both frontend + backend concurrently)
npm run dev
```

---

## ☁️ MongoDB Atlas Setup (Production)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Whitelist your server IP (or `0.0.0.0/0` for testing)
4. Copy the connection string and set:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/joy_guru_travels?retryWrites=true&w=majority
```

---

## 🚀 Deploy Backend to Render (Free Tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repository
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server/app.js`
   - **Root Directory:** `joy-guru-travel-platform/`
5. Add environment variables from your `.env` file
6. Deploy!

**Note:** Free tier spins down after inactivity. Use paid tier for production.

---

## 🌐 Deploy Frontend to Netlify (Free)

1. Go to [netlify.com](https://netlify.com) → New Site
2. Drag & drop the `client/public/` folder, OR
3. Connect GitHub and set **Publish Directory:** `joy-guru-travel-platform/client/public`
4. Update `CLIENT_ORIGIN` in `.env` to your Netlify URL

**Important:** Update all `fetch()` API calls in the JS files to point to your Render backend URL.

---

## 💳 Razorpay Live Keys

1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete KYC as a business
3. Get live keys from Dashboard → Settings → API Keys
4. Set in `.env`:
```env
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_live_secret
```

---

## 📱 Twilio WhatsApp (Production)

1. Sign up at [twilio.com](https://twilio.com)
2. Enable WhatsApp Sandbox or apply for a WhatsApp Business Profile
3. Get your credentials and set in `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```
4. Uncomment the real Twilio API calls in `server/services/whatsappService.js`

---

## 📧 Gmail SMTP Setup

1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Create an App Password for "Mail"
4. Set in `.env`:
```env
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx   (app password, no spaces)
```

---

## 🔒 Production Security Checklist

- [ ] Change `JWT_SECRET` to a long random string (32+ chars)
- [ ] Enable HTTPS (SSL) on your server
- [ ] Restrict CORS `origin` to your actual frontend domain
- [ ] Rate-limit the `/api/auth/login` endpoint (use `express-rate-limit`)
- [ ] Enable MongoDB Atlas IP Whitelist
- [ ] Set `NODE_ENV=production`
- [ ] Never commit `.env` to git (add to `.gitignore`)

---

## 🔄 Running the Seed Script Again

```bash
# WARNING: Clears all existing data
node server/seeds/seedDatabase.js
```
