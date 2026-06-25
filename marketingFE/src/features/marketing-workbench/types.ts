import demoData from './data/demo-data.json';

export type DemoData = typeof demoData;
export type Tone = 'good' | 'warn' | 'bad' | 'blue' | 'gray' | 'purple' | 'cyan' | 'green';
export type Plan = DemoData['plans'][number];
export type Combo = DemoData['combinations'][number];
export type AuthStatus =
  | 'authorized'
  | 'expired'
  | 'error'
  | 'unbound'
  | 'authorizing'
  | 'confirm'
  | 'syncing'
  | 'authFailed'
  | 'syncFailed';

export type PublishCombo = {
  name: string;
  account: string;
  material: string;
  budget: string;
  reason: string;
  status: '待发布' | '审核中' | '审核通过' | '投流中';
};
