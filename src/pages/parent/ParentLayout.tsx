import { Award, House, ListChecks, Route as RouteIcon, UserRound } from 'lucide-react';
import { AppShell, type NavItem } from '@/components/layout/AppShell';
import { NotificationCenter } from '@/components/layout/NotificationCenter';
import { AchievementCelebration } from '@/components/skills/AchievementCelebration';
import { useParentScope } from '@/store/AppStore';
import { fullName } from '@/store/selectors';

const NAV: NavItem[] = [
  { to: '/parent', label: 'Home', icon: House, end: true },
  { to: '/parent/skills', label: 'My Skills', shortLabel: 'Skills', icon: ListChecks },
  { to: '/parent/journey', label: 'Progress Journey', shortLabel: 'Journey', icon: RouteIcon },
  { to: '/parent/achievements', label: 'Achievements', shortLabel: 'Achieved', icon: Award },
  { to: '/parent/profile', label: 'Profile', icon: UserRound },
];

export default function ParentLayout() {
  const { parent, child } = useParentScope();
  return (
    <>
      <AppShell
        variant="parent"
        nav={NAV}
        navLabel="Parent navigation"
        user={{ name: fullName(parent), detail: `Parent of ${child.firstName}` }}
        headerExtras={<NotificationCenter />}
      />
      <AchievementCelebration />
    </>
  );
}
