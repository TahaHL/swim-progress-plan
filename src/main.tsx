import { StrictMode, useEffect, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, MemoryRouter, useLocation } from 'react-router';
import { MotionConfig } from 'motion/react';
import App from './App';
import './index.css';

/**
 * Normally the app uses hash URLs, so it works from any static host or straight from a file.
 * When it is embedded in another page (a preview frame), the address bar is not ours to use, so
 * it keeps its location in memory and remembers the last page for the visit.
 */
const embedded = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const ROUTE_KEY = 'swim-progress-plan.route';

function initialRoute(): string {
  try {
    return window.sessionStorage.getItem(ROUTE_KEY) || '/';
  } catch {
    return '/';
  }
}

function RememberRoute() {
  const location = useLocation();
  useEffect(() => {
    try {
      window.sessionStorage.setItem(ROUTE_KEY, location.pathname + location.search);
    } catch {
      /* Storage is blocked; the route is simply not remembered. */
    }
  }, [location]);
  return null;
}

function Router({ children }: { children: ReactNode }) {
  if (!embedded) return <HashRouter>{children}</HashRouter>;
  return (
    <MemoryRouter initialEntries={[initialRoute()]}>
      <RememberRoute />
      {children}
    </MemoryRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <Router>
        <App />
      </Router>
    </MotionConfig>
  </StrictMode>,
);
