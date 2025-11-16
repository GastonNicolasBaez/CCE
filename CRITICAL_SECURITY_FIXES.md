# Critical Security Fixes - Quick Reference

**🚨 URGENT - These 9 issues must be fixed before production deployment**

---

## 1. JWT Secret - Change Immediately

**File:** `BackendCCE/.env`

```bash
# Generate new secret
openssl rand -base64 64

# Replace in .env
JWT_SECRET=<paste-generated-secret-here>
```

**Why:** Current secret is weak and predictable. Attackers can forge tokens.

---

## 2. Move Tokens to httpOnly Cookies

**Backend:** `BackendCCE/src/controllers/authController.js`

```javascript
// Replace token response with cookie
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000
})

res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
})

res.json({ success: true, user: userData })
```

**Frontend:** `FrontendCCE/lib/auth.ts`

```typescript
// Remove all localStorage token operations
// Cookies automatically sent with requests
// Update API to send credentials:
fetch(url, {
  credentials: 'include',  // Include cookies
  headers: { 'Content-Type': 'application/json' }
})
```

**Why:** localStorage is vulnerable to XSS attacks.

---

## 3. Fix SQL Injection

**File:** `BackendCCE/src/controllers/sociosController.js`

```javascript
// Before using search input, sanitize:
const sanitizeSearchTerm = (term) => {
  return term.replace(/[%_\\]/g, '\\$&')
}

// In obtenerSocios:
const search = sanitizeSearchTerm(req.query.search || '')

where[Op.or] = [
  { nombre: { [Op.like]: `%${search}%` } },
  { apellido: { [Op.like]: `%${search}%` } }
]
```

**Also fix in:** `BackendCCE/src/routes/search.js`

**Why:** Unsanitized input allows SQL injection attacks.

---

## 4. Implement Webhook Signature Verification

**File:** `BackendCCE/src/services/mercadoPagoService.js`

```javascript
const crypto = require('crypto')

async function verifyWebhookSignature(req) {
  const signature = req.headers['x-signature']
  const requestId = req.headers['x-request-id']

  if (!signature || !requestId) {
    throw new Error('Missing webhook signature headers')
  }

  const hmac = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
  hmac.update(requestId + JSON.stringify(req.body))
  const expectedSignature = hmac.digest('hex')

  if (signature !== expectedSignature) {
    throw new Error('Invalid webhook signature')
  }
}

// Use in webhook handler
async procesarWebhook(req, res) {
  await verifyWebhookSignature(req)
  // ... rest of webhook processing
}
```

**Add to .env:**
```env
MP_WEBHOOK_SECRET=your-webhook-secret-from-mercadopago
```

**Why:** Without verification, attackers can forge payment confirmations.

---

## 5. Remove Hardcoded Credentials

**File:** `BackendCCE/src/utils/initDatabase.js`

```javascript
// Replace hardcoded passwords with environment variables
const adminPassword = process.env.ADMIN_PASSWORD
const staffPassword = process.env.STAFF_PASSWORD

if (!adminPassword || !staffPassword) {
  throw new Error('ADMIN_PASSWORD and STAFF_PASSWORD must be set')
}

const sampleUsuarios = [
  {
    nombre: 'Admin',
    apellido: 'Principal',
    email: process.env.ADMIN_EMAIL || 'admin@cce.com',
    password: adminPassword,  // From env
    rol: 'admin',
    activo: true
  }
]
```

**Or:** Remove test user creation entirely from production builds.

**Why:** Known credentials create backdoor access.

---

## 6. Fix CORS Configuration

**File:** `BackendCCE/src/server.js`

```javascript
// Replace CORS origin check:
origin: (origin, callback) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ].filter(Boolean)

  // Reject requests with no origin (server-to-server, curl, etc.)
  if (!origin) {
    return callback(new Error('Origin header required'), false)
  }

  if (allowedOrigins.includes(origin)) {
    callback(null, true)
  } else {
    callback(new Error('Not allowed by CORS'))
  }
}
```

**Why:** Current config allows requests without origin header.

---

## 7. Enable SSL Certificate Validation

**File:** `BackendCCE/src/config/database.js`

```javascript
// Production database SSL
ssl: process.env.NODE_ENV === 'production' ? {
  require: true,
  rejectUnauthorized: true,  // Changed from false
  ca: fs.readFileSync('/path/to/ca-certificate.crt').toString()
} : false
```

**File:** `BackendCCE/src/services/emailService.js`

```javascript
// Email TLS
tls: {
  rejectUnauthorized: true  // Changed from false
}
```

**Why:** Prevents man-in-the-middle attacks.

---

## 8. Implement CSRF Protection

**Install:**
```bash
cd BackendCCE
npm install csurf cookie-parser
```

**File:** `BackendCCE/src/server.js`

```javascript
const cookieParser = require('cookie-parser')
const csrf = require('csurf')

app.use(cookieParser())

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
})

// Apply to all routes except webhooks
app.use((req, res, next) => {
  if (req.path.startsWith('/api/webhooks')) {
    return next()
  }
  csrfProtection(req, res, next)
})

// Send CSRF token to frontend
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})
```

**Frontend:** `FrontendCCE/lib/api.ts`

```typescript
// Fetch CSRF token on app load
let csrfToken = ''

async function getCsrfToken() {
  const response = await fetch(`${API_BASE_URL}/api/csrf-token`, {
    credentials: 'include'
  })
  const data = await response.json()
  csrfToken = data.csrfToken
}

// Include in all mutations
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    ...options.headers
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  })
}
```

**Why:** Protects against Cross-Site Request Forgery attacks.

---

## 9. Implement Server-Side Authentication Middleware

**File:** `FrontendCCE/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = ['/login', '/registro']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('auth_token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify JWT server-side
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET
    )

    const { payload } = await jwtVerify(token.value, secret)

    // Add user info to headers for server components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId as string)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  } catch (error) {
    // Invalid token - redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
```

**Install:**
```bash
cd FrontendCCE
npm install jose
```

**Add to .env.local:**
```env
JWT_SECRET=<same-secret-as-backend>
```

**Why:** Client-side protection can be bypassed.

---

## Verification Checklist

After implementing all fixes:

- [ ] JWT_SECRET is cryptographically secure (64+ chars)
- [ ] Tokens stored in httpOnly cookies, not localStorage
- [ ] All search inputs sanitized against SQL injection
- [ ] MercadoPago webhooks verify signature
- [ ] Test credentials removed or use env variables
- [ ] CORS rejects requests without origin header
- [ ] SSL certificate validation enabled for DB and email
- [ ] CSRF tokens required for all mutations
- [ ] Server-side authentication middleware active

---

## Test Commands

```bash
# Test SQL injection (should be blocked)
curl "http://localhost:3001/api/socios?search=%'; DROP TABLE socios;--"

# Test CORS (should fail)
curl -X POST http://localhost:3001/api/socios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test"}'

# Test CSRF (should fail without token)
curl -X POST http://localhost:3001/api/socios \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=xxx" \
  -d '{"nombre":"Test"}'

# Test authentication (should redirect to login)
curl -I http://localhost:3000/dashboard
```

---

## Emergency Contacts

If you discover active exploitation:

1. **Immediately disable affected endpoints**
2. **Rotate JWT secret** (will log out all users)
3. **Check database for unauthorized changes**
4. **Review server logs for attack patterns**
5. **Notify all users of potential breach**

---

**Estimated time to implement all fixes:** 8-12 hours

**Priority:** 🔴 CRITICAL - Do not deploy to production without these fixes
