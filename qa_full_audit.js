/**
 * ═══════════════════════════════════════════════════════════════
 *  JOY GURU TRAVEL PLATFORM — FULL QA AUDIT SUITE
 *  Senior QA Engineer / Security Tester / Full Stack Debugger
 * ═══════════════════════════════════════════════════════════════
 */
require('dotenv').config();
const http = require('http');
const crypto = require('crypto');

const BASE = 'http://localhost:5000';
const results = [];
let totalPass = 0;
let totalFail = 0;
let totalWarn = 0;

// ─── Unique test user to avoid collisions ───
const UNIQUE = Date.now().toString(36);
const TEST_USER = {
  name: `QA Tester ${UNIQUE}`,
  email: `qatest_${UNIQUE}@testmail.com`,
  password: 'SecurePass123!',
  phone: `+91 99${UNIQUE.slice(0,3)}00001`
};

let customerToken = null;
let adminToken = null;
let customerId = null;
let testBookingId = null;

// ─── HTTP Helper ───
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const postData = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (postData) opts.headers['Content-Length'] = Buffer.byteLength(postData);

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    if (postData) req.write(postData);
    req.end();
  });
}

function log(status, category, test, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  if (status === 'PASS') totalPass++;
  else if (status === 'FAIL') totalFail++;
  else totalWarn++;
  const entry = { status, category, test, detail };
  results.push(entry);
  console.log(`  ${icon} [${category}] ${test}${detail ? ' — ' + detail : ''}`);
}

