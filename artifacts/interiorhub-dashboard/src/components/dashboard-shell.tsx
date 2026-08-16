import { useEffect, useState, type ReactNode, type ElementType, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Link, useLocation } from 'wouter';
import { BriefcaseBusiness, Building2, ChevronRight, ClipboardList, FolderKanban, LayoutDashboard, LogOut, Menu, MessageSquare, Settings2, Users, X } from 'lucide-react';
import { getRole, getSession, logout, type Role } from '@/lib/api';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Categories', icon: Building2 },
  { href: '/admin/engineers', label: 'Engineers', icon: Users },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
];
const engineerLinks = [
  { href: '/engineer/profile', label: 'My profile', icon: Settings2 },
  { href: '/engineer/projects', label: 'My projects', icon: BriefcaseBusiness },
  { href: '/engineer/contact-requests', label: 'Contact requests', icon: MessageSquare },
];
function initials(value?: string) { return (value || 'IH').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); }

export function AppShell({ children, allowedRole }: { children: ReactNode; allowedRole?: Role }) {
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const currentRole = getRole();
  const session = getSession();
  useEffect(() => { if (!session) setLocation('/login'); else if (allowedRole && currentRole !== allowedRole) setLocation(currentRole === 'Admin' ? '/admin/dashboard' : '/engineer/profile'); }, [session, currentRole, allowedRole, setLocation]);
  if (!session || (allowedRole && currentRole !== allowedRole)) return null;
  const links = currentRole === 'Admin' ? adminLinks : engineerLinks;
  const [currentPath] = useLocation();
  async function handleLogout() { setBusy(true); await logout(); setBusy(false); setLocation('/login'); }
  return <div className="min-h-[100dvh] bg-background text-foreground">
    {mobileOpen && <button data-testid="button-close-menu" aria-label="Close navigation" className="fixed inset-0 z-30 bg-[#17252d]/30 md:hidden" onClick={() => setMobileOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[254px] flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-[88px] items-center justify-between px-7">
        <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[hsl(var(--sidebar-primary))] text-sm font-extrabold text-[hsl(var(--sidebar-primary-foreground))]">IH</span>
          <span className="font-display text-xl tracking-tight">InteriorHub</span>
        </Link>
        <button className="md:hidden" data-testid="button-mobile-close" onClick={() => setMobileOpen(false)}><X size={18} /></button>
      </div>
      <div className="px-5 pb-5"><div className="rounded-xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))] px-3 py-3"><div className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-[hsl(var(--sidebar-primary))]">Workspace</div><div className="mt-1 text-sm font-semibold">{currentRole === 'Admin' ? 'Operations desk' : 'Studio workspace'}</div></div></div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
        {links.map((item) => { const Icon = item.icon; const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${active ? 'bg-[hsl(var(--sidebar-primary))] font-bold text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground))]/65 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`}><Icon size={17} strokeWidth={active ? 2.2 : 1.8} /><span>{item.label}</span>{active && <ChevronRight className="ml-auto" size={15} />}</Link>; })}
      </nav>
      <div className="border-t border-[hsl(var(--sidebar-border))] p-4">
        <div className="mb-3 flex items-center gap-3 px-2"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--sidebar-primary))] text-xs font-bold text-[hsl(var(--sidebar-primary-foreground))]">{initials(session.name || session.email)}</div><div className="min-w-0"><div className="truncate text-sm font-semibold">{session.name || 'Workspace user'}</div><div className="font-mono-ui text-[10px] uppercase tracking-wider opacity-50">{currentRole}</div></div></div>
        <button disabled={busy} onClick={handleLogout} data-testid="button-logout" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[hsl(var(--sidebar-foreground))]/60 transition hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"><LogOut size={16} />{busy ? 'Signing out…' : 'Sign out'}</button>
      </div>
    </aside>
    <div className="md:pl-[254px]">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-md md:px-9">
        <button className="md:hidden" data-testid="button-mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><span className="font-mono-ui uppercase tracking-[.16em]">Interior operations</span><span className="h-1 w-1 rounded-full bg-accent" /><span>Live workspace</span></div>
        <div className="ml-auto flex items-center gap-3"><div className="hidden text-right sm:block"><div className="text-sm font-semibold">{session.name || session.email}</div><div className="text-xs text-muted-foreground">{currentRole === 'Admin' ? 'Admin account' : 'Professional account'}</div></div><div className="grid h-9 w-9 place-items-center rounded-full border border-border bg-secondary text-xs font-bold text-primary">{initials(session.name || session.email)}</div></div>
      </header>
      <main className="mx-auto max-w-[1480px] px-5 py-7 md:px-9 md:py-10">{children}</main>
    </div>
  </div>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="font-mono-ui text-[10px] font-medium uppercase tracking-[.2em] text-primary">{eyebrow}</div><h1 className="mt-2 font-display text-4xl tracking-tight text-foreground md:text-[46px]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>{action && <div className="shrink-0">{action}</div>}</div>;
}
export function Button({ children, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const styles = { primary: 'bg-primary text-primary-foreground hover:opacity-90', secondary: 'border border-border bg-card text-foreground hover:bg-secondary', ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground', danger: 'bg-destructive text-destructive-foreground hover:opacity-90' };
  return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}>{children}</button>;
}
export function Input({ label, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) { return <label className="block space-y-2"><span className="text-xs font-bold text-foreground">{label}</span><input {...props} className={`w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 ${className}`} /></label>; }
export function Textarea({ label, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) { return <label className="block space-y-2"><span className="text-xs font-bold text-foreground">{label}</span><textarea {...props} className={`min-h-[115px] w-full resize-y rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 ${className}`} /></label>; }
export function EmptyState({ icon: Icon = ClipboardList, title, description, action }: { icon?: ElementType; title: string; description: string; action?: ReactNode }) { return <div className="surface flex min-h-[270px] flex-col items-center justify-center rounded-2xl px-6 text-center"><div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary"><Icon size={21} /></div><h3 className="font-display text-2xl">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>{action && <div className="mt-5">{action}</div>}</div>; }
export function LoadingState() { return <div className="space-y-3">{[1,2,3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-secondary/70" />)}</div>; }
export function ErrorState({ error, retry }: { error: unknown; retry: () => void }) { return <div className="surface rounded-2xl border-destructive/25 p-7"><div className="font-display text-2xl">Couldn’t load this view</div><p className="mt-2 text-sm text-muted-foreground">{error instanceof Error ? error.message : 'The service returned an unexpected response.'}</p><Button variant="secondary" className="mt-5" onClick={retry} data-testid="button-retry">Try again</Button></div>; }
export function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) { return <div className="flex items-center justify-between border-t border-border/70 pt-4 text-xs text-muted-foreground"><span className="font-mono-ui">PAGE {String(page).padStart(2, '0')} / {String(Math.max(totalPages, 1)).padStart(2, '0')}</span><div className="flex gap-2"><Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)} data-testid="button-page-prev">Previous</Button><Button variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)} data-testid="button-page-next">Next</Button></div></div>; }
export function StatusPill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) { const color = { neutral: 'bg-secondary text-muted-foreground', success: 'bg-[#dfeee6] text-[#21644e]', warning: 'bg-[#f9ead2] text-[#986221]', danger: 'bg-[#f8dfdc] text-[#9d4038]' }; return <span className={`inline-flex rounded-full px-2.5 py-1 font-mono-ui text-[10px] font-medium uppercase tracking-wider ${color[tone]}`}>{children}</span>; }