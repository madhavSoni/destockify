'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/companies', label: 'Companies', icon: '🏢' },
    { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
    { href: '/admin/new-listings', label: 'New Listings', icon: '📝' },
  ];

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white lg:sticky lg:top-0">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
        <Link href="/admin" onClick={handleLinkClick} className="text-xl font-bold text-slate-900">
          Admin Panel
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Close menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 px-4 text-sm text-slate-600">
          <div className="font-medium text-slate-900">{user?.firstName} {user?.lastName}</div>
          <div className="text-xs text-slate-500">{user?.email}</div>
        </div>
        <button
          onClick={logout}
          className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Logout
        </button>
        <Link
          href="/"
          className="mt-2 block w-full rounded-lg bg-slate-100 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Back to Site
        </Link>
      </div>
    </div>
  );
}

