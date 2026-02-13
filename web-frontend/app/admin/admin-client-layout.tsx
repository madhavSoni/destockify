'use client';

import { AdminGuard } from '@/components/admin/admin-guard';

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </AdminGuard>
  );
}
