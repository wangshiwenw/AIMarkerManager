export const demoRoutes = {
  home: '/cockpit',
  acquisition: '/plans',
  auth: '/auth',
  materials: '/materials',
  leads: '/leads',
  distribution: '/distribution',
  companies: '/companies'
} as const;

export type DemoPage = keyof typeof demoRoutes;

export const pageTitles: Record<DemoPage, string> = {
  home: '操盘纵览',
  acquisition: '投放计划',
  auth: '授权管理',
  materials: '素材库',
  leads: '线索管理',
  distribution: '线索分发',
  companies: '装企承接'
};

export function pageFromPath(pathname: string): DemoPage {
  if (pathname.startsWith('/plans/planesDetail')) return 'acquisition';
  return (Object.keys(demoRoutes) as DemoPage[]).find((key) => demoRoutes[key] === pathname) ?? 'home';
}
