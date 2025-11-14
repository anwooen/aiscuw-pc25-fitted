import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

/**
 * RequireAuth - Protected route wrapper
 *
 * Wraps components that require authentication.
 * Redirects to sign-in if user is not authenticated.
 *
 * Usage:
 * <RequireAuth>
 *   <ProtectedComponent />
 * </RequireAuth>
 *
 * @param {React.ReactNode} children - Components to render when authenticated
 */
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
