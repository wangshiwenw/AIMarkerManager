import { CurrentDemoShell } from '@/features/marketing-workbench';

type PageProps = {
  searchParams: Promise<{
    step?: string;
  }>;
};

function parseStep(value?: string) {
  const step = Number(value ?? 0);
  if (!Number.isFinite(step)) return 0;
  return Math.min(Math.max(Math.trunc(step), 0), 3);
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  return <CurrentDemoShell initialStep={parseStep(params.step)} page='planCreate' />;
}
