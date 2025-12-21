# Sahay - Technical Debt & Hacks to Remove

> This document tracks all hacks, workarounds, and technical debt that need to be addressed before production deployment.

---

## 🔴 Critical - Must Fix Before Production

### 1. Quiz Bypass Hack (SECURITY RISK)

**Location:** `src/app/api/get-quiz/route.ts` (Lines 67-74)

**Current Code:**
```typescript
// TODO: Remove this bypass in production
if (!moduleProgress) {
  console.log(
    "No module progress found, creating temporary progress for testing"
  );
  // Create a temporary module progress for testing
}
```

**Problem:** Allows users to access quizzes without proper module progress validation. Users could potentially access quizzes they shouldn't have access to.

**Fix:**
```typescript
if (!moduleProgress) {
  return NextResponse.json(
    { 
      success: false, 
      error: "You must start the module before accessing this quiz" 
    },
    { status: 403 }
  );
}
```

**Priority:** 🔴 **CRITICAL**

---

### 2. Quiz Always Passes (BUSINESS LOGIC)

**Location:** `src/app/api/submit-quiz/route.ts` (Lines 223-224)

**Current Code:**
```typescript
const passingScore = 0; // REMOVED 70% requirement - any score passes
const isPassed = true; // Always pass - just completing the quiz is enough
```

**Problem:** Users always pass quizzes regardless of their score. This defeats the purpose of quizzes and allows progression without learning.

**Fix:**
```typescript
const passingScore = 70; // Require 70% to pass
const isPassed = scorePercentage >= passingScore;
```

**Priority:** 🔴 **CRITICAL**

---

### 3. Console Logs in Production (PERFORMANCE/SECURITY)

**Location:** 374 instances across 79 API files

**Problem:** 
- Performance overhead in production
- Potential information leakage
- Log files grow unnecessarily large
- Sensitive data might be logged

**Files Affected:**
```
src/app/api/coding-problems/submit/route.ts
src/app/api/mentor-availability/route.ts
src/app/api/coding-problems/route.ts
src/app/api/auth/callback/route.ts
src/app/api/submit-quiz/route.ts
... and 74 more files
```

**Fix Options:**

**Option A:** Remove all console.log (recommended for production)
```bash
# Find and remove
grep -r "console\." src/app/api --include="*.ts" -l
```

**Option B:** Use a proper logger with levels
```typescript
// src/lib/logger.ts
const logger = {
  debug: (...args) => process.env.NODE_ENV === 'development' && console.log(...args),
  info: (...args) => console.info(...args),
  error: (...args) => console.error(...args),
};
```

**Priority:** 🔴 **HIGH**

---

## 🟡 Medium Priority - Fix Soon

### 4. Hardcoded External Image URL

**Location:** `src/app/dashboard/page.tsx` (Line 16)

**Current Code:**
```typescript
const DEFAULT_MODULE_ICON =
  "https://imgs.search.brave.com/0amGyAiF3uFKKjlFLdALYRLoeTeTOygh1JCd-4MlrA8/...";
```

**Problem:** 
- External dependency for images
- URL could break anytime
- Not under our control
- Poor UX if it fails

**Fix:**
```typescript
// Store locally in public folder
const DEFAULT_MODULE_ICON = "/images/default-module-icon.png";
```

**Priority:** 🟡 **MEDIUM**

---

### 5. Sleep for Database Replication

**Location:** `src/app/api/save-progress/route.ts` (Line 252)

**Current Code:**
```typescript
// Wait a bit for replication
await new Promise((resolve) => setTimeout(resolve, 100));
```

**Problem:**
- Arbitrary wait time
- Doesn't guarantee replication
- Slows down all requests unnecessarily

**Fix:**
```typescript
// Use proper write concern instead
const savedProgress = await moduleProgress.save({
  writeConcern: { w: "majority", j: true }
});
// Remove the setTimeout entirely
```

**Priority:** 🟡 **MEDIUM**

---

### 6. Points Polling Instead of WebSocket

**Location:** `src/contexts/AuthContext.tsx` (Lines 169-205)

**Current Code:**
```typescript
usePolling(refreshWalletPoints, {
  enabled: !!user?._id && !isLoading,
  interval: 30000, // 30 seconds
});
```

**Problem:**
- Unnecessary API calls every 30 seconds
- Points updates are delayed up to 30 seconds
- Server load increases with user count

