# Phase 14: Clerk Authentication Integration

**Status:** IN PROGRESS
**Started:** 2025-11-08
**Goal:** Add user authentication with Clerk to enable future cloud sync and multi-device access

---

## Overview

Adding Clerk authentication to the Fitted app to:
- Allow users to create accounts and sign in
- Prepare for cloud sync (Phase 15)
- Enable multi-device wardrobe access
- Preserve existing localStorage functionality (optional auth)

---

## Architecture Changes

### Before:
```
User → App → LocalStorage/IndexedDB (device-only)
```

### After:
```
User → Clerk Auth (optional) → App → LocalStorage/IndexedDB
                                    → (Future) Cloud API with user ID
```

---

## Task Checklist

### Phase 1: Setup & Installation
- [ ] **Task 1:** Create this documentation file (phase14-clerk-integration.md)
- [ ] **Task 2:** Install `@clerk/clerk-react@latest` SDK
- [ ] **Task 3:** Create Clerk account and get Publishable Key from dashboard
- [ ] **Task 4:** Add `VITE_CLERK_PUBLISHABLE_KEY=YOUR_KEY_HERE` to `.env.local`
- [ ] **Task 5:** Verify `.gitignore` excludes `.env*` files (security check)

### Phase 2: Core Integration
- [ ] **Task 6:** Wrap App in `<ClerkProvider>` in `src/main.tsx`
- [ ] **Task 7:** Create `src/components/auth/RequireAuth.tsx` wrapper (optional protected routes)
- [ ] **Task 8:** Add Clerk auth UI to Settings page:
  - Add `<SignedOut>` section with `<SignInButton>` and `<SignUpButton>`
  - Add `<SignedIn>` section with `<UserButton>` (includes sign out)
  - Add "Sign in to sync across devices" messaging

### Phase 3: State Management
- [ ] **Task 9:** Update `src/store/useStore.ts` to track Clerk user ID
- [ ] **Task 10:** Add helper to link wardrobe data to user ID (for future cloud sync)

### Phase 4: Testing & Documentation
- [ ] **Task 11:** Run `npm run lint` and fix TypeScript errors
- [ ] **Task 12:** Test authentication flow:
  - Sign up new account
  - Sign in existing account
  - Sign out
  - Verify localStorage persists without auth
- [ ] **Task 13:** Update `CLAUDE.md` to reference this phase file

---

## Security Notes

### CRITICAL - Key Management:
1. **NEVER commit `.env.local` to git**
2. **Use placeholder values** in code examples (e.g., `YOUR_PUBLISHABLE_KEY`)
3. **Verify `.gitignore` includes `.env*`** before any commits
4. **Publishable keys are safe for client-side** (different from secret keys)

### Environment Variable Naming:
- ✅ Correct: `VITE_CLERK_PUBLISHABLE_KEY` (Vite requires `VITE_` prefix)
- ❌ Wrong: `REACT_APP_CLERK_PUBLISHABLE_KEY` (outdated React pattern)
- ❌ Wrong: `CLERK_FRONTEND_API` (deprecated Clerk pattern)

---

## Implementation Details

### File Changes:

#### 1. `src/main.tsx`
**Change:** Wrap app in ClerkProvider
```typescript
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>
);
```

#### 2. `src/components/auth/RequireAuth.tsx` (NEW FILE)
**Purpose:** Optional wrapper for protected routes (future use)
```typescript
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
```

#### 3. `src/components/profile/ProfileSettings.tsx`
**Change:** Add Clerk auth UI section

Add to imports:
```typescript
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
```

Add auth section in JSX (before existing settings):
```typescript
{/* Clerk Authentication Section */}
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
  <SignedOut>
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-uw-purple/10 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
        <User className="w-5 h-5 text-uw-purple dark:text-purple-400" />
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Account
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Sign in to sync your wardrobe across devices and access from anywhere.
        </p>
        <div className="flex gap-3">
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-uw-purple hover:bg-uw-purple/90 text-white rounded-lg font-semibold transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-uw-purple dark:text-purple-400 border-2 border-uw-purple dark:border-purple-400 rounded-lg font-semibold transition-colors">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  </SignedOut>

  <SignedIn>
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0">
        <UserButton afterSignOutUrl="/" />
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Account
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your wardrobe is synced and accessible across all your devices.
        </p>
      </div>
    </div>
  </SignedIn>
</div>
```

#### 4. `src/store/useStore.ts`
**Change:** Add Clerk user ID tracking

Add to AppState interface:
```typescript
clerkUserId?: string | null;
setClerkUserId: (userId: string | null) => void;
```

Add to store implementation:
```typescript
clerkUserId: null,
setClerkUserId: (userId) => set({ clerkUserId: userId }),
```

---

## Clerk Components Reference

### Prebuilt Components (No custom UI needed):
- `<SignInButton>` - Triggers sign-in modal/page
- `<SignUpButton>` - Triggers sign-up modal/page
- `<UserButton>` - User avatar with dropdown (includes sign out)
- `<SignedIn>` - Renders children only when signed in
- `<SignedOut>` - Renders children only when signed out

### Modes:
- `mode="modal"` - Opens auth in a modal (recommended)
- `mode="redirect"` - Redirects to dedicated auth page

---

## Testing Checklist

### Manual Testing Steps:
1. [ ] Start dev server (`npm run dev`)
2. [ ] Navigate to Settings page
3. [ ] Verify "Sign In" and "Sign Up" buttons appear
4. [ ] Click "Sign Up" and create test account
5. [ ] Verify `<UserButton>` appears with avatar
6. [ ] Click avatar and verify "Sign Out" option exists
7. [ ] Sign out and verify buttons return
8. [ ] Add wardrobe item while signed out (test localStorage still works)
9. [ ] Sign in and verify wardrobe persists

---

## Future Enhancements (Phase 15)

Once auth is working:
- [ ] Create cloud sync API endpoints
- [ ] Sync wardrobe to database (PostgreSQL/MongoDB)
- [ ] Sync outfit history
- [ ] Sync user preferences
- [ ] Add conflict resolution (local vs cloud)
- [ ] Add "Last synced" indicator

---

## Notes

- **Clerk provides built-in UI** - No need to create custom auth forms
- **Sign out is in UserButton dropdown** - Clerk handles this automatically
- **Auth is optional** - Users can still use app without signing in
- **Publishable keys are safe** - Can be exposed in client-side code
- **Follow Vite naming** - Must use `VITE_` prefix for env vars

---

## Resources

- [Clerk React Quickstart](https://clerk.com/docs/quickstarts/react)
- [Clerk Dashboard](https://dashboard.clerk.com/)
- [Clerk Components Reference](https://clerk.com/docs/components/overview)

---

**Last Updated:** 2025-11-08
**Next Phase:** Phase 15 - Cloud Sync Implementation
