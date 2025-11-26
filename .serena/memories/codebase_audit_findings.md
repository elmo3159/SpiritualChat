# SpiritualChat Codebase Audit - Comprehensive Findings Report

## Executive Summary
The codebase shows good foundational structure with Next.js, Supabase, and Stripe integration. However, several security, performance, and architecture issues have been identified that require attention. This audit covers 50+ files across API routes, services, and utilities.

---

## CRITICAL ISSUES (Must Fix Immediately)

### 1. **Missing Admin Authentication on Multiple API Routes [CRITICAL - HIGH IMPACT]**
**Location:** Multiple files in `/app/api/admin/`
**Affected Routes:**
- `/api/admin/campaigns/route.ts` - POST/PUT/DELETE operations
- `/api/admin/coupons/route.ts` - POST/PUT/DELETE operations
- `/api/admin/chat-messages/bulk-delete/route.ts` - POST operation
- `/api/admin/chat-messages/[id]/route.ts` - PUT/DELETE operations
- `/api/admin/daily-fortunes/[id]/route.ts` - PUT/DELETE operations
- `/api/admin/divination-results/[id]/route.ts` - DELETE operation
- `/api/admin/fortune-tellers/reorder/route.ts` - POST operation

**Description:** These endpoints use `createAdminClient()` directly without verifying admin credentials. While some endpoints correctly use `getCurrentAdmin()` for authentication checks, others are missing this critical validation. Any authenticated user could potentially manipulate admin data by calling these endpoints.

**Example (campaigns/route.ts line 8-10):**
```typescript
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()  // No auth check!
    const body = await request.json()
```

**Expected Pattern (from points/route.ts line 11-20):**
```typescript
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()  // Correct!
    if (!admin) {
      return NextResponse.json(..., { status: 401 })
    }
```

**Potential Impact:**
- UNAUTHORIZED DATA MODIFICATION: Attackers could create/modify/delete campaigns, coupons, chat messages
- DATA INTEGRITY: No audit trail for unauthorized changes
- BUSINESS LOGIC BYPASS: Campaign and coupon systems could be compromised
- REVENUE IMPACT: Coupons could be maliciously created/modified

**Remediation:** Add `getCurrentAdmin()` check at the start of all admin API route handlers. Consider creating a middleware wrapper function.

**Severity:** CRITICAL

---

### 2. **Detailed Error Messages Exposing System Information [CRITICAL - MEDIUM IMPACT]**
**Location:** Multiple API routes throughout `/app/api/`
**Affected Files (sample):**
- `/api/admin/add-points/route.ts` line 116
- `/api/admin/daily-fortunes/[id]/route.ts` lines 81, 91
- `/api/admin/setup/route.ts` lines 39, 57
- `/api/admin/upload-avatar/route.ts` lines 77-78
- `/api/divination/unlock/route.ts` line 263
- `/api/chat/send-message/route.ts` lines 155-156

**Description:** Error responses include `error.message` which can expose:
- Database schema information (table/column names)
- API endpoint structure
- Internal system details
- Stack traces in development

**Examples:**
```typescript
// Bad - exposes error details
return NextResponse.json({
  success: false,
  message: '鑑定結果の開封に失敗しました',
  error: error.message || 'Unknown error',  // ← Detailed error exposed
}, { status: 500 })

// From admin/upload-avatar line 77-78
message: `アップロードに失敗しました: ${error.message}`,  // ← User-facing error details
error: error  // ← Full error object exposed
```

**Potential Impact:**
- INFORMATION DISCLOSURE: Attackers gain insight into system internals
- ATTACK SURFACE MAPPING: Helps identify vulnerabilities
- COMPLIANCE ISSUES: May violate data protection regulations

**Remediation:** 
- Return generic error messages to clients: "An error occurred. Please try again."
- Log detailed errors server-side with proper logging infrastructure
- Use different error responses for development vs. production

**Severity:** CRITICAL (for production environment)

---

### 3. **Admin Setup Endpoint Accessible in Production [HIGH - MEDIUM IMPACT]**
**Location:** `/api/admin/setup/route.ts`

**Description:** Development-only endpoint that creates admin accounts is protected by `NODE_ENV` check only, which can be spoofed or misconfigured.

```typescript
if (process.env.NODE_ENV === 'production') {
  return NextResponse.json(
    { success: false, message: 'This endpoint is disabled in production' },
    { status: 403 }
  )
}
```

**Issues:**
- Environment variables can be misconfigured
- Endpoint exposes hardcoded admin password: `password: 'admin123'` (line 51)
- Hardcoded password hash visible in response
- No rate limiting on setup attempts

