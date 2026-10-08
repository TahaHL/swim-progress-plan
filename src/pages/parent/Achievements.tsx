import { Link, useNavigate } from 'react-router';
import { Award } from 'lucide-react';
import { NotificationItem } from '@/components/layout/NotificationCenter';
import { Medal } from '@/components/skills/AchievementCelebration';
import { Button, EmptyState, PageHeader, buttonClass } from '@/components/ui/primitives';
import { getSkill } from '@/data/skills';
import { formatLong } from '@/lib/dates';
import { plural } from '@/lib/format';
import { useApp, useParentScope } from '@/store/AppStore';

export default function Achievements() {
  const { child, plan, achievements, notifications, unreadCount, summary } = useParentScope();
  const { markNotificationsRead } = useApp();
  const navigate = useNavigate();
  const newestFirst = [...achievements].reverse().sort((a, b) => b.week - a.week);

  return (
    <>
      <PageHeader
        title="Achievements"
        subtitle={
          achievements.length > 0
            ? `${child.firstName} has mastered ${plural(summary.mastered, 'skill')} of the ${plan.skillIds.length} in the plan.`
            : `Skills ${child.firstName} masters during the programme are celebrated here.`
        }
      />

      {newestFirst.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No achievements yet"
          action={
            <Link to="/parent/skills" className={buttonClass('primary')}>
              See what {child.firstName} is working on
            </Link>
          }
        >
          An achievement is added each time {child.firstName} is assessed as having mastered a skill.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {newestFirst.map((achievement) => {
            const skill = getSkill(achievement.skillId);
            return (
              <li key={achievement.id} className="panel flex flex-col p-5 sm:p-6" data-testid="achievement-card">
                <div className="flex items-start gap-4">
                  <Medal />
                  <div className="min-w-0">
                    <h2 className="text-lg leading-snug font-semibold">{achievement.title}</h2>
                    <p className="mt-0.5 text-[0.95rem] text-ink-2">
                      {formatLong(achievement.date)}, week {achievement.week}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 leading-relaxed text-ink-2">{achievement.message}</p>
                <div className="mt-5">
                  <Link to={`/parent/skills/${achievement.skillId}`} className={buttonClass('secondary', 'sm')}>
                    View {skill ? skill.name.toLowerCase() : 'this skill'}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section aria-labelledby="notifications-title" className="mt-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="notifications-title" className="text-xl font-semibold">
            Notifications
          </h2>
          <Button variant="ghost" size="sm" disabled={unreadCount === 0} onClick={() => markNotificationsRead()}>
            Mark all as read
          </Button>
        </div>
        {notifications.length === 0 ? (
          <p className="text-ink-2">Achievements and instructor updates will be listed here after each session.</p>
        ) : (
          <ul className="panel divide-y divide-line p-1.5">
            {notifications.map((n) => (
              <li key={n.id}>
                <NotificationItem
                  notification={n}
                  onSelect={() => {
                    if (!n.read) markNotificationsRead([n.id]);
                    navigate(n.link);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm text-ink-3">
          In this demonstration, notifications appear inside the app only. No emails, texts or push notifications are
          sent.
        </p>
      </section>
    </>
  );
}
