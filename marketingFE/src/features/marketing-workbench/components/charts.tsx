import type { Combo, Plan } from '../types';

function makePoints(values: number[], width: number, height: number, pad = 8) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = pad + index * ((width - pad * 2) / Math.max(values.length - 1, 1));
      const y = height - pad - ((value - min) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function CockpitChart({ combos, grain }: { combos: Combo[]; grain: string }) {
  const width = 980;
  const height = 350;
  const n = grain === '按天' ? 7 : 42;
  const spendBase = combos.reduce((sum, item) => sum + Number(String(item.spend).replace(/[^\d.]/g, '')), 0) || 680;
  const spend = Array.from({ length: n }, (_, index) => spendBase / 3 + Math.sin(index * 0.43) * 105 + index * 3);
  const leads = Array.from({ length: n }, (_, index) => 240 + Math.sin(index * 0.47) * 120 + index * 7);
  const cost = Array.from({ length: n }, (_, index) => 210 + Math.sin(index * 0.34) * 42 + (index > n * 0.72 ? 18 : 0));
  const xLabels = grain === '按天' ? ['06-17', '06-18', '06-19', '06-20', '06-21', '06-22', '06-23'] : ['00:00', '06:00', '12:00', '18:00', '00:00', '06:00', '12:00'];

  return (
    <svg className='cockpit-chart' viewBox={`0 0 ${width} ${height}`} aria-label='投放表现主图'>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1='60' x2='916' y1={38 + i * 44} y2={38 + i * 44} stroke='rgba(148,163,184,.12)' />
      ))}
      <text x='48' y='24' fill='#94A3B8' fontSize='13' fontWeight='800'>消耗 / 客资</text>
      <text x='970' y='24' textAnchor='end' fill='#94A3B8' fontSize='13' fontWeight='800'>客资成本(元)</text>
      <polyline points={makePoints(spend, width - 64, 250, 60)} fill='none' stroke='#2F7BFF' strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' />
      <polyline points={makePoints(leads, width - 64, 250, 60)} fill='none' stroke='#18D39E' strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' />
      <polyline points={makePoints(cost, width - 64, 250, 60)} fill='none' stroke='#8B5CF6' strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' />
      {xLabels.map((label, index) => (
        <text fill='#64748B' fontSize='12' key={label + index} textAnchor='middle' x={70 + index * 136} y='304'>
          {label}
        </text>
      ))}
    </svg>
  );
}

export function PlanPerformanceChart({ plan }: { plan: Plan }) {
  const values = plan.trend.length ? plan.trend : [0, 0, 0, 0, 0, 0, 0];
  const spend = values.map((value, index) => value * 18 + 90 + index * 12);
  const leads = values.map((value) => value * 13 + 80);
  const cost = values.map((value, index) => Math.max(80, 240 - value * 2 + Math.sin(index) * 22));

  return (
    <svg className='plan-chart' viewBox='0 0 820 260' aria-label={`${plan.name}计划表现`}>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1='52' x2='772' y1={34 + i * 42} y2={34 + i * 42} stroke='rgba(148,163,184,.12)' />
      ))}
      <text x='52' y='22' fill='#94A3B8' fontSize='12' fontWeight='800'>{plan.name} · 消耗/客资/成本</text>
      <polyline points={makePoints(spend, 780, 205, 52)} fill='none' stroke='#2F7BFF' strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' />
      <polyline points={makePoints(leads, 780, 205, 52)} fill='none' stroke='#18D39E' strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' />
      <polyline points={makePoints(cost, 780, 205, 52)} fill='none' stroke='#8B5CF6' strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' />
      {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map((label, index) => (
        <text fill='#64748B' fontSize='11' key={label} textAnchor='middle' x={52 + index * 120} y='240'>
          {label}
        </text>
      ))}
    </svg>
  );
}