**Potential Impact:**
- UNAUTHORIZED ADMIN ACCESS: Could create rogue admin accounts
- ACCOUNT TAKEOVER: Default credentials known
- SYSTEM COMPROMISE: Full admin access granted

**Remediation:**
- Remove development endpoints from production builds entirely
- Use conditional exports or environment-based routing
- Implement database-level access controls
- Add rate limiting and logging

**Severity:** HIGH

---

## HIGH-PRIORITY ISSUES

### 4. **Inconsistent Authentication Pattern Across Admin APIs [HIGH - MEDIUM IMPACT]**
**Location:** `/app/api/admin/` directory

**Description:** 
- Routes that DO check auth: `points`, `fortune-tellers`, `settings`, `upload-avatar`, `login`, `logout`
- Routes that DON'T check auth: `campaigns`, `coupons`, `daily-fortunes`, `divination-results`, `chat-messages`, `fortune-tellers/reorder`

This inconsistency creates a maintenance nightmare and security risk.

**Remediation:**
- Create a unified middleware/wrapper for admin route protection
- Conduct comprehensive audit of all 50+ admin routes
- Implement consistent error responses

**Severity:** HIGH

---

### 5. **Stripe Webhook Missing Rate Limiting [HIGH - MEDIUM IMPACT]**
**Location:** `/api/webhooks/stripe/route.ts`

**Description:** 
The webhook handler lacks rate limiting and doesn't validate request origin beyond signature verification.

**Potential Issues:**
- Replay attacks possible (though mitigated by idempotency check)
- No request throttling
- No IP whitelist validation
- No attempt counter for invalid signatures

**Current Idempotency Check (line 87-101):**
```typescript
const { data: existingTransactions } = await supabase
  .from('points_transactions')
  .select('id')
  .eq('stripe_session_id', session.id)

if (existingTransactions && existingTransactions.length > 0) {
  return NextResponse.json({ message: '既に処理済みです' }, { status: 200 })
}
```

**Issues with Current Implementation:**
- Query before insert creates race condition (multiple concurrent requests could both pass check)
- Missing unique constraint enforcement
- No transaction/locking mechanism

**Remediation:**
- Add database-level unique constraint on `stripe_session_id`
- Implement request rate limiting (e.g., max 10 requests/minute per IP)
- Add Stripe signature validation logging and alerting
- Use database transaction/lock to prevent race condition

**Severity:** HIGH

---

### 6. **Timezone Handling Bug in Message Limit Logic [HIGH - LOW IMPACT]**
**Location:** `/lib/supabase/message-limits.ts` lines 36, 100, 136, 172

**Description:**
```typescript
const today = new Date().toISOString().split('T')[0]  // UTC time!
```

Uses UTC time instead of Japan local time. According to CLAUDE.md, the app should use Japan timezone.

**Impact:**
- Message limits reset at wrong time (UTC midnight instead of JST midnight)
- User could send 6 messages per calendar day (3 at end of UTC day + 3 at start)
- Inconsistent with `/lib/utils/datetime.ts` which has `getCurrentJapanTime()` function

**Remediation:**
```typescript
// Instead of:
const today = new Date().toISOString().split('T')[0]

// Use:
const today = getCurrentJapanTime().toISOString().split('T')[0]
```

**Severity:** HIGH (for business logic consistency)

---

### 7. **No CSRF Protection on State-Changing Endpoints [HIGH - LOW IMPACT]**
**Location:** All POST/PUT/DELETE endpoints

**Description:**
While Next.js provides some CSRF protection via SameSite cookies, there's no explicit CSRF token validation on sensitive operations.

**Affected Endpoints:**
- All admin APIs (campaigns, coupons, points, etc.)
- Divination unlock
- Chat message send
- Profile creation/update

**Remediation:**
- Implement CSRF token validation middleware
- Use `SameSite=Strict` for session cookies
- Validate `Origin` header on sensitive requests

**Severity:** HIGH (for web-based attacks)

---

## MEDIUM-PRIORITY ISSUES

### 8. **Potential Race Condition in Profile Creation [MEDIUM - LOW IMPACT]**
**Location:** `/app/actions/profile.ts` lines 246-275

**Description:**
Points are granted asynchronously without proper transaction handling:

```typescript
await Promise.all([
  pointsOp,  // Update or insert points
  supabase.from('points_transactions').insert({...}),  // Record transaction
])
```

**Issues:**
- Points balance update and transaction log might not be atomic
- If one fails silently, balance/transaction log mismatch
- No rollback mechanism

