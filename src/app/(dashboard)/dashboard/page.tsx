import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  // Parallel data fetching
  const [resumes, savedJobs, portfolio] = await Promise.all([
    db.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        template: true,
        updatedAt: true,
        createdAt: true,
      },
    }),
    db.savedJob.count({ where: { userId } }),
    db.portfolio.findUnique({
      where: { userId },
      select: { views: true, slug: true },
    }),
  ]);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true, image: true, name: true, email: true },
  });

  return (
    <DashboardClient
      userName={session.user.name ?? 'there'}
      userImage={session.user.image ?? null}
      credits={user?.credits ?? session.user.credits ?? 0}
      resumes={resumes.map((r) => ({
        id: r.id,
        title: r.title,
        template: r.template,
        updatedAt: r.updatedAt.toISOString(),
      }))}
      resumeCount={resumes.length}
      savedJobCount={savedJobs}
      portfolioViews={portfolio?.views ?? 0}
      portfolioSlug={portfolio?.slug ?? null}
    />
  );
}
