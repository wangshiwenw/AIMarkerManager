import type { ReactNode } from 'react';
import type { Tone } from '../types';

export function Tag({ children, tone = 'blue' }: { children: ReactNode; tone?: Tone | string }) {
  return <span className={`tag ${tone}`}>{children}</span>;
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled,
  className = ''
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'mini' | 'dangerLite';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const base = variant === 'primary' ? 'btn' : variant === 'secondary' ? 'btn secondary' : variant === 'dangerLite' ? 'mini-btn danger-lite' : 'mini-btn';
  return (
    <button className={`${base} ${className}`} disabled={disabled} onClick={onClick} type='button'>
      {children}
    </button>
  );
}

export function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='asset-card'>
      <p className='weak text-xs'>{label}</p>
      <b>{value}</b>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  trend,
  tone = 'green',
  icon = '●',
  warn
}: {
  label: string;
  value: ReactNode;
  trend?: ReactNode;
  tone?: string;
  icon?: ReactNode;
  warn?: boolean;
}) {
  return (
    <div className={`metric metric-${tone}`}>
      <div className='metric-icon'>{icon}</div>
      <div>
        <label>{label}</label>
        <b>{value}</b>
        <span className={warn ? 'warn' : ''}>{trend}</span>
      </div>
    </div>
  );
}

export function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className='table-wrap'>
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Sparkline({ values, color = '#38BDF8' }: { values: number[]; color?: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = 4 + index * (112 / Math.max(values.length - 1, 1));
      const y = 30 - ((value - min) / span) * 26;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg className='sparkline' viewBox='0 0 120 34' aria-hidden='true'>
      <polyline points={points} fill='none' stroke={color} strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' />
      <polyline points={`${points} 116,34 4,34`} fill={color} opacity='.12' />
    </svg>
  );
}

export function toneColor(tone?: string) {
  if (tone === 'good') return '#18D39E';
  if (tone === 'bad') return '#EF4444';
  if (tone === 'warn') return '#F59E0B';
  return '#38BDF8';
}
