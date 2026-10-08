import { Component, useEffect, type ReactNode } from 'react';
import { Link, Route, Routes } from 'react-router';
import { Compass, TriangleAlert } from 'lucide-react';
import { Button, EmptyState, PageSkeleton, buttonClass } from '@/components/ui/primitives';
import { ToastProvider } from '@/components/ui/Toast';
import { STORAGE_KEY } from '@/data/repository';
import { AppProvider, useApp } from '@/store/AppStore';
import type { Role } from '@/types';
import Login from '@/pages/Login';
import ParentLayout from '@/pages/parent/ParentLayout';
import ParentHome from '@/pages/parent/Home';
import ParentSkills from '@/pages/parent/Skills';
import ParentSkillDetail from '@/pages/parent/SkillDetail';
import ParentJourney from '@/pages/parent/Journey';
import ParentAchievements from '@/pages/parent/Achievements';
import ParentProfile from '@/pages/parent/Profile';
import InstructorLayout from '@/pages/instructor/InstructorLayout';
import InstructorOverview from '@/pages/instructor/Overview';
import InstructorSwimmers from '@/pages/instructor/Swimmers';
import InstructorSwimmerPlan from '@/pages/instructor/SwimmerPlan';
import InstructorAssessments from '@/pages/instructor/Assessments';
import InstructorSessions from '@/pages/instructor/Sessions';
import InstructorProfile from '@/pages/instructor/Profile';

function FullPageMessage({ title, children, action }: { title: string; children: ReactNode; action: ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="panel w-full max-w-md p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-ink-2">{children}</p>
        <div className="mt-6 flex justify-center">{action}</div>
      </div>
    </div>
  );
}

/** Last line of defence: if a screen fails to render, offer a way back instead of a blank page. */
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  private restore = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* Nothing stored, nothing to clear. */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <FullPageMessage title="This screen could not be displayed" action={<Button onClick={this.restore}>Reset demo data and reload</Button>}>
        The saved demo data may be out of date. Resetting restores the original fictional examples.
      </FullPageMessage>
    );
  }
}

/** The URL decides which demo view is showing; this keeps the stored role in step with it. */
function DemoRole({ role, children }: { role: Role; children: ReactNode }) {
  const { role: current, enterAs } = useApp();
  useEffect(() => {
    if (current !== role) enterAs(role);
  }, [current, role, enterAs]);
  return <>{children}</>;
}

function NotFound() {
  const { role } = useApp();
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="w-full max-w-md">
        <EmptyState
          icon={Compass}
          title="That page does not exist"
          action={
            <Link to={role ? `/${role}` : '/'} className={buttonClass('primary')}>
              {role ? 'Back to the dashboard' : 'Back to the start'}
            </Link>
          }
        >
          The link may be out of date, or the page may have moved.
        </EmptyState>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider
          loadingFallback={<PageSkeleton />}
          renderError={(message, retry) => (
            <FullPageMessage title="The demo could not start" action={<Button onClick={retry}>Try again</Button>}>
              {message} Check that this browser allows site storage, then try again.
            </FullPageMessage>
          )}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/parent"
              element={
                <DemoRole role="parent">
                  <ParentLayout />
                </DemoRole>
              }
            >
              <Route index element={<ParentHome />} />
              <Route path="skills" element={<ParentSkills />} />
              <Route path="skills/:skillId" element={<ParentSkillDetail />} />
              <Route path="journey" element={<ParentJourney />} />
              <Route path="achievements" element={<ParentAchievements />} />
              <Route path="profile" element={<ParentProfile />} />
            </Route>
            <Route
              path="/instructor"
              element={
                <DemoRole role="instructor">
                  <InstructorLayout />
                </DemoRole>
              }
            >
              <Route index element={<InstructorOverview />} />
              <Route path="swimmers" element={<InstructorSwimmers />} />
              <Route path="swimmers/:childId" element={<InstructorSwimmerPlan />} />
              <Route path="assessments" element={<InstructorAssessments />} />
              <Route path="sessions" element={<InstructorSessions />} />
              <Route path="profile" element={<InstructorProfile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
