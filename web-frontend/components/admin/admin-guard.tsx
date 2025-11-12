'use client';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  // Admin guard disabled for local/dev — allow everyone to view admin UI.
  return <>{children}</>;
}
