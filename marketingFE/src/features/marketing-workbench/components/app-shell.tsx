'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import demoData from '../data/demo-data.json';
import { demoRoutes, pageFromPath, pageTitles, type DemoPage } from '../data/routes';
import type { AuthStatus } from '../types';
import { Button, Tag } from './primitives';

type ToastContextValue = {
  notify: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside AppShell');
  return value;
}

export function AppShell({
  children,
  authStatus,
  onLogout
}: {
  children: ReactNode;
  authStatus: AuthStatus;
  onLogout?: () => void;
}) {
  const pathname = usePathname();
  const activePage = pageFromPath(pathname);
  const [toast, setToast] = useState('');

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  }, []);

  const authTone = authStatus === 'authorized' ? 'good' : ['expired', 'error', 'authFailed', 'syncFailed'].includes(authStatus) ? 'bad' : ['authorizing', 'confirm', 'syncing'].includes(authStatus) ? 'blue' : 'warn';
  const authLabel =
    authStatus === 'authorized'
      ? demoData.operator.giantStatus
      : authStatus === 'unbound'
        ? '巨量未授权'
        : authStatus === 'authorizing'
          ? '授权中'
          : authStatus === 'confirm'
            ? '待确认绑定'
            : authStatus === 'syncing'
              ? '同步中'
              : '授权异常';
  const readyAccounts = authStatus === 'authorized' ? demoData.giantAuth.accounts.filter((item) => item.deliveryStatus === '可投放').length : 0;

  const contextValue = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={contextValue}>
      <div className='app-shell'>
        <aside className='sidebar'>
          <Link className='brand' href='/home'>
            <div className='brand-logo'>
              <Image src='/current-demo/assets/zhuketong-logo.png' alt='筑客通' width={26} height={26} />
            </div>
            <div>
              <h1>{demoData.productName}</h1>
            </div>
          </Link>
          <nav className='nav'>
            {demoData.nav.map((item) => (
              <Link className={`nav-btn ${item.id === activePage ? 'active' : ''}`} href={demoRoutes[item.id as DemoPage]} key={item.id}>
                <span className='nav-icon'>{item.icon}</span>
                <span className='nav-label'>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className='main'>
          <header className='topbar'>
            <div>
              <h2>{pageTitles[activePage]}</h2>
            </div>
            <div className='top-status'>
              <Tag tone='good'>{demoData.operator.platform}</Tag>
              <Tag tone={authTone}>{authLabel}</Tag>
              <Tag tone={authStatus === 'authorized' ? 'good' : 'warn'}>可投账号 {readyAccounts}/{authStatus === 'authorized' ? demoData.giantAuth.accounts.length : 0}</Tag>
              <Tag tone='blue'>余额 {authStatus === 'authorized' ? demoData.giantAuth.balance : '-'}</Tag>
              <div className='user-menu'>
                <div className='avatar'>A</div>
                <div className='user-copy'>
                  <b>{demoData.operator.name}</b>
                  <span>{demoData.operator.role}</span>
                </div>
                <Button onClick={onLogout ?? (() => notify('已退出登录'))} variant='mini'>
                  退出登录
                </Button>
              </div>
            </div>
          </header>
          <section className='view'>{children}</section>
        </main>
      </div>
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </ToastContext.Provider>
  );
}
