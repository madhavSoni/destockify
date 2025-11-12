import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-8">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}

