import { CalendarDays, ClipboardCheck, LayoutDashboard, UserRound, Users } from 'lucide-react';
import { AppShell, type NavItem } from '@/components/layout/AppShell';
import { DEMO_INSTRUCTOR_ID } from '@/config/demo';
import { useApp } from '@/store/AppStore';
import { fullName } from '@/store/selectors';

const NAV: NavItem[] = [
  { to: '/instructor', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/instructor/swimmers', label: 'Swimmers', icon: Users },
  { to: '/instructor/assessments', label: 'Assessments', shortLabel: 'Assess', icon: ClipboardCheck },
  { to: '/instructor/sessions', label: 'Sessions', icon: CalendarDays },
  { to: '/instructor/profile', label: 'Profile', icon: UserRound },
];

export default function InstructorLayout() {
  const { data } = useApp();
  const instructor = data.instructors.find((i) => i.id === DEMO_INSTRUCTOR_ID);
  return (
    <AppShell
      variant="instructor"
      nav={NAV}
      navLabel="Instructor navigation"
      user={{ name: instructor ? fullName(instructor) : 'Instructor', detail: instructor?.qualification ?? '' }}
    />
  );
}