**Fix:** Use Socket.io for real-time updates (already set up)
```typescript
// Use existing Socket.io setup
socket.on('points-updated', (data) => {
  if (data.userId === user._id) {
    setUser(prev => ({ ...prev, points: data.points }));
  }
});
```

**Priority:** 🟡 **MEDIUM**

---

### 7. Fallback Module Loading

**Location:** `src/app/dashboard/page.tsx` (Lines 135-153)

**Current Code:**
```typescript
} catch (error) {
  console.error("Failed to fetch modules from API, using fallback:", error);
  // Fallback to local modules
  const localModules = getAllModulesForUserType(user.userType);
  allModules = localModules.map((m) => ({...}));
}
```

**Problem:**
- Duplicated module definitions
- Local modules may be out of sync with database
- Hides API errors from monitoring

**Fix:** Remove fallback, let error propagate, show proper error state

**Priority:** 🟡 **MEDIUM**

---

## 🟢 Low Priority - Nice to Have

### 8. No Rate Limiting

**Location:** All API routes

**Problem:**
- APIs vulnerable to abuse
- DDoS attacks possible
- Brute force attacks on auth

**Fix:** Implement rate limiting middleware
```typescript
// Using upstash/ratelimit or similar
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

**Priority:** 🟢 **LOW** (but important for production)

---

### 9. No Pagination

**Location:** Various list endpoints

**Problem:**
- Loading all records at once
- Poor performance with large datasets
- High memory usage

**Fix:** Add pagination to all list endpoints
```typescript
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '10');
const skip = (page - 1) * limit;

const items = await Model.find().skip(skip).limit(limit);
const total = await Model.countDocuments();

return { items, pagination: { page, limit, total, pages: Math.ceil(total/limit) } };
```

**Priority:** 🟢 **LOW**

---

### 10. No Caching

**Location:** All database queries

**Problem:**
- Every request hits MongoDB
- Slow response times
- High database load

**Fix:** Add Redis caching
```typescript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache modules for 5 minutes
const cacheKey = `modules:${userType}`;
let modules = await redis.get(cacheKey);
if (!modules) {
  modules = await Module.find({...});
  await redis.setex(cacheKey, 300, JSON.stringify(modules));
}
```

**Priority:** 🟢 **LOW**

---

### 11. Leaderboard Timeframe Filter Not Working

**Location:** `src/app/dashboard/leaderboard/page.tsx`

**Current Code:**
```typescript
const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all");
// ... but API doesn't actually filter by timeframe
```

**Problem:** UI shows timeframe options but filtering doesn't work

**Fix:** Implement proper date filtering in API
```typescript
// In leaderboard API
const startDate = timeframe === 'week' 
  ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  : timeframe === 'month'
  ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  : null;

if (startDate) {
  query.createdAt = { $gte: startDate };
}
```

**Priority:** 🟢 **LOW**

---

### 12. Missing Input Validation

**Location:** Various API endpoints

**Problem:** Some endpoints don't validate input properly

**Example Fix:**
```typescript
// Use zod for validation
import { z } from 'zod';

const bookingSchema = z.object({
  studentId: z.string().min(24),
  professionalId: z.string().min(24),
  scheduleId: z.string().min(24),
  sessionDate: z.string().datetime(),
  price: z.number().positive(),
});

// In API route
const result = bookingSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}
```

**Priority:** 🟢 **LOW**

---

## Summary Checklist

### Before Production Launch:
- [ ] Remove quiz bypass hack in `get-quiz/route.ts`
- [ ] Implement 70% passing score in `submit-quiz/route.ts`
- [ ] Remove all console.log from API routes (374 instances)
- [ ] Replace external default image URL with local asset
- [ ] Remove setTimeout hack in `save-progress/route.ts`

### After Launch (Priority Order):
- [ ] Implement proper rate limiting
- [ ] Add pagination to all list endpoints
- [ ] Set up Redis caching
- [ ] Fix leaderboard timeframe filtering
- [ ] Replace polling with WebSocket for real-time updates
- [ ] Add comprehensive input validation with Zod
- [ ] Remove fallback module loading

---

## Commands to Find Issues

```bash
# Find all console.log statements
grep -r "console\." src/app/api --include="*.ts" | wc -l

# Find all TODO comments
grep -r "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx"

# Find hardcoded URLs
grep -r "http[s]*://" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"

# Find setTimeout/setInterval (potential hacks)
grep -r "setTimeout\|setInterval" src/ --include="*.ts" --include="*.tsx"
```

---

*Last Updated: December 2024*