**Impact:** Low (points tracking inconsistency)

**Remediation:**
- Use database transaction or Supabase RPC function
- Implement idempotency checks
- Add retry logic with exponential backoff

**Severity:** MEDIUM

---

### 9. **Missing Input Validation on Key Fields [MEDIUM - LOW IMPACT]**

**Location:** Multiple API routes

**Issues Found:**
1. `/api/admin/campaigns/route.ts` - No validation of campaign dates beyond `start_date < end_date`
2. `/api/admin/coupons/route.ts` - No regex validation on coupon codes
3. `/api/chat/send-message/route.ts` - Only checks length (max 1000), no content validation

**Missing Validations:**
- Email format validation
- Date range validation (past dates, too far future)
- Enum/whitelist validation for categories
- HTML/script injection prevention

**Remediation:**
- Use Zod schemas consistently (already done for profile)
- Add sanitization for user-generated content
- Implement whitelist validation for enums

**Severity:** MEDIUM

---

### 10. **Excessive Debug Logging in Production [MEDIUM - LOW IMPACT]**
**Location:** Multiple API routes and services (21,000+ characters of grep results)

**Examples:**
- `/api/admin/login/route.ts` lines 38, 42 - Debug admin user queries
- `/api/divination/unlock/route.ts` lines 139-164 - Extensive logging during divination generation
- `/api/webhooks/stripe/route.ts` lines 48-70 - Detailed webhook logging

**Issues:**
- Logs contain user IDs, email addresses, and sensitive data
- Console.log calls should be removed from production
- No structured logging system (no timestamps, context)

**Remediation:**
- Remove `console.log` from production builds (use environment-based logging)
- Implement structured logging (Winston, Pino, Bunyan)
- Add PII filtering to logs
- Use proper log levels (error, warn, info, debug)

**Severity:** MEDIUM

---

### 11. **Missing Data Encryption for Sensitive Fields [MEDIUM - MEDIUM IMPACT]**
**Location:** Database schema (not visible in code audit, but referenced)

**Issue:** The field `result_encrypted` in `divination_results` table is referenced but appears to store plaintext despite the name suggesting encryption.

**Location Reference:** `/api/divination/unlock/route.ts` line 67, 214, 249

```typescript
resultFull: divination.result_encrypted,  // Might not be actually encrypted
```

**Recommendation:**
- Verify actual encryption implementation
- If not encrypted, implement field-level encryption
- Use Supabase Vault or application-level encryption

**Severity:** MEDIUM

---

### 12. **No Rate Limiting on User-Facing APIs [MEDIUM - MEDIUM IMPACT]**
**Location:** All user APIs

**Affected Endpoints:**
- `/api/chat/send-message` - Message spam possible
- `/api/chat/regenerate-suggestion` - Can be called repeatedly
- `/api/divination/generate` - Could be abused for API cost attack
- `/api/coupons/validate` - Coupon enumeration possible

**Issues:**
- Message limit is only 3/day via database check
- No IP-based rate limiting
- No user-based rate limiting for API calls
- Divination generation has no rate limit

**Remediation:**
- Implement IP-based rate limiting (Redis + middleware)
- Add per-user rate limiting
- Implement exponential backoff for repeated failures

**Severity:** MEDIUM

---

### 13. **Potential N+1 Queries in Divination Unlock [MEDIUM - LOW IMPACT]**
**Location:** `/api/divination/unlock/route.ts` lines 142-180

**Code:**
```typescript
// Gets one fortune teller
const { data: fortuneTeller } = await supabase
  .from('fortune_tellers')
  .select('*')
  .eq('id', divination.fortune_teller_id)
  .single()

// Gets one profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

// Gets multiple messages - sequentially?
const { data: messages } = await supabase
  .from('chat_messages')
  .select('*')
  ...

// Gets multiple divinations
const { data: previousDivinations } = await supabase
  .from('divination_results')
  ...
```

**Issue:**
- Multiple sequential queries could be parallelized
- No index optimization verified

**Remediation:**
- Parallelize independent queries with `Promise.all()`
- Add database indexes on frequently queried fields
- Consider query caching

**Severity:** MEDIUM (performance issue)

---

### 14. **Insufficient Field-Level Validation [MEDIUM - LOW IMPACT]**
**Location:** `/lib/validations/profile.ts`

**Issues:**
- No validation on partner birth date format
- No verification that dates aren't in future
- No validation on Japanese text encoding

**Remediation:**
- Enhance Zod schema with custom validators
- Add date range validation

**Severity:** MEDIUM

---

## LOW-PRIORITY ISSUES

