import type { HTMLAttributes, ReactNode } from 'react';
import { demoProduction } from '@/lib/offline-demo';

type ChartPoint = { actual?: number | null; target?: number | null; forecast?: number | null };

export function LoadingState() {
  return <div className="space-y-5" data-testid="status-loading"><div className="h-8 w-52 animate-pulse rounded bg-[hsl(var(--muted))]" /><div className="grid gap-4 md:grid-cols-4"><div className="h-28 animate-pulse bg-[hsl(var(--muted))]" /><div className="h-28 animate-pulse bg-[hsl(var(--muted))]" /><div className="h-28 animate-pulse bg-[hsl(var(--muted))]" /><div className="h-28 animate-pulse bg-[hsl(var(--muted))]" /></div></div>;
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[hsl(var(--border))] pb-6 lg:flex-row lg:items-end"><div><p className="eyebrow mb-3">{eyebrow}</p><h1 className="font-display text-4xl leading-[.88] tracking-tight text-[hsl(var(--foreground))] md:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-[13px] leading-6 text-[hsl(var(--muted-foreground))]">{description}</p></div>{action}</div>;
}

export function Panel({ children, className = '', ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section className={`surface-panel ${className}`} {...props}>{children}</section>;
}

export function SectionHead({ label, title, aside }: { label: string; title: string; aside?: ReactNode }) {
  return <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4"><div><p className="eyebrow">{label}</p><h2 className="mt-1 text-[14px] font-bold tracking-tight">{title}</h2></div>{aside}</div>;
}

export function StatusPill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const cls = { neutral: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]', good: 'bg-[hsl(var(--chart-3)/.13)] text-[hsl(var(--chart-3))]', warn: 'bg-[hsl(var(--primary)/.16)] text-[hsl(37 72% 35%)]', bad: 'bg-[hsl(var(--accent)/.13)] text-[hsl(var(--accent))]' }[tone];
  return <span className={`inline-flex items-center gap-1.5 px-2 py-1 font-mono-ui text-[9px] uppercase tracking-[.08em] ${cls}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children}</span>;
}

export function Metric({ label, value, unit, detail, tone = 'neutral' }: { label: string; value: string; unit?: string; detail?: string; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  return <div className="group border-l-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-colors hover:border-[hsl(var(--primary))]"><p className="eyebrow">{label}</p><div className="mt-3 flex items-baseline gap-1"><span className={`font-display text-3xl tracking-tight ${tone === 'bad' ? 'text-[hsl(var(--accent))]' : tone === 'warn' ? 'text-[hsl(37 72% 35%)]' : 'text-[hsl(var(--foreground))]'}`}>{value}</span>{unit && <span className="font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">{unit}</span>}</div>{detail && <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">{detail}</p>}</div>;
}

export function MiniChart({ series = demoProduction, forecast = false }: { series?: ChartPoint[]; forecast?: boolean }) {
  const vals = series.flatMap((p) => [p.target ?? 0, forecast ? (p.forecast ?? p.actual ?? 0) : (p.actual ?? 0)]);
  const max = Math.max(...vals, 1);
  const line = (key: 'actual' | 'target' | 'forecast') => series.map((p, i) => `${(i / Math.max(series.length - 1, 1)) * 100},${92 - (((p[key] ?? 0) / max) * 72)}`).join(' ');
  return <div className="relative h-44 w-full overflow-hidden bg-[hsl(var(--muted)/.3)] p-3"><div className="absolute inset-0 ops-grid opacity-50" /><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="relative h-full w-full"><polyline points={line('target')} fill="none" stroke="hsl(var(--muted-foreground) / .35)" strokeDasharray="2 3" strokeWidth="1" vectorEffect="non-scaling-stroke" /><polyline points={line(forecast ? 'forecast' : 'actual')} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg><div className="absolute bottom-2 left-3 flex gap-4 font-mono-ui text-[9px] text-[hsl(var(--muted-foreground))]"><span className="flex items-center gap-1.5"><i className="h-1.5 w-4 bg-[hsl(var(--primary))]" />{forecast ? 'forecast' : 'actual'}</span><span className="flex items-center gap-1.5"><i className="h-px w-4 bg-[hsl(var(--muted-foreground)/.5)]" />target</span></div></div>;
}

export function DataTable({ headers, rows, empty = 'No records in this view.' }: { headers: string[]; rows: (string | ReactNode)[][]; empty?: string }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[11px]"><thead className="bg-[hsl(var(--muted)/.65)] font-mono-ui text-[9px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]"><tr>{headers.map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-[hsl(var(--border))]">{rows.length ? rows.map((row, i) => <tr key={i} className="transition-colors hover:bg-[hsl(var(--muted)/.35)]">{row.map((cell, j) => <td key={j} className="whitespace-nowrap px-4 py-3">{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="px-4 py-12 text-center text-[hsl(var(--muted-foreground))]">{empty}</td></tr>}</tbody></table></div>;
}

export function ActionButton({ children, onClick, variant = 'primary', testId = 'button-action', disabled = false, className = '' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'outline' | 'quiet'; testId?: string; disabled?: boolean; className?: string }) {
  const cls = variant === 'primary' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-95' : variant === 'outline' ? 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))] hover:text-[hsl(37 72% 35%)]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]';
  return <button onClick={onClick} disabled={disabled} data-testid={testId} className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-[11px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${cls} ${className}`}>{children}</button>;
}
