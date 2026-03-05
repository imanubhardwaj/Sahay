# Sahay - Platform Optimization & Refactoring Guide

> A comprehensive plan to optimize performance, improve code quality, and refactor the Sahay platform for scalability and maintainability.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Code Architecture Refactoring](#2-code-architecture-refactoring)
3. [Performance Optimization](#3-performance-optimization)
4. [API & Backend Optimization](#4-api--backend-optimization)
5. [Frontend Optimization](#5-frontend-optimization)
6. [Database Optimization](#6-database-optimization)
7. [Security Hardening](#7-security-hardening)
8. [Implementation Priority](#8-implementation-priority)

---

## 1. Executive Summary

### Current State
- **Codebase**: ~80% complete, functional but with technical debt
- **Architecture**: Monolithic Next.js app with embedded logic
- **Performance**: No caching, polling for updates, large bundle sizes
- **Maintainability**: Duplicated logic, 374+ console.logs, mixed concerns
- **Notifications**: ✅ FCM push notifications implemented (service worker, token registration, topic subscriptions)

### Target State
- Modular, testable architecture
- Sub-3s page loads, optimized bundles
- Cached API responses, WebSocket for real-time
- Clean separation of concerns, typed APIs

---

## 2. Code Architecture Refactoring

### 2.1 Extract Shared Components

| Component | Current Location | Target | Status |
|-----------|------------------|--------|--------|
| QuizView | `modules/[id]/quiz/[quizId]/page.tsx` (standalone) | `components/quiz/QuizView.tsx` | 🔄 Inline in direct quiz route; could extract for reuse |
| LessonContentRenderer | Already extracted | - | ✅ Done |
| ModuleProgressBar | `dashboard/modules/ModuleProgressBar.tsx` | - | ✅ Extracted |

### 2.2 Create Custom Hooks

```
src/hooks/
├── useModuleProgress.ts    # Module/lesson loading, progress state - 🔄 Partial (module-state API)
├── useQuizzes.ts          # ✅ useQuizzes(moduleId), useQuiz(id) - exists
├── useLessonContent.ts    # Lesson content parsing, completion - ❌ Not yet
├── useBookings.ts         # ✅ Exists
└── useCourseProgress.ts   # ✅ Uses api-client
```

### 2.3 API Layer Abstraction

**Current**: `src/lib/api-client.ts` provides authenticated fetch wrappers:
- `authenticatedFetch`, `authenticatedGet`, `authenticatedPost`, `authenticatedPut`, `authenticatedDelete`
- Used in dashboard, explore, useCourseProgress

**Target** (optional enhancement): Domain-specific API methods
```typescript
// Extend api-client with:
export const api = {
  getLesson: (moduleId, userId) => authenticatedGet('/api/get-lesson', { moduleId, userId }),
  getQuiz: (lessonId | quizId) => authenticatedGet('/api/get-quiz', { lessonId, quizId }),
  submitQuiz: (payload) => authenticatedPost('/api/submit-quiz', payload),
  saveProgress: (payload) => authenticatedPost('/api/save-progress', payload),
};
```

### 2.4 State Management

- **Current**: useState/useCallback in large page components
- **Target**: Consider Zustand or Jotai for:
  - Module/lesson state (shared across quiz route)
  - Notification state
  - Sidebar/collapsed state (already in localStorage)

---

## 3. Performance Optimization

### 3.1 Bundle Size

| Action | Impact | Effort |
|--------|--------|--------|
| Dynamic import Monaco Editor | -200KB initial | Low |
| Lazy load dashboard routes | Faster FCP | Low |
| Tree-shake MUI icons | -50KB | Low |
| Analyze with `@next/bundle-analyzer` | Identify targets | Low |

### 3.2 Image Optimization

- Use Next.js `Image` component everywhere
- Add `sizes` prop for responsive images
- Consider WebP/AVIF formats
- Lazy load below-fold images

### 3.3 Code Splitting

```typescript
// Lazy load heavy components
const CodeEditor = dynamic(() => import('@/components/ui/CodeEditor'), {
  ssr: false,
  loading: () => <CodeEditorSkeleton />,
});
```

---

## 4. API & Backend Optimization

### 4.1 Remove Technical Debt

| Item | Count | Action |
|------|-------|--------|
| console.log | 374 | Replace with proper logger (winston/pino), strip in prod |
| Quiz bypass | 1 | Remove, return 403 |
| Passing score 0% | 1 | Set to 70% |

### 4.2 Add Caching

```typescript
// Redis or in-memory cache for:
// - Module list (TTL: 5 min)
// - User profile (TTL: 1 min)
// - Static content (TTL: 1 hour)
```

### 4.3 Rate Limiting

- Add `@upstash/ratelimit` or similar
- Per-user limits: 100 req/min for API
- Stricter for auth: 5 magic links/hour

### 4.4 Pagination

- `GET /api/modules` - add ?page=1&limit=20
- `GET /api/community-questions` - paginate
- `GET /api/coding-problems` - paginate

---

## 5. Frontend Optimization

### 5.1 Replace Polling with WebSocket

**Current**: AuthContext polls user/points every 30s

**Target**: Socket.io for:
- Real-time points updates
- Notification badges
- Session reminders

### 5.2 Optimistic Updates

- Lesson completion: Show "Done" immediately, sync in background
- Quiz submission: Show loading, then results
- Booking: Optimistic UI for approval flow

### 5.3 Error Boundaries

- Add React Error Boundaries per route/section
- Fallback UI with retry
- Report to Sentry/LogRocket (optional)

### 5.4 Accessibility

- Audit with axe-core
- Keyboard navigation for quiz
- ARIA labels for interactive elements
- Focus management in modals

---

## 6. Database Optimization

### 6.1 Indexes

```javascript
// Add/verify indexes
ModuleProgress: { userId: 1, moduleId: 1 }  // unique
LessonProgress: { userId: 1, lessonId: 1 }
Quiz: { lessonId: 1 }, { moduleId: 1 }
Booking: { studentId: 1, status: 1 }, { professionalId: 1, status: 1 }
```

### 6.2 Query Optimization

- Use `.lean()` for read-only queries (already in some places)
- Project only needed fields: `select('name email')`
- Avoid N+1: use `populate()` with `select` or aggregation

### 6.3 Connection Pooling

- Verify MongoDB connection pool settings
- Consider connection per serverless function lifecycle

---

## 7. Security Hardening

### 7.1 Input Validation

- Add Zod/Joi schemas for all API inputs
- Sanitize user content (XSS)
- Validate ObjectIds before DB queries

### 7.2 Audit Checklist

- [ ] Remove quiz bypass
- [ ] Implement 70% passing score
- [ ] Add CSRF protection for state-changing requests
- [ ] Secure cookie flags (httpOnly, secure, sameSite)
- [ ] Environment variable validation at startup

---

## 8. Implementation Priority

### Phase 1: Quick Wins (1-2 weeks)
1. Remove quiz bypass, fix passing score
2. ✅ Add notify() for user-facing errors (AlertWrapper from @/packages/ui)
3. Strip console.log in production build
4. Lazy load CodeEditor
5. Add bundle analyzer

### Phase 2: Architecture (2-4 weeks)
1. Extract QuizView component (optional - direct quiz route works)
2. ✅ useQuizzes, useQuiz hooks exist
3. ✅ API client exists (authenticatedFetch wrappers)
4. Add rate limiting

### Phase 3: Performance (2-4 weeks)
1. Add Redis caching for modules
2. Implement pagination
3. Replace polling with WebSocket
4. Database index audit

### Phase 4: Scale (1-2 months)
1. CDN for static assets
2. Serverless function optimization
3. Database read replicas (if needed)
4. Monitoring & alerting

---

*Document created: February 2025*
*Last updated: March 2025*