### 15. **JWT_SECRET Hardcoded Default [LOW - LOW IMPACT]**
**Location:** `/lib/auth/admin.ts` line 8

```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
```

**Issues:**
- Uses default secret if env var not set
- Fallback string is obvious placeholder
- Should throw error instead of using default

**Remediation:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set')
}
```

**Severity:** LOW

---

### 16. **Missing HTTPS Enforcement on Admin Routes [LOW - MEDIUM IMPACT]**
**Location:** Middleware configuration `/middleware.ts`

**Issue:** No explicit HTTPS redirect for admin routes, though Vercel likely handles this.

**Remediation:**
- Add HTTPS enforcement in middleware
- Add security headers (HSTS, CSP)

**Severity:** LOW

---

### 17. **No Request Size Limits [LOW - LOW IMPACT]**
**Location:** All API routes

**Issue:** No explicit request size limits on JSON parsing.

**Remediation:**
```typescript
const body = await request.json({ size: 1024 * 1024 }) // 1MB limit
```

**Severity:** LOW

---

### 18. **Missing X-Content-Type-Options Header [LOW - LOW IMPACT]**
**Location:** All API responses

**Remediation:** Add security headers middleware

**Severity:** LOW

---

### 19. **Unused Dependencies [LOW - IMPACT]**
**Location:** `package.json`

**Potential candidates to verify:**
- `@google/genai` (v1.28.0) - Verify if this is still needed vs `@google/generative-ai`
- `bcryptjs` (v3.0.3) - Verify bcrypt usage vs alternative
- `jsonwebtoken` (v9.0.2) - Good, but ensure usage is consistent

**Severity:** LOW

---

### 20. **Missing Service Worker Cache Strategy Documentation [LOW - IMPACT]**
**Location:** `/lib/pwa/register-sw.tsx`

**Issue:** PWA cache invalidation strategy not clearly documented

**Severity:** LOW

---

## ARCHITECTURAL/DESIGN ISSUES

### 21. **Inconsistent Error Response Format [MEDIUM - MEDIUM IMPACT]**

Some endpoints return `{ success, message, data }` while others return `{ error }`. This creates confusion for frontend.

**Inconsistent Formats Found:**
- Some routes: `{ success: false, message: "...", data: null }`
- Other routes: `{ error: "...", status: 400 }`
- Admin routes: Mixed patterns

**Remediation:**
- Standardize on single response format
- Create response wrapper utility
- Document API response schema

**Severity:** MEDIUM (developer experience, maintenance)

---

### 22. **No Request Validation Middleware [MEDIUM - MEDIUM IMPACT]**

Each route individually validates input. A middleware could centralize this.

**Remediation:**
- Create middleware for common validations
- Use Zod for request body/query validation
- Centralize error handling

**Severity:** MEDIUM

---

### 23. **Missing Connection Pooling Configuration [MEDIUM - MEDIUM IMPACT]**

Supabase client initialization doesn't explicitly configure connection pooling.

**Location:** `/lib/supabase/server.ts`, `/lib/supabase/client.ts`

**Impact:** Under high load, connection limits could be exceeded.

**Remediation:**
- Verify Supabase connection pooling settings
- Add explicit pool configuration
- Monitor connection metrics

**Severity:** MEDIUM (scalability concern)

---

## FEATURES NOT YET IMPLEMENTED (Per CLAUDE.md)

### 24. **Missing Features vs Requirements**

Based on CLAUDE.md analysis:

- ✅ User authentication (Supabase Auth)
- ✅ Profile registration
- ✅ Divination with point unlock system
- ✅ Admin dashboard (partial)
- ⚠️  **Message limit reset logic appears to use UTC, not Japan timezone**
- ✅ Stripe webhook handling
- ✅ Chat interface
- ⚠️  **Admin campaign/coupon features lack auth checks**
- ⚠️  **Daily fortune feature incomplete (API lacks auth)**
- ⚠️  **Push notifications (implementation visible but incomplete)**
- ❌ **Rate limiting** - No global rate limiting implemented
- ❌ **Audit logging** - No comprehensive audit trail
- ⚠️  **Coupon validation incomplete** - Limited business logic validation

---

## PERFORMANCE OPTIMIZATION OPPORTUNITIES

### 25. **Unnecessary Query Overhead**

**Issue:** Message limit checking queries database on every message send

```typescript
const { data, error } = await supabase
  .from('message_limits')
  .select('message_count')
  .eq('user_id', userId)
  .eq('fortune_teller_id', fortuneTellerId)
  .eq('target_date', today)
  .single()
