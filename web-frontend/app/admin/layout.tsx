'use client';

import { useState } from 'react';
import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto lg:ml-0">
          {/* Mobile header with menu button */}
          <div className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
          </div>
          
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}

