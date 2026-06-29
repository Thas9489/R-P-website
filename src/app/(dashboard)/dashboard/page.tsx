import { redirect } from 'next/navigation';
import { getUser } from '@/lib/session';
import { db } from '@/lib/db';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const [resumes, savedJobCount, portfolio] = await Promise.all([
    db.resume.findMany(user.id),
    db.savedJob.count(user.id),
    db.portfolio.findByUserId(user.id),
  ]);

  return (
    <DashboardClient
      userName={user.name ?? 'there'}
      userImage={user.image ?? null}
      credits={(user.credits as number) ?? 0}
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
