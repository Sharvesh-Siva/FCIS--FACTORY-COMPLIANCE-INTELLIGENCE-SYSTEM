import React from 'react';

export interface StatusBadgeProps {
  status: string;
  variant?: 'outline' | 'solid';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'solid', size = 'sm' }) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-300';

  const s = status.toLowerCase();

  if (s.includes('active') || s.includes('pass') || s.includes('valid') || s.includes('verified') || s.includes('ready') || s.includes('approved')) {
    colorStyles = variant === 'solid'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-600/20'
      : 'text-emerald-700 border-emerald-400 bg-transparent';
  } else if (s.includes('critical') || s.includes('fail') || s.includes('expired') || s.includes('rejected') || s.includes('out of service') || s.includes('non-compliant') || s.includes('quarantined')) {
    colorStyles = variant === 'solid'
      ? 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-600/20 font-medium'
      : 'text-rose-700 border-rose-400 bg-transparent font-medium';
  } else if (s.includes('high') || s.includes('action required') || s.includes('overdue')) {
    colorStyles = variant === 'solid'
      ? 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-600/20 font-medium'
      : 'text-amber-800 border-amber-400 bg-transparent font-medium';
  } else if (s.includes('medium') || s.includes('review') || s.includes('needs human') || s.includes('investigation') || s.includes('approaching')) {
    colorStyles = variant === 'solid'
      ? 'bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-600/20'
      : 'text-sky-700 border-sky-400 bg-transparent';
  } else if (s.includes('dismissed') || s.includes('not reviewed') || s.includes('pending')) {
    colorStyles = 'bg-slate-100 text-slate-700 border-slate-300';
  }

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-medium transition-colors ${sizeStyles} ${colorStyles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
};