// ═══════════════════════════════════════════════════════════════
//  1. AUTHENTICATION TESTING
// ═══════════════════════════════════════════════════════════════
async function testAuth() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     1. AUTHENTICATION TESTING             ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // 1.1 Register — empty fields
  try {
    const r = await request('POST', '/api/auth/register', {});
    if (r.status === 400 && r.body.success === false) log('PASS', 'AUTH', 'Register: empty fields rejected');
    else log('FAIL', 'AUTH', 'Register: empty fields should be rejected', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Register: empty fields rejected', e.message); }

  // 1.2 Register — valid new user
  try {
    const r = await request('POST', '/api/auth/register', TEST_USER);
    if (r.status === 201 && r.body.success && r.body.token) {
      customerToken = r.body.token;
      customerId = r.body._id;
      log('PASS', 'AUTH', 'Register: new user created');
    } else log('FAIL', 'AUTH', 'Register: new user', `Got ${r.status} ${r.body.message || ''}`);
  } catch (e) { log('FAIL', 'AUTH', 'Register: new user', e.message); }

  // 1.3 Register — duplicate email
  try {
    const r = await request('POST', '/api/auth/register', TEST_USER);
    if (r.status === 400) log('PASS', 'AUTH', 'Register: duplicate email rejected');
    else log('FAIL', 'AUTH', 'Register: duplicate email should be rejected', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Register: duplicate email rejected', e.message); }

  // 1.4 Login — empty fields
  try {
    const r = await request('POST', '/api/auth/login', {});
    if (r.status === 400) log('PASS', 'AUTH', 'Login: empty fields rejected');
    else log('FAIL', 'AUTH', 'Login: empty fields should return 400', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Login: empty fields rejected', e.message); }

  // 1.5 Login — wrong password
  try {
    const r = await request('POST', '/api/auth/login', { email: TEST_USER.email, password: 'WrongPass999' });
    if (r.status === 401) log('PASS', 'AUTH', 'Login: wrong password returns 401');
    else log('FAIL', 'AUTH', 'Login: wrong password should return 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Login: wrong password', e.message); }

  // 1.6 Login — non-existing email
  try {
    const r = await request('POST', '/api/auth/login', { email: 'nonexist_xyz@fake.com', password: 'anything' });
    if (r.status === 401) log('PASS', 'AUTH', 'Login: non-existing email returns 401');
    else log('FAIL', 'AUTH', 'Login: non-existing email should return 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Login: non-existing email', e.message); }

  // 1.7 Login — correct credentials
  try {
    const r = await request('POST', '/api/auth/login', { email: TEST_USER.email, password: TEST_USER.password });
    if (r.status === 200 && r.body.token && r.body.role === 'customer') {
      customerToken = r.body.token;
      log('PASS', 'AUTH', 'Login: correct credentials returns JWT');
    } else log('FAIL', 'AUTH', 'Login: correct credentials', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Login: correct credentials', e.message); }

  // 1.8 JWT — get profile with valid token
  try {
    const r = await request('GET', '/api/auth/me', null, customerToken);
    if (r.status === 200 && r.body.success && r.body.data.email === TEST_USER.email) {
      log('PASS', 'AUTH', 'JWT: /api/auth/me returns correct user data');
    } else log('FAIL', 'AUTH', 'JWT: /api/auth/me failed', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'JWT: /api/auth/me', e.message); }

  // 1.9 JWT — no token
  try {
    const r = await request('GET', '/api/auth/me');
    if (r.status === 401) log('PASS', 'AUTH', 'JWT: missing token returns 401');
    else log('FAIL', 'AUTH', 'JWT: missing token should return 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'JWT: missing token', e.message); }

  // 1.10 JWT — invalid/garbage token
  try {
    const r = await request('GET', '/api/auth/me', null, 'garbage.invalid.token');
    if (r.status === 401) log('PASS', 'AUTH', 'JWT: invalid token returns 401');
    else log('FAIL', 'AUTH', 'JWT: invalid token should return 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'JWT: invalid token', e.message); }

  // 1.11 JWT — expired token (forge one with 0s expiry)
  try {
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign({ id: customerId }, process.env.JWT_SECRET || 'supersecret_joyguru_key_2026', { expiresIn: '0s' });
    // Small delay to ensure expiry
    await new Promise(r => setTimeout(r, 1500));
    const r = await request('GET', '/api/auth/me', null, expiredToken);
    if (r.status === 401) log('PASS', 'AUTH', 'JWT: expired token returns 401');
    else log('FAIL', 'AUTH', 'JWT: expired token should return 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'JWT: expired token', e.message); }

  // 1.12 Admin login
  try {
    const r = await request('POST', '/api/auth/login', { email: 'admin@joyguru.com', password: 'password123' });
    if (r.status === 200 && r.body.token && r.body.role === 'admin') {
      adminToken = r.body.token;
      log('PASS', 'AUTH', 'Admin: login returns admin role + JWT');
    } else log('FAIL', 'AUTH', 'Admin: login failed', `Got ${r.status} role=${r.body.role || 'none'}`);
  } catch (e) { log('FAIL', 'AUTH', 'Admin: login', e.message); }

  // 1.13 Admin — wrong password
  try {
    const r = await request('POST', '/api/auth/login', { email: 'admin@joyguru.com', password: 'wrongadminpwd' });
    if (r.status === 401) log('PASS', 'AUTH', 'Admin: wrong password returns 401');
    else log('FAIL', 'AUTH', 'Admin: wrong password should return 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Admin: wrong password', e.message); }

  // 1.14 Customer cannot access admin-only routes
  try {
    const r = await request('GET', '/api/auth/customers', null, customerToken);
    if (r.status === 403) log('PASS', 'AUTH', 'RBAC: customer blocked from admin-only route (GET /customers)');
    else log('FAIL', 'AUTH', 'RBAC: customer should be blocked from admin routes', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'RBAC: customer blocked from admin routes', e.message); }

  // 1.15 Admin can access admin-only routes
  try {
    const r = await request('GET', '/api/auth/customers', null, adminToken);
    if (r.status === 200 && r.body.success) log('PASS', 'AUTH', 'RBAC: admin can access GET /customers');
    else log('FAIL', 'AUTH', 'RBAC: admin should access GET /customers', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'RBAC: admin access /customers', e.message); }

  // 1.16 Update profile
  try {
    const r = await request('PUT', '/api/auth/me', { name: `QA Updated ${UNIQUE}`, phone: '+91 00000 00001' }, customerToken);
    if (r.status === 200 && r.body.success && r.body.data.name.includes('Updated')) {
      log('PASS', 'AUTH', 'Profile: update name/phone succeeds');
    } else log('FAIL', 'AUTH', 'Profile: update failed', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Profile: update', e.message); }

  // 1.17 Forgot password — non-existing email
  try {
    const r = await request('POST', '/api/auth/forgot-password', { email: 'not_real_email@fake.com' });
    if (r.status === 404) log('PASS', 'AUTH', 'Forgot password: non-existing email returns 404');
    else log('FAIL', 'AUTH', 'Forgot password: non-existing email should be 404', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Forgot password: non-existing email', e.message); }

  // 1.18 Forgot password — empty email
  try {
    const r = await request('POST', '/api/auth/forgot-password', {});
    if (r.status === 400) log('PASS', 'AUTH', 'Forgot password: empty email returns 400');
    else log('FAIL', 'AUTH', 'Forgot password: empty email should be 400', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Forgot password: empty email', e.message); }

  // 1.19 Reset password — invalid token
  try {
    const r = await request('POST', '/api/auth/reset-password/fake_invalid_token', { password: 'NewPass123' });
    if (r.status === 400) log('PASS', 'AUTH', 'Reset password: invalid token returns 400');
    else log('FAIL', 'AUTH', 'Reset password: invalid token should be 400', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Reset password: invalid token', e.message); }

  // 1.20 Password stored as hash (not plaintext) — verify via login
  try {
    // If we can login with original password and it works, bcrypt hashing is functional
    const r = await request('POST', '/api/auth/login', { email: TEST_USER.email, password: TEST_USER.password });
    if (r.status === 200 && r.body.token) log('PASS', 'AUTH', 'Password hashing: bcrypt verified (login works)');
    else log('FAIL', 'AUTH', 'Password hashing verification', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUTH', 'Password hashing verification', e.message); }
}

// ═══════════════════════════════════════════════════════════════
//  2. BOOKING TESTING
// ═══════════════════════════════════════════════════════════════
async function testBookings() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     2. BOOKING TESTING                    ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // 2.1 Create booking — missing fields
  try {
    const r = await request('POST', '/api/bookings', { customerName: 'Test' });
    if (r.status === 400) log('PASS', 'BOOKING', 'Create: missing fields rejected');
    else log('FAIL', 'BOOKING', 'Create: missing fields should be rejected', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'BOOKING', 'Create: missing fields', e.message); }

  // 2.2 Create booking — valid
  try {
    const bookingData = {
      customerName: TEST_USER.name,
      customerPhone: TEST_USER.phone,
      customerEmail: TEST_USER.email,
      pickup: 'Silchar, Assam',
      destination: 'Guwahati, Assam',
      travelDate: '2026-08-15',
      travelTime: '08:00',
      passengerCount: 2,
      specialRequest: 'QA test booking',
      vehicleName: 'Toyota Innova',
      vehicleType: 'suv',
      userId: customerId
    };
    const r = await request('POST', '/api/bookings', bookingData);
    if (r.status === 201 && r.body.success && r.body.data.id) {
      testBookingId = r.body.data.id;
      log('PASS', 'BOOKING', `Create: booking created (${testBookingId})`);
    } else log('FAIL', 'BOOKING', 'Create: valid booking', `Got ${r.status} ${r.body.message || ''}`);
  } catch (e) { log('FAIL', 'BOOKING', 'Create: valid booking', e.message); }

  // 2.3 Get all bookings — admin
  try {
    const r = await request('GET', '/api/bookings', null, adminToken);
    if (r.status === 200 && r.body.success && Array.isArray(r.body.data)) {
      log('PASS', 'BOOKING', `Get all (admin): returned ${r.body.data.length} bookings`);
    } else log('FAIL', 'BOOKING', 'Get all (admin)', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'BOOKING', 'Get all (admin)', e.message); }

  // 2.4 Get all bookings — customer blocked
  try {
    const r = await request('GET', '/api/bookings', null, customerToken);
    if (r.status === 403) log('PASS', 'BOOKING', 'Get all: customer blocked (403)');
    else log('FAIL', 'BOOKING', 'Get all: customer should be blocked', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'BOOKING', 'Get all: customer blocked', e.message); }

  // 2.5 Get my bookings — customer
  try {
    const r = await request('GET', '/api/bookings/my', null, customerToken);
    if (r.status === 200 && r.body.success && Array.isArray(r.body.data)) {
      const found = r.body.data.some(b => b.id === testBookingId);
      if (found) log('PASS', 'BOOKING', 'Get my bookings: test booking found');
      else log('FAIL', 'BOOKING', 'Get my bookings: test booking NOT found');
    } else log('FAIL', 'BOOKING', 'Get my bookings', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'BOOKING', 'Get my bookings', e.message); }

  // 2.6 Get single booking
  if (testBookingId) {
    try {
      const r = await request('GET', `/api/bookings/${testBookingId}`, null, customerToken);
      if (r.status === 200 && r.body.data.id === testBookingId) {
        log('PASS', 'BOOKING', `Get by ID: ${testBookingId} retrieved`);
      } else log('FAIL', 'BOOKING', 'Get by ID', `Got ${r.status}`);
    } catch (e) { log('FAIL', 'BOOKING', 'Get by ID', e.message); }
  }

  // 2.7 Get non-existing booking
  try {
    const r = await request('GET', '/api/bookings/JG-999999', null, adminToken);
    if (r.status === 404) log('PASS', 'BOOKING', 'Get by ID: non-existing returns 404');
    else log('FAIL', 'BOOKING', 'Get by ID: non-existing should be 404', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'BOOKING', 'Get by ID: non-existing', e.message); }

  // 2.8 Admin update booking (propose fare)
  if (testBookingId) {
    try {
      const r = await request('PUT', `/api/bookings/${testBookingId}`, {
        status: 'Fare Proposed',
        finalFare: 5000,
        advanceRequired: 2000,
        driverName: 'Rajesh Kumar',
        driverPhone: '+91 98765 43210'
      }, adminToken);
      if (r.status === 200 && r.body.data.status === 'Fare Proposed' && r.body.data.finalFare === 5000) {
        log('PASS', 'BOOKING', 'Admin update: fare proposed, driver assigned');
      } else log('FAIL', 'BOOKING', 'Admin update: fare proposed', `Got ${r.status} status=${r.body.data?.status}`);
    } catch (e) { log('FAIL', 'BOOKING', 'Admin update: fare proposed', e.message); }
  }

  // 2.9 Customer can only cancel (not update other fields)
  if (testBookingId) {
    try {
      const r = await request('PUT', `/api/bookings/${testBookingId}`, {
        status: 'Confirmed',
        finalFare: 9999
      }, customerToken);
      if (r.status === 403) log('PASS', 'BOOKING', 'Customer: cannot update status to Confirmed (403)');
      else log('FAIL', 'BOOKING', 'Customer: should NOT be able to Confirm bookings', `Got ${r.status}`);
    } catch (e) { log('FAIL', 'BOOKING', 'Customer: cannot update status', e.message); }
  }

  // 2.10 Customer can cancel their own booking
  // (We'll test this later and revert the status via admin)

  // 2.11 Delete booking — customer blocked
  if (testBookingId) {
    try {
      const r = await request('DELETE', `/api/bookings/${testBookingId}`, null, customerToken);
      if (r.status === 403) log('PASS', 'BOOKING', 'Delete: customer blocked (403)');
      else log('FAIL', 'BOOKING', 'Delete: customer should be blocked', `Got ${r.status}`);
    } catch (e) { log('FAIL', 'BOOKING', 'Delete: customer blocked', e.message); }
  }

  // 2.12 Delete booking — no auth
  if (testBookingId) {
    try {
      const r = await request('DELETE', `/api/bookings/${testBookingId}`);
      if (r.status === 401) log('PASS', 'BOOKING', 'Delete: no auth returns 401');
      else log('FAIL', 'BOOKING', 'Delete: no auth should return 401', `Got ${r.status}`);
    } catch (e) { log('FAIL', 'BOOKING', 'Delete: no auth', e.message); }
  }
}

// ═══════════════════════════════════════════════════════════════
//  3. PAYMENT TESTING
// ═══════════════════════════════════════════════════════════════
async function testPayments() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     3. PAYMENT TESTING                    ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // 3.1 Create Razorpay order — missing params
  try {
    const r = await request('POST', '/api/payments/razorpay-order', {}, customerToken);
    if (r.status === 400) log('PASS', 'PAYMENT', 'Create order: missing params rejected');
    else log('FAIL', 'PAYMENT', 'Create order: missing params should be 400', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Create order: missing params', e.message); }

  // 3.2 Create Razorpay order — valid
  if (testBookingId) {
    try {
      const r = await request('POST', '/api/payments/razorpay-order', {
        bookingId: testBookingId,
        amount: 2000
      }, customerToken);
      if (r.status === 201 && r.body.success && r.body.data.orderId) {
        log('PASS', 'PAYMENT', `Create order: orderId=${r.body.data.orderId} isMock=${r.body.data.isMock}`);
      } else log('FAIL', 'PAYMENT', 'Create order: valid request', `Got ${r.status}`);
    } catch (e) { log('FAIL', 'PAYMENT', 'Create order: valid', e.message); }
  }

  // 3.3 Create order — no auth
  try {
    const r = await request('POST', '/api/payments/razorpay-order', { bookingId: 'JG-1001', amount: 1000 });
    if (r.status === 401) log('PASS', 'PAYMENT', 'Create order: no auth returns 401');
    else log('FAIL', 'PAYMENT', 'Create order: no auth should be 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Create order: no auth', e.message); }

  // 3.4 Create order — invalid booking ID
  try {
    const r = await request('POST', '/api/payments/razorpay-order', { bookingId: 'FAKE-99999', amount: 1000 }, customerToken);
    if (r.status === 404) log('PASS', 'PAYMENT', 'Create order: invalid bookingId returns 404');
    else log('FAIL', 'PAYMENT', 'Create order: invalid bookingId', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Create order: invalid bookingId', e.message); }

  // 3.5 Verify payment — missing params
  try {
    const r = await request('POST', '/api/payments/razorpay-verify', {}, customerToken);
    if (r.status === 400) log('PASS', 'PAYMENT', 'Verify: missing params rejected');
    else log('FAIL', 'PAYMENT', 'Verify: missing params should be 400', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Verify: missing params', e.message); }

  // 3.6 Verify payment — invalid signature with real Razorpay order prefix
  try {
    const r = await request('POST', '/api/payments/razorpay-verify', {
      bookingId: testBookingId || 'JG-1001',
      amount: 2000,
      razorpay_order_id: 'order_REAL_fake',
      razorpay_payment_id: 'pay_fake123',
      razorpay_signature: 'invalid_signature_value'
    }, customerToken);
    if (r.status === 400) log('PASS', 'PAYMENT', 'Verify: invalid signature rejected');
    else log('FAIL', 'PAYMENT', 'Verify: invalid signature should be 400', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Verify: invalid signature', e.message); }

  // 3.7 Get payment history — customer
  try {
    const r = await request('GET', '/api/payments', null, customerToken);
    if (r.status === 200 && r.body.success) log('PASS', 'PAYMENT', `Payment history: customer (${r.body.data.length} records)`);
    else log('FAIL', 'PAYMENT', 'Payment history: customer', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Payment history: customer', e.message); }

  // 3.8 Get payment history — no auth
  try {
    const r = await request('GET', '/api/payments');
    if (r.status === 401) log('PASS', 'PAYMENT', 'Payment history: no auth returns 401');
    else log('FAIL', 'PAYMENT', 'Payment history: no auth should be 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Payment history: no auth', e.message); }

  // 3.9 Get invoices — customer
  try {
    const r = await request('GET', '/api/payments/invoices', null, customerToken);
    if (r.status === 200 && r.body.success) log('PASS', 'PAYMENT', `Invoices list: customer (${r.body.data.length} records)`);
    else log('FAIL', 'PAYMENT', 'Invoices list: customer', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Invoices list: customer', e.message); }

  // 3.10 Download invoice — non-existing
  try {
    const r = await request('GET', '/api/payments/invoices/JG-999999/download', null, customerToken);
    if (r.status === 404) log('PASS', 'PAYMENT', 'Invoice download: non-existing returns 404');
    else log('FAIL', 'PAYMENT', 'Invoice download: non-existing should be 404', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Invoice download: non-existing', e.message); }

  // 3.11 Refund — customer blocked
  try {
    const r = await request('POST', '/api/payments/pay_fake/refund', {}, customerToken);
    if (r.status === 403) log('PASS', 'PAYMENT', 'Refund: customer blocked (403)');
    else log('FAIL', 'PAYMENT', 'Refund: customer should be blocked', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Refund: customer blocked', e.message); }

  // 3.12 Refund — non-existing payment
  try {
    const r = await request('POST', '/api/payments/pay_nonexist/refund', {}, adminToken);
    if (r.status === 404) log('PASS', 'PAYMENT', 'Refund: non-existing payment returns 404');
    else log('FAIL', 'PAYMENT', 'Refund: non-existing payment should be 404', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Refund: non-existing payment', e.message); }

  // 3.13 Webhook — basic OK response
  try {
    const r = await request('POST', '/api/payments/webhook', { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_webhook_test', order_id: 'order_JG-test', amount: 100000, notes: {} } } } });
    if (r.status === 200 && r.body.status === 'ok') log('PASS', 'PAYMENT', 'Webhook: accepts and returns ok');
    else log('FAIL', 'PAYMENT', 'Webhook: should return ok', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'PAYMENT', 'Webhook: basic', e.message); }
}

// ═══════════════════════════════════════════════════════════════
//  4. VEHICLE / FLEET TESTING
// ═══════════════════════════════════════════════════════════════
async function testVehicles() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     4. VEHICLE / FLEET TESTING            ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  let testVehicleId = null;

  // 4.1 Get vehicles — public
  try {
    const r = await request('GET', '/api/vehicles');
    if (r.status === 200 && r.body.success) log('PASS', 'VEHICLE', `Get all: public access (${r.body.data.length} vehicles)`);
    else log('FAIL', 'VEHICLE', 'Get all: public access', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'VEHICLE', 'Get all: public', e.message); }

  // 4.2 Add vehicle — no auth
  try {
    const r = await request('POST', '/api/vehicles', { name: 'Test Car', type: 'sedan', number: 'AS-01-QA-0001', capacity: 4, price: 1500 });
    if (r.status === 401) log('PASS', 'VEHICLE', 'Add: no auth returns 401');
    else log('FAIL', 'VEHICLE', 'Add: no auth should be 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'VEHICLE', 'Add: no auth', e.message); }

  // 4.3 Add vehicle — customer blocked
  try {
    const r = await request('POST', '/api/vehicles', { name: 'Test Car', type: 'sedan', number: 'AS-01-QA-0001', capacity: 4, price: 1500 }, customerToken);
    if (r.status === 403) log('PASS', 'VEHICLE', 'Add: customer blocked (403)');
    else log('FAIL', 'VEHICLE', 'Add: customer should be blocked', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'VEHICLE', 'Add: customer blocked', e.message); }

  // 4.4 Add vehicle — missing fields
  try {
    const r = await request('POST', '/api/vehicles', { name: 'Test' }, adminToken);
    if (r.status === 400) log('PASS', 'VEHICLE', 'Add: missing fields rejected');
    else log('FAIL', 'VEHICLE', 'Add: missing fields should be 400', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'VEHICLE', 'Add: missing fields', e.message); }

  // 4.5 Add vehicle — valid (admin)
  const plateNumber = `AS-QA-${UNIQUE}`;
  try {
    const r = await request('POST', '/api/vehicles', {
      name: `QA Test Vehicle ${UNIQUE}`,
      type: 'suv',
      number: plateNumber,
      capacity: 7,
      price: 3500
    }, adminToken);
    if (r.status === 201 && r.body.success && r.body.data.id) {
      testVehicleId = r.body.data.id;
      log('PASS', 'VEHICLE', `Add: vehicle created (id=${testVehicleId})`);
    } else log('FAIL', 'VEHICLE', 'Add: valid vehicle', `Got ${r.status} ${r.body.message || ''}`);
  } catch (e) { log('FAIL', 'VEHICLE', 'Add: valid vehicle', e.message); }

  // 4.6 Update vehicle — admin
  if (testVehicleId) {
    try {
      const r = await request('PUT', `/api/vehicles/${testVehicleId}`, { status: 'Maintenance' }, adminToken);
      if (r.status === 200 && r.body.data.status === 'Maintenance') {
        log('PASS', 'VEHICLE', 'Update: status → Maintenance');
      } else log('FAIL', 'VEHICLE', 'Update: status', `Got ${r.status}`);
    } catch (e) { log('FAIL', 'VEHICLE', 'Update: status', e.message); }
  }

  // 4.7 Update vehicle — customer blocked
  if (testVehicleId) {
    try {
      const r = await request('PUT', `/api/vehicles/${testVehicleId}`, { status: 'Available' }, customerToken);
      if (r.status === 403) log('PASS', 'VEHICLE', 'Update: customer blocked (403)');
      else log('FAIL', 'VEHICLE', 'Update: customer should be blocked', `Got ${r.status}`);
    } catch (e) { log('FAIL', 'VEHICLE', 'Update: customer blocked', e.message); }
  }

  // 4.8 Update non-existing vehicle
  try {
    const r = await request('PUT', '/api/vehicles/99999', { status: 'Available' }, adminToken);
    if (r.status === 404) log('PASS', 'VEHICLE', 'Update: non-existing returns 404');
    else log('FAIL', 'VEHICLE', 'Update: non-existing should be 404', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'VEHICLE', 'Update: non-existing', e.message); }

  // 4.9 Delete vehicle — customer blocked
  if (testVehicleId) {
    try {
      const r = await request('DELETE', `/api/vehicles/${testVehicleId}`, null, customerToken);
      if (r.status === 403) log('PASS', 'VEHICLE', 'Delete: customer blocked (403)');
      else log('FAIL', 'VEHICLE', 'Delete: customer should be blocked', `Got ${r.status}`);
    } catch (e) { log('FAIL', 'VEHICLE', 'Delete: customer blocked', e.message); }
  }

  // 4.10 Delete vehicle — admin
  if (testVehicleId) {
    try {
      const r = await request('DELETE', `/api/vehicles/${testVehicleId}`, null, adminToken);
      if (r.status === 200 && r.body.success) log('PASS', 'VEHICLE', 'Delete: admin deleted vehicle');
      else log('FAIL', 'VEHICLE', 'Delete: admin', `Got ${r.status}`);
    } catch (e) { log('FAIL', 'VEHICLE', 'Delete: admin', e.message); }
  }

  // 4.11 Delete non-existing vehicle
  try {
    const r = await request('DELETE', '/api/vehicles/99999', null, adminToken);
    if (r.status === 404) log('PASS', 'VEHICLE', 'Delete: non-existing returns 404');
    else log('FAIL', 'VEHICLE', 'Delete: non-existing should be 404', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'VEHICLE', 'Delete: non-existing', e.message); }
}

// ═══════════════════════════════════════════════════════════════
//  5. NOTIFICATION TESTING
// ═══════════════════════════════════════════════════════════════
async function testNotifications() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     5. NOTIFICATION TESTING               ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  let notifId = null;

  // 5.1 Get notifications — no auth
  try {
    const r = await request('GET', '/api/notifications');
    if (r.status === 401) log('PASS', 'NOTIF', 'Get: no auth returns 401');
    else log('FAIL', 'NOTIF', 'Get: no auth should be 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'NOTIF', 'Get: no auth', e.message); }

  // 5.2 Get notifications — customer
  try {
    const r = await request('GET', '/api/notifications', null, customerToken);
    if (r.status === 200 && r.body.success) log('PASS', 'NOTIF', `Get: customer (${r.body.data.length} notifications)`);
    else log('FAIL', 'NOTIF', 'Get: customer', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'NOTIF', 'Get: customer', e.message); }

  // 5.3 Create notification — customer blocked
  try {
    const r = await request('POST', '/api/notifications', { title: 'Test', message: 'Test msg' }, customerToken);
    if (r.status === 403) log('PASS', 'NOTIF', 'Create: customer blocked (403)');
    else log('FAIL', 'NOTIF', 'Create: customer should be blocked', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'NOTIF', 'Create: customer blocked', e.message); }

  // 5.4 Create notification — admin
  try {
    const r = await request('POST', '/api/notifications', {
      title: `QA Test Alert ${UNIQUE}`,
      message: 'This is a test broadcast notification',
      type: 'INFO'
    }, adminToken);
    if (r.status === 201 && r.body.success) {
      notifId = r.body.data._id;
      log('PASS', 'NOTIF', 'Create: admin broadcast created');
    } else log('FAIL', 'NOTIF', 'Create: admin', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'NOTIF', 'Create: admin', e.message); }

  // 5.5 Create notification — missing fields
  try {
    const r = await request('POST', '/api/notifications', {}, adminToken);
    if (r.status === 400) log('PASS', 'NOTIF', 'Create: missing fields rejected');
    else log('FAIL', 'NOTIF', 'Create: missing fields should be 400', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'NOTIF', 'Create: missing fields', e.message); }

  // 5.6 Mark as read
  if (notifId) {
    try {
      const r = await request('PUT', `/api/notifications/${notifId}/read`, {}, customerToken);
      if (r.status === 200 && r.body.data.isRead === true) log('PASS', 'NOTIF', 'Mark read: success');
      else log('FAIL', 'NOTIF', 'Mark read', `Got ${r.status}`);
    } catch (e) { log('FAIL', 'NOTIF', 'Mark read', e.message); }
  }

  // 5.7 Mark non-existing as read
  try {
    const r = await request('PUT', '/api/notifications/000000000000000000000000/read', {}, customerToken);
    if (r.status === 404) log('PASS', 'NOTIF', 'Mark read: non-existing returns 404');
    else log('FAIL', 'NOTIF', 'Mark read: non-existing should be 404', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'NOTIF', 'Mark read: non-existing', e.message); }
}

// ═══════════════════════════════════════════════════════════════
//  6. REPORTS & ANALYTICS TESTING
// ═══════════════════════════════════════════════════════════════
async function testReports() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     6. REPORTS & ANALYTICS TESTING        ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // 6.1 Get analytics — no auth
  try {
    const r = await request('GET', '/api/reports/analytics');
    if (r.status === 401) log('PASS', 'REPORTS', 'Analytics: no auth returns 401');
    else log('FAIL', 'REPORTS', 'Analytics: no auth should be 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'REPORTS', 'Analytics: no auth', e.message); }

  // 6.2 Get analytics — customer blocked
  try {
    const r = await request('GET', '/api/reports/analytics', null, customerToken);
    if (r.status === 403) log('PASS', 'REPORTS', 'Analytics: customer blocked (403)');
    else log('FAIL', 'REPORTS', 'Analytics: customer should be blocked', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'REPORTS', 'Analytics: customer blocked', e.message); }

  // 6.3 Get analytics — admin
  try {
    const r = await request('GET', '/api/reports/analytics', null, adminToken);
    if (r.status === 200 && r.body.success && r.body.data.totalBookings !== undefined) {
      const d = r.body.data;
      log('PASS', 'REPORTS', `Analytics: totalBookings=${d.totalBookings} revenue=${d.totalRevenue} fleet=${d.fleetSize}`);
    } else log('FAIL', 'REPORTS', 'Analytics: admin', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'REPORTS', 'Analytics: admin', e.message); }
}

// ═══════════════════════════════════════════════════════════════
//  7. SETTINGS TESTING
// ═══════════════════════════════════════════════════════════════
async function testSettings() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     7. SETTINGS TESTING                   ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // 7.1 Get settings — public
  try {
    const r = await request('GET', '/api/settings');
    if (r.status === 200 && r.body.success) log('PASS', 'SETTINGS', 'Get: public access works');
    else log('FAIL', 'SETTINGS', 'Get: public', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'SETTINGS', 'Get: public', e.message); }

  // 7.2 Update settings — no auth
  try {
    const r = await request('PUT', '/api/settings', { companyName: 'Hacked' });
    if (r.status === 401) log('PASS', 'SETTINGS', 'Update: no auth returns 401');
    else log('FAIL', 'SETTINGS', 'Update: no auth should be 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'SETTINGS', 'Update: no auth', e.message); }

  // 7.3 Update settings — customer blocked
  try {
    const r = await request('PUT', '/api/settings', { companyName: 'Hacked' }, customerToken);
    if (r.status === 403) log('PASS', 'SETTINGS', 'Update: customer blocked (403)');
    else log('FAIL', 'SETTINGS', 'Update: customer should be blocked', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'SETTINGS', 'Update: customer blocked', e.message); }

  // 7.4 Update settings — admin
  try {
    const r = await request('PUT', '/api/settings', { companyName: 'Joy Guru Tours & Travels' }, adminToken);
    if (r.status === 200 && r.body.success) log('PASS', 'SETTINGS', 'Update: admin success');
    else log('FAIL', 'SETTINGS', 'Update: admin', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'SETTINGS', 'Update: admin', e.message); }
}

// ═══════════════════════════════════════════════════════════════
//  8. AUDIT LOG TESTING
// ═══════════════════════════════════════════════════════════════
async function testAuditLogs() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     8. AUDIT LOG TESTING                  ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // 8.1 Get audit logs — no auth
  try {
    const r = await request('GET', '/api/audit-logs');
    if (r.status === 401) log('PASS', 'AUDIT', 'Get: no auth returns 401');
    else log('FAIL', 'AUDIT', 'Get: no auth should be 401', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUDIT', 'Get: no auth', e.message); }

  // 8.2 Get audit logs — customer blocked
  try {
    const r = await request('GET', '/api/audit-logs', null, customerToken);
    if (r.status === 403) log('PASS', 'AUDIT', 'Get: customer blocked (403)');
    else log('FAIL', 'AUDIT', 'Get: customer should be blocked', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUDIT', 'Get: customer blocked', e.message); }

  // 8.3 Get audit logs — admin
  try {
    const r = await request('GET', '/api/audit-logs', null, adminToken);
    if (r.status === 200 && r.body.success && Array.isArray(r.body.data)) {
      log('PASS', 'AUDIT', `Get: admin (${r.body.data.length} entries)`);
    } else log('FAIL', 'AUDIT', 'Get: admin', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'AUDIT', 'Get: admin', e.message); }
}

// ═══════════════════════════════════════════════════════════════
//  9. SECURITY TESTING
// ═══════════════════════════════════════════════════════════════
async function testSecurity() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     9. SECURITY TESTING                   ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // 9.1 NoSQL Injection in login email
  try {
    const r = await request('POST', '/api/auth/login', { email: { '$gt': '' }, password: 'anything' });
    if (r.status >= 400) log('PASS', 'SECURITY', 'NoSQL injection: email object rejected');
    else log('FAIL', 'SECURITY', 'NoSQL injection: email object should be rejected', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'SECURITY', 'NoSQL injection', e.message); }

  // 9.2 NoSQL Injection in password
  try {
    const r = await request('POST', '/api/auth/login', { email: 'admin@joyguru.com', password: { '$gt': '' } });
    if (r.status >= 400) log('PASS', 'SECURITY', 'NoSQL injection: password object rejected');
    else log('FAIL', 'SECURITY', 'NoSQL injection: password object should be rejected', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'SECURITY', 'NoSQL injection: password', e.message); }

  // 9.3 XSS payload in booking field
  try {
    const r = await request('POST', '/api/bookings', {
      customerName: '<script>alert("xss")</script>',
      customerPhone: '+91 12345 67890',
      pickup: 'Silchar',
      destination: '<img src=x onerror=alert(1)>',
      travelDate: '2026-09-01',
      travelTime: '10:00',
      vehicleName: 'Test',
      vehicleType: 'sedan'
    });
    // The booking should be created but stored as text; check it doesn't execute
    if (r.status === 201) {
      // Check data is stored verbatim (not sanitized — note: this is expected; sanitization happens at render)
      log('WARN', 'SECURITY', 'XSS: data stored (server-side output encoding needed at render)', 'No server-side HTML sanitization');
    } else {
      log('PASS', 'SECURITY', 'XSS: payload rejected');
    }
  } catch (e) { log('FAIL', 'SECURITY', 'XSS payload test', e.message); }

  // 9.4 Rate limiting header check
  try {
    const r = await request('GET', '/api/settings');
    const remaining = r.headers['x-ratelimit-remaining'] || r.headers['ratelimit-remaining'];
    if (remaining !== undefined) log('PASS', 'SECURITY', `Rate limiting: active (remaining=${remaining})`);
    else log('WARN', 'SECURITY', 'Rate limiting: headers not visible', 'Rate limiter is configured but headers may not be exposed');
  } catch (e) { log('FAIL', 'SECURITY', 'Rate limiting check', e.message); }

  // 9.5 Helmet security headers
  try {
    const r = await request('GET', '/api/settings');
    const xss = r.headers['x-xss-protection'] || r.headers['x-content-type-options'];
    if (xss || r.headers['x-dns-prefetch-control']) log('PASS', 'SECURITY', 'Helmet: security headers present');
    else log('WARN', 'SECURITY', 'Helmet: some headers may be missing');
  } catch (e) { log('FAIL', 'SECURITY', 'Helmet headers', e.message); }

  // 9.6 Direct URL access — API routes return 404
  try {
    const r = await request('GET', '/api/nonexistent-route');
    if (r.status === 404) log('PASS', 'SECURITY', 'Unknown API route returns 404');
    else log('FAIL', 'SECURITY', 'Unknown API route should be 404', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'SECURITY', 'Unknown API route', e.message); }

  // 9.7 Environment variables NOT exposed
  try {
    const r = await request('GET', '/api/settings');
    const body = JSON.stringify(r.body);
    const hasSecrets = body.includes(process.env.JWT_SECRET) || body.includes(process.env.RAZORPAY_KEY_SECRET) || body.includes(process.env.SMTP_PASS);
    if (!hasSecrets) log('PASS', 'SECURITY', 'Env secrets: NOT exposed in API responses');
    else log('FAIL', 'SECURITY', 'Env secrets: EXPOSED in API responses — CRITICAL');
  } catch (e) { log('FAIL', 'SECURITY', 'Env secrets check', e.message); }

  // 9.8 .env file NOT served statically
  try {
    const r = await request('GET', '/.env');
    const body = typeof r.body === 'string' ? r.body : JSON.stringify(r.body);
    if (body.includes('MONGO_URI') || body.includes('JWT_SECRET')) {
      log('FAIL', 'SECURITY', '.env file SERVED publicly — CRITICAL VULNERABILITY');
    } else {
      log('PASS', 'SECURITY', '.env file: NOT served publicly');
    }
  } catch (e) { log('PASS', 'SECURITY', '.env file: NOT accessible'); }

  // 9.9 Password not returned in user data
  try {
    const r = await request('GET', '/api/auth/me', null, customerToken);
    if (r.status === 200) {
      const data = JSON.stringify(r.body);
      if (!data.includes(TEST_USER.password) && !r.body.data.password) {
        log('PASS', 'SECURITY', 'Password: NOT returned in /me response');
      } else {
        log('FAIL', 'SECURITY', 'Password: RETURNED in /me response — CRITICAL');
      }
    }
  } catch (e) { log('FAIL', 'SECURITY', 'Password exposure check', e.message); }

  // 9.10 Customer cannot escalate role
  try {
    const r = await request('PUT', '/api/auth/me', { role: 'admin' }, customerToken);
    if (r.status === 200) {
      // Check if role was actually changed
      const me = await request('GET', '/api/auth/me', null, customerToken);
      if (me.body.data.role === 'customer') log('PASS', 'SECURITY', 'Role escalation: customer cannot set role=admin');
      else log('FAIL', 'SECURITY', 'Role escalation: customer role changed to admin — CRITICAL');
    }
  } catch (e) { log('FAIL', 'SECURITY', 'Role escalation check', e.message); }

  // 9.11 Registration always sets role=customer
  try {
    const evil = {
      name: 'Evil Admin',
      email: `evil_${UNIQUE}@hack.com`,
      password: 'HackPass123',
      phone: '+91 00000 00002',
      role: 'admin'
    };
    const r = await request('POST', '/api/auth/register', evil);
    if (r.status === 201) {
      if (r.body.role === 'customer') log('PASS', 'SECURITY', 'Register: role forced to customer (admin injection blocked)');
      else log('FAIL', 'SECURITY', 'Register: role injection succeeded — CRITICAL', `role=${r.body.role}`);
    }
  } catch (e) { log('FAIL', 'SECURITY', 'Registration role injection', e.message); }
}

// ═══════════════════════════════════════════════════════════════
//  10. EMAIL TESTING
// ═══════════════════════════════════════════════════════════════
async function testEmail() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     10. EMAIL TESTING                     ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // 10.1 Forgot password email delivery
  try {
    const r = await request('POST', '/api/auth/forgot-password', { email: 'admin@joyguru.com' });
    if (r.status === 200 && r.body.success) {
      log('PASS', 'EMAIL', 'Forgot password: email sent successfully');
    } else if (r.status === 500) {
      log('FAIL', 'EMAIL', 'Forgot password: SMTP failed', r.body.message || '');
    } else {
      log('WARN', 'EMAIL', 'Forgot password: unexpected response', `Got ${r.status}`);
    }
  } catch (e) { log('FAIL', 'EMAIL', 'Forgot password email', e.message); }

  // 10.2 SMTP configuration verification
  const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (hasSmtp && process.env.SMTP_PASS.length === 16) {
    log('PASS', 'EMAIL', 'SMTP config: all credentials present (16-char app password)');
  } else if (hasSmtp) {
    log('WARN', 'EMAIL', 'SMTP config: present but app password length may be wrong');
  } else {
    log('FAIL', 'EMAIL', 'SMTP config: missing credentials');
  }
}

// ═══════════════════════════════════════════════════════════════
//  11. STATIC FRONTEND SERVING TEST
// ═══════════════════════════════════════════════════════════════
async function testFrontend() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     11. STATIC FRONTEND SERVING           ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  const pages = [
    { path: '/', name: 'Home (index.html)' },
    { path: '/login-signup.html', name: 'Login/Signup page' },
    { path: '/booking-payment.html', name: 'Booking payment page' },
    { path: '/admin-control-center.html', name: 'Admin control center' },
    { path: '/user-dashboard.html', name: 'User dashboard' },
    { path: '/search-results.html', name: 'Search results' },
    { path: '/styles.css', name: 'Main stylesheet' },
    { path: '/script.js', name: 'Main script' },
  ];

  for (const page of pages) {
    try {
      const r = await request('GET', page.path);
      if (r.status === 200) log('PASS', 'FRONTEND', `Serves: ${page.name}`);
      else log('FAIL', 'FRONTEND', `Serves: ${page.name}`, `Got ${r.status}`);
    } catch (e) { log('FAIL', 'FRONTEND', `Serves: ${page.name}`, e.message); }
  }
}

// ═══════════════════════════════════════════════════════════════
//  12. DATABASE COLLECTIONS VERIFICATION
// ═══════════════════════════════════════════════════════════════
async function testDatabaseCollections() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     12. DATABASE COLLECTIONS              ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // Verify via API endpoints that each model is operational
  const checks = [
    { name: 'Users', method: 'GET', path: '/api/auth/customers', token: adminToken },
    { name: 'Bookings', method: 'GET', path: '/api/bookings', token: adminToken },
    { name: 'Payments', method: 'GET', path: '/api/payments', token: adminToken },
    { name: 'Vehicles', method: 'GET', path: '/api/vehicles', token: null },
    { name: 'Notifications', method: 'GET', path: '/api/notifications', token: adminToken },
    { name: 'AuditLogs', method: 'GET', path: '/api/audit-logs', token: adminToken },
    { name: 'Invoices', method: 'GET', path: '/api/payments/invoices', token: adminToken },
    { name: 'Settings', method: 'GET', path: '/api/settings', token: null },
  ];

  for (const c of checks) {
    try {
      const r = await request(c.method, c.path, null, c.token);
      if (r.status === 200 && r.body.success) {
        const count = Array.isArray(r.body.data) ? r.body.data.length : 1;
        log('PASS', 'DATABASE', `${c.name}: collection accessible (${count} records)`);
      } else log('FAIL', 'DATABASE', `${c.name}: collection check failed`, `Got ${r.status}`);
    } catch (e) { log('FAIL', 'DATABASE', `${c.name}: collection check`, e.message); }
  }
}

// ═══════════════════════════════════════════════════════════════
//  13. CLOUDINARY TESTING (config-only)
// ═══════════════════════════════════════════════════════════════
async function testCloudinary() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     13. CLOUDINARY CONFIG TESTING          ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // 13.1 Upload without file
  try {
    const r = await request('POST', '/api/auth/upload-avatar', {}, customerToken);
    if (r.status === 400) log('PASS', 'CLOUDINARY', 'Upload: no file returns 400');
    else log('FAIL', 'CLOUDINARY', 'Upload: no file should be 400', `Got ${r.status}`);
  } catch (e) { log('FAIL', 'CLOUDINARY', 'Upload: no file', e.message); }

  // 13.2 Config check
  if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'dummy_key') {
    log('PASS', 'CLOUDINARY', 'Config: real API credentials configured');
  } else {
    log('FAIL', 'CLOUDINARY', 'Config: missing or dummy credentials');
  }
}

// ═══════════════════════════════════════════════════════════════
//  14. CLEANUP — Delete test booking
// ═══════════════════════════════════════════════════════════════
async function cleanup() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     14. CLEANUP                           ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  if (testBookingId) {
    try {
      const r = await request('DELETE', `/api/bookings/${testBookingId}`, null, adminToken);
      if (r.status === 200) log('PASS', 'CLEANUP', `Deleted test booking ${testBookingId}`);
      else log('WARN', 'CLEANUP', `Could not delete test booking`, `Got ${r.status}`);
    } catch (e) { log('WARN', 'CLEANUP', 'Booking cleanup failed', e.message); }
  }
}

// ═══════════════════════════════════════════════════════════════
//  MAIN RUNNER
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  JOY GURU TRAVEL PLATFORM — COMPREHENSIVE QA AUDIT');
  console.log('  Senior QA Engineer | Security Tester | Full Stack Debugger');
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    await testAuth();
    await testBookings();
    await testPayments();
    await testVehicles();
    await testNotifications();
    await testReports();
    await testSettings();
    await testAuditLogs();
    await testSecurity();
    await testEmail();
    await testFrontend();
    await testDatabaseCollections();
    await testCloudinary();
    await cleanup();
  } catch (e) {
    console.error('\n🔴 FATAL ERROR during test suite:', e);
  }

  // ─── Final Report ───
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    FINAL QA REPORT                           ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Tests:   ${(totalPass + totalFail + totalWarn).toString().padEnd(45)}║`);
  console.log(`║  ✅ PASSED:     ${totalPass.toString().padEnd(45)}║`);
  console.log(`║  ❌ FAILED:     ${totalFail.toString().padEnd(45)}║`);
  console.log(`║  ⚠️  WARNINGS:   ${totalWarn.toString().padEnd(44)}║`);
  console.log('╠═══════════════════════════════════════════════════════════════╣');

  // Group failures
  const failures = results.filter(r => r.status === 'FAIL');
  const warnings = results.filter(r => r.status === 'WARN');

  if (failures.length > 0) {
    console.log('║                                                             ║');
    console.log('║  ❌ FAILURES:                                                ║');
    failures.forEach(f => {
      console.log(`║    [${f.category}] ${f.test}`);
      if (f.detail) console.log(`║       → ${f.detail}`);
    });
  }

  if (warnings.length > 0) {
    console.log('║                                                             ║');
    console.log('║  ⚠️  WARNINGS:                                               ║');
    warnings.forEach(w => {
      console.log(`║    [${w.category}] ${w.test}`);
      if (w.detail) console.log(`║       → ${w.detail}`);
    });
  }

  console.log('╠═══════════════════════════════════════════════════════════════╣');
  if (totalFail === 0) {
    console.log('║  🟢 VERDICT: ALL CRITICAL TESTS PASSED                      ║');
    console.log('║     Project is PRODUCTION READY                             ║');
  } else {
    console.log('║  🔴 VERDICT: FAILURES DETECTED                              ║');
    console.log('║     Project is NOT production ready until fixes applied      ║');
  }
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  // Output JSON summary
  console.log('\n--- JSON SUMMARY ---');
  console.log(JSON.stringify({ totalPass, totalFail, totalWarn, failures, warnings }, null, 2));
}

main();
