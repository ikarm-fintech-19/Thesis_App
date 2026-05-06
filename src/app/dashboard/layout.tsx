
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden md:pb-0 pb-16">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="container mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </ProtectedRoute>
  );
}
