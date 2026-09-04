import { useState } from 'react';
import { AlertTriangle, Bell, Bot, Check, CheckCircle2, Database, Eye, RefreshCw, Satellite, Server, ShieldAlert, ShieldCheck } from 'lucide-react';
import { demoAlerts, demoModels } from '@/lib/offline-demo';
import { acknowledgeAlert, createTestAlert as createAdminTestAlert, resolveAlert } from '@/services/adminService';
import { ActionButton, Metric, PageTitle, Panel, SectionHead, StatusPill } from '@/components/console-ui';

export function AdminPanelPage({ teamName, onTeamNameChange, alerts, models, onRefreshAlerts, onRefreshModels, onLogout }: { teamName: string; onTeamNameChange: (name: string) => void; alerts: typeof demoAlerts; models: typeof demoModels; onRefreshAlerts: () => Promise<void>; onRefreshModels: () => Promise<void>; onLogout: () => void }) {
  const [draftName, setDraftName] = useState(teamName);
  const [saved, setSaved] = useState(false);
  const [busyAlert, setBusyAlert] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'critical'>('open');
  const openAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalAlerts = openAlerts.filter((a) => a.severity === 'Critical');
  const visibleAlerts = alerts.filter((a) => filter === 'all' ? true : filter === 'critical' ? a.severity === 'Critical' && !a.acknowledged : !a.acknowledged);
  const saveTeam = () => {
    const nextName = draftName.trim() || 'SIH Evaluation Cell';
    setDraftName(nextName);
    onTeamNameChange(nextName);
    setSaved(true);
    setNotice('Workspace settings saved.');
    window.setTimeout(() => setNotice(''), 2200);
  };
  const adminAlertAction = async (id: string, action: 'acknowledge' | 'resolve') => {
    setBusyAlert(`${action}:${id}`);
    try {
      if (action === 'acknowledge') {
        await acknowledgeAlert(id);
      } else {
        await resolveAlert(id);
      }
      await onRefreshAlerts();
      setNotice(action === 'resolve' ? 'Alert resolved.' : 'Alert acknowledged.');
    } catch {
      setNotice('Could not update the alert. Check the API server.');
    } finally {
      setBusyAlert(null);
      window.setTimeout(() => setNotice(''), 2200);
    }
  };
  const createTestAlert = async () => {
    try {
      await createAdminTestAlert();
      await onRefreshAlerts();
      setFilter('open');
      setNotice('Test alert created and added to the triage queue.');
    } catch {
      setNotice('Could not create the test alert.');
    }
    window.setTimeout(() => setNotice(''), 2500);
  };
  const serviceRows = [
    ['FastAPI', 'Operational', '42 ms', Server],
    ['ML inference', 'Operational', '118 ms', Bot],
    ['PostGIS', 'Demo mode', 'Ready for DB', Database],
    ['Satellite feed', 'Demo dataset', 'Prepared', Satellite],
  ] as const;
  return <>
    <PageTitle eyebrow="Administration / control room" title="Control the workspace" description="Monitor alerts, system health, models, users and audit activity from one elevated command center." action={<div className="flex flex-wrap gap-2"><ActionButton onClick={createTestAlert} testId="button-create-test-alert" variant="outline"><ShieldAlert size={13} /> Test alert</ActionButton><ActionButton onClick={() => { onRefreshAlerts(); onRefreshModels(); }} testId="button-refresh-admin" variant="outline"><RefreshCw size={13} /> Refresh control room</ActionButton><ActionButton onClick={saveTeam} testId="button-save-team"><Check size={13} /> {saved ? 'Team saved' : 'Save settings'}</ActionButton><ActionButton onClick={onLogout} testId="button-admin-logout" variant="quiet">Sign out</ActionButton></div>} />
    {notice && <div role="status" className="mb-5 border border-[hsl(var(--primary)/.28)] bg-[hsl(var(--primary)/.07)] px-4 py-3 font-mono-ui text-[9px] uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">{notice}</div>}

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Open alerts" value={`${openAlerts.length}`} detail={`${criticalAlerts.length} critical · needs triage`} tone={openAlerts.length ? 'bad' : 'good'} />
      <Metric label="Critical alerts" value={`${criticalAlerts.length}`} detail="Immediate admin attention" tone={criticalAlerts.length ? 'bad' : 'good'} />
      <Metric label="Workspace members" value="5" detail="1 admin · 4 observers" tone="good" />
      <Metric label="System posture" value="OPERATIONAL" detail="API + ML services responding" tone="good" />
    </div>

    <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <Panel>
        <SectionHead label="Admin alert center" title="Operational signals" aside={<div className="flex gap-1"><button onClick={() => setFilter('open')} className={`border px-2.5 py-1 font-mono-ui text-[8px] uppercase ${filter === 'open' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)]' : 'border-[hsl(var(--border))]'}`}>Open</button><button onClick={() => setFilter('critical')} className={`border px-2.5 py-1 font-mono-ui text-[8px] uppercase ${filter === 'critical' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)]' : 'border-[hsl(var(--border))]'}`}>Critical</button><button onClick={() => setFilter('all')} className={`border px-2.5 py-1 font-mono-ui text-[8px] uppercase ${filter === 'all' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)]' : 'border-[hsl(var(--border))]'}`}>All</button></div>} />
        <div className="divide-y divide-[hsl(var(--border))]">
          {visibleAlerts.length ? visibleAlerts.map((a) => <div key={a.id} className={`p-5 ${a.acknowledged ? 'opacity-60' : ''}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
              <span className={`grid h-9 w-9 shrink-0 place-items-center ${a.severity === 'Critical' ? 'bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]' : a.severity === 'Warning' ? 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--chart-3)/.12)] text-[hsl(var(--chart-3))]'}`}><AlertTriangle size={17} /></span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[12px] font-bold">{a.title}</h3><StatusPill tone={a.severity === 'Critical' ? 'bad' : a.severity === 'Warning' ? 'warn' : 'good'}>{a.severity}</StatusPill>{a.acknowledged && <StatusPill tone="good">Acknowledged</StatusPill>}</div><p className="mt-2 text-[10px] leading-5 text-[hsl(var(--muted-foreground))]">{a.detail}</p><p className="mt-2 font-mono-ui text-[8px] text-[hsl(var(--muted-foreground)/.65)]">{a.timestamp}</p></div>
              {!a.acknowledged && <div className="flex shrink-0 gap-2"><ActionButton onClick={() => adminAlertAction(a.id, 'acknowledge')} testId={`button-admin-ack-${a.id}`} variant="outline">{busyAlert === `acknowledge:${a.id}` ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />} Acknowledge</ActionButton><ActionButton onClick={() => adminAlertAction(a.id, 'resolve')} testId={`button-admin-resolve-${a.id}`} variant="outline">{busyAlert === `resolve:${a.id}` ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Resolve</ActionButton></div>}
            </div>
          </div>) : <div className="p-12 text-center"><CheckCircle2 className="mx-auto text-[hsl(var(--chart-3))]" size={25} /><p className="mt-3 text-[12px] font-bold">No alerts in this filter</p><p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">The control room is clear.</p></div>}
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel><SectionHead label="Service health" title="System status" /><div className="divide-y divide-[hsl(var(--border))]">{serviceRows.map(([name, status, latency, Icon]) => <div key={name} className="flex items-center gap-3 px-5 py-4"><span className="grid h-8 w-8 place-items-center bg-[hsl(var(--muted))]"><Icon size={14} className="text-[hsl(var(--primary))]" /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-bold">{name}</p><p className="mt-1 font-mono-ui text-[8px] text-[hsl(var(--muted-foreground))]">{latency}</p></div><StatusPill tone={status === 'Operational' ? 'good' : 'warn'}>{status}</StatusPill></div>)}</div></Panel>
        <Panel><SectionHead label="Security" title="Access posture" /><div className="divide-y divide-[hsl(var(--border))]"><div className="flex items-center gap-3 p-5"><ShieldCheck size={18} className="text-[hsl(var(--chart-3))]" /><div className="flex-1"><p className="text-[11px] font-bold">Admin session</p><p className="mt-1 text-[9px] text-[hsl(var(--muted-foreground))]">Elevated demo access is active.</p></div><StatusPill tone="good">Active</StatusPill></div><div className="flex items-center gap-3 p-5"><Eye size={17} className="text-[hsl(var(--primary))]" /><div className="flex-1"><p className="text-[11px] font-bold">Audit logging</p><p className="mt-1 text-[9px] text-[hsl(var(--muted-foreground))]">24 events in the last 30 days.</p></div><StatusPill tone="good">On</StatusPill></div></div></Panel>
      </div>
    </div>

    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
      <Panel><SectionHead label="Team identity" title="Workspace owner" /><div className="space-y-4 p-5"><label className="block"><span className="eyebrow mb-2 block">Team name</span><input data-testid="input-team-name" value={draftName} onChange={(event) => { setDraftName(event.target.value); setSaved(false); }} className="w-full border border-[hsl(var(--border))] bg-transparent px-3 py-3 text-[12px] outline-none focus:border-[hsl(var(--primary))]" placeholder="Enter your team name" /></label><div className="flex items-center gap-3 border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)] p-4"><span className="grid h-10 w-10 place-items-center bg-[hsl(var(--primary))] font-mono-ui text-[11px] font-bold text-[hsl(var(--primary-foreground))]">{draftName.split(/\s+/).filter(Boolean).map((word) => word[0]).join('').slice(0, 2).toUpperCase() || 'TM'}</span><div><p className="text-[12px] font-bold">{draftName || 'Your team name'}</p><p className="mt-1 font-mono-ui text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Visible across the operations console</p></div></div></div></Panel>
      <Panel><SectionHead label="Model registry" title="AI services under watch" aside={<button onClick={onRefreshModels} className="font-mono-ui text-[9px] uppercase text-[hsl(var(--primary))]">Refresh models</button>} /><div className="divide-y divide-[hsl(var(--border))]">{models.map((m) => <div key={m.id} className="flex items-center gap-3 px-5 py-4"><Bot size={15} className="text-[hsl(var(--primary))]" /><div className="min-w-0 flex-1"><p className="text-[10px] font-bold">{m.name}</p><p className="mt-1 font-mono-ui text-[8px] text-[hsl(var(--muted-foreground))]">{m.version} · {Math.round(m.accuracy * 100)}% accuracy</p></div><StatusPill tone={m.status === 'Production' ? 'good' : 'warn'}>{m.status}</StatusPill></div>)}</div></Panel>
    </div>

    <div className="mt-5 grid gap-3 md:grid-cols-4"><Metric label="Admins" value="1" detail="Elevated access" /><Metric label="Observers" value="4" detail="Read-only users" /><Metric label="Audit events" value="24" detail="Last 30 days" tone="warn" /><Metric label="Last backup" value="05:30" unit="IST" detail="Today" tone="good" /></div>
  </>;
}
