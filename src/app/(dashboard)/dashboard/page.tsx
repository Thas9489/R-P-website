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

  const [resumes, savedJobCount, portfolio, user] = await Promise.all([
    db.resume.findMany(userId),
    db.savedJob.count(userId),
    db.portfolio.findByUserId(userId),
    db.user.findById(userId),
  ]);

  return (
    <DashboardClient
      userName={session.user.name ?? 'there'}
      userImage={session.user.image ?? null}
      credits={(user?.credits as number) ?? session.user.credits ?? 0}
      resumes={resumes.slice(0, 10).map((r) => ({
        id: r.id,
        title: r.title,
        template: r.template,
        updatedAt: r.updatedAt,
      }))}
      resumeCount={resumes.length}
      savedJobCount={savedJobCount}
      portfolioViews={portfolio?.views ?? 0}
      portfolioSlug={portfolio?.slug ?? null}
    />
  );
}
