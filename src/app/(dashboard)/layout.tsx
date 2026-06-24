import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop Sidebar — sticky, full height */}
      <DashboardSidebar />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header bar */}
        <DashboardHeader user={session.user} />

        {/* Scrollable page area */}
        <main className="flex-1 overflow-y-auto">
          {/* Extra bottom padding on mobile so content isn't hidden behind tab bar */}
          <div className="px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