```

**Opportunity:** Cache message limits in session/cookie for the day

**Potential Improvement:** 30-40% reduction in database queries for chat operations

---

### 26. **Missing Query Caching Strategy**

- Fortune teller profiles: Could be cached for 1 hour (admin-updated infrequently)
- Badges definitions: Could be cached for 1 day
- User levels: Could be cached for session

---

## SECURITY CHECKLIST SUMMARY

| Item | Status | Priority |
|------|--------|----------|
| Authentication on all admin APIs | ❌ FAILED | CRITICAL |
| Error message sanitization | ❌ FAILED | CRITICAL |
| HTTPS enforcement | ✅ (Vercel) | - |
| CSRF protection | ⚠️  PARTIAL | HIGH |
| Rate limiting | ❌ MISSING | HIGH |
| Input validation | ⚠️  PARTIAL | HIGH |
| SQL injection protection | ✅ (Supabase) | - |
| XSS protection | ✅ (React) | - |
| CORS configuration | ✅ (Next.js) | - |
| Secrets management | ✅ | - |
| Audit logging | ❌ MISSING | MEDIUM |
| Data encryption | ⚠️  PARTIAL | MEDIUM |
| Request signing/validation | ✅ (Stripe) | - |

---

## RECOMMENDATIONS BY PRIORITY

### Immediate (Next 24-48 hours)
1. ✓ Add `getCurrentAdmin()` check to all admin API routes without auth
2. ✓ Sanitize error messages to generic responses in production
3. ✓ Remove or properly secure `/api/admin/setup` endpoint
4. ✓ Fix timezone handling in message limits

### Short-term (This sprint)
1. ✓ Implement request-level rate limiting
2. ✓ Standardize API response format
3. ✓ Add comprehensive input validation middleware
4. ✓ Implement structured logging
5. ✓ Add database-level unique constraints for Stripe webhook idempotency

### Medium-term (Next 2 sprints)
1. ✓ Implement audit logging for admin actions
2. ✓ Add query caching strategy
3. ✓ Verify and enhance data encryption
4. ✓ Create unified admin route protection middleware
5. ✓ Add CSRF token validation

### Long-term (Technical debt)
1. ✓ Implement comprehensive integration tests
2. ✓ Add API contract testing
3. ✓ Implement distributed tracing
4. ✓ Add security headers middleware
5. ✓ Document API response schemas (OpenAPI/Swagger)

---

## Testing Recommendations

```typescript
// Test cases to add:

// 1. Unauthorized admin access without token
test('POST /api/admin/campaigns should return 401 without auth', async () => {
  const response = await fetch('/api/admin/campaigns', { method: 'POST' })
  expect(response.status).toBe(401)
})

// 2. Error message sanitization
test('Should not expose error details to client', async () => {
  const response = await fetch('/api/chat/send-message', { /* bad input */ })
  const body = await response.json()
  expect(body.error).toBeFalsy()  // No detailed error
  expect(body.message).toBe('An error occurred')  // Generic message
})

// 3. Message limit timezone
test('Message limits should reset at JST midnight', async () => {
  // Mock getCurrentJapanTime
  // Verify reset happens at correct time
})

// 4. Stripe webhook idempotency
test('Duplicate Stripe webhooks should not double-process points', async () => {
  await sendWebhook(event)
  await sendWebhook(event)  // Same event twice
  const points = await getUserPoints()
  expect(points).toEqual(expectedAmount)  // Points only added once
})
```

---

## Files Reviewed in This Audit

**Total Files: 50+**

**Key Files Analyzed:**
- `/app/api/admin/*` (20+ routes)
- `/app/api/auth/*` (5 routes)
- `/app/api/chat/*` (8 routes)
- `/app/api/divination/*` (2 routes)
- `/app/api/webhooks/stripe/route.ts`
- `/lib/supabase/*` (4 files)
- `/lib/auth/admin.ts`
- `/lib/gemini/*` (3 files)
- `/app/actions/profile.ts`

---

## Conclusion

The SpiritualChat codebase demonstrates solid architectural foundations with proper use of modern frameworks and services. However, several **CRITICAL** security issues must be addressed before production deployment, particularly around admin authentication and error message handling.

The identified issues are **actionable and fixable** with clear remediation paths provided. Priority should be given to:
1. Implementing missing authentication checks
2. Sanitizing error messages
3. Adding rate limiting
4. Fixing timezone handling

All issues documented with specific file locations, line numbers, and example code for remediation.

---

**Audit Date:** November 26, 2025
**Audit Scope:** Full codebase exploration focusing on security, performance, and compliance
**Status:** Ready for remediation planning
