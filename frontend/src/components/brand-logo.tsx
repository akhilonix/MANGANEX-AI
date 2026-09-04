import { Link } from 'wouter';

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/dashboard" data-testid="link-logo" className="flex items-center gap-3 group">
    <span className="relative grid h-9 w-9 place-items-center border border-[hsl(var(--primary)/.55)] bg-[hsl(var(--primary)/.13)] text-[hsl(var(--primary))]">
      <span className="absolute inset-1 border border-[hsl(var(--primary)/.28)]" />
      <span className="font-display text-xl leading-none">M</span>
    </span>
    {!compact && <span className="leading-none"><span className="block text-[15px] font-extrabold tracking-[.15em] text-[hsl(var(--sidebar-foreground))]">MANGANEX</span><span className="mt-1 block font-mono-ui text-[9px] tracking-[.21em] text-[hsl(var(--primary))]">AI / OPERATIONS</span></span>}
  </Link>;
}