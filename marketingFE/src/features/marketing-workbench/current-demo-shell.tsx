import { LandingPage } from './components/landing-page';
import { WorkbenchApp } from './workbench-app';

export function CurrentDemoShell({
  page,
  initialStep
}: {
  page?: 'home' | 'cockpit' | 'plans' | 'planCreate' | 'auth' | 'materials' | 'leads' | 'distribution' | 'companies';
  initialStep?: number;
}) {
  if (!page || page === 'home') return <LandingPage />;
  return <WorkbenchApp initialStep={initialStep} page={page} />;
}
