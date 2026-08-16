import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { login } from '@/lib/api';
import { Button, Input } from '@/components/dashboard-shell';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!email || !password) { setError('Enter your email and password to continue.'); return; }
    setBusy(true);
    try { const session = await login(email, password); setLocation(session.role === 'Admin' ? '/admin/dashboard' : '/engineer/profile'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in. Check your details and try again.'); }
    finally { setBusy(false); }
  }
  return <div className="grid min-h-[100dvh] bg-background md:grid-cols-[minmax(420px,42%)_1fr]">
    <section className="relative hidden overflow-hidden bg-[hsl(var(--sidebar))] px-12 py-12 text-[hsl(var(--sidebar-foreground))] md:flex md:flex-col">
      <div className="absolute -right-28 -top-20 h-72 w-72 rounded-full border border-[hsl(var(--sidebar-primary))]/20" /><div className="absolute -right-16 top-0 h-56 w-56 rounded-full border border-[hsl(var(--sidebar-primary))]/10" />
      <div className="relative flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[hsl(var(--sidebar-primary))] text-sm font-extrabold text-[hsl(var(--sidebar-primary-foreground))]">IH</span><span className="font-display text-xl">InteriorHub</span></div>
      <div className="relative my-auto max-w-md animate-rise"><div className="mb-8 h-px w-16 bg-[hsl(var(--sidebar-primary))]" /><h1 className="font-display text-6xl leading-[1.03] tracking-tight">Make room for<br /><span className="text-[hsl(var(--sidebar-primary))]">better work.</span></h1><p className="mt-7 max-w-sm text-sm leading-7 text-[hsl(var(--sidebar-foreground))]/60">A considered operations desk for the people shaping the spaces customers live in.</p><div className="mt-14 grid grid-cols-2 gap-7 border-t border-[hsl(var(--sidebar-border))] pt-6"><div><div className="font-mono-ui text-2xl text-[hsl(var(--sidebar-primary))]">01</div><div className="mt-2 text-xs text-[hsl(var(--sidebar-foreground))]/55">Review the work</div></div><div><div className="font-mono-ui text-2xl text-[hsl(var(--sidebar-primary))]">02</div><div className="mt-2 text-xs text-[hsl(var(--sidebar-foreground))]/55">Keep it moving</div></div></div></div>
      <div className="relative flex items-center gap-2 text-xs text-[hsl(var(--sidebar-foreground))]/45"><ShieldCheck size={14} /> Protected workspace · secure access only</div>
    </section>
    <section className="flex items-center justify-center px-6 py-12 md:px-16"><div className="w-full max-w-[410px] animate-rise">
      <div className="mb-10 md:hidden"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground">IH</span><span className="font-display text-xl">InteriorHub</span></div></div>
      <div className="mb-9"><div className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-primary">Welcome back</div><h2 className="mt-3 font-display text-4xl tracking-tight">Sign in to your<br />workspace.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Your projects and people, in one calm place.</p></div>
      <form onSubmit={submit} className="space-y-5">
        <div className="relative"><Mail className="absolute left-3.5 top-[36px] text-muted-foreground" size={16} /><Input data-testid="input-email" label="Email address" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@studio.com" className="pl-10" /></div>
        <div className="relative"><LockKeyhole className="absolute left-3.5 top-[36px] text-muted-foreground" size={16} /><Input data-testid="input-password" label="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="pl-10 pr-11" /><button type="button" data-testid="button-toggle-password" aria-label="Toggle password visibility" onClick={() => setShowPassword((value) => !value)} className="absolute right-3.5 top-[34px] text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
        {error && <div data-testid="status-auth-error" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-5 text-destructive">{error}</div>}
        <Button data-testid="button-login" type="submit" disabled={busy} className="mt-2 h-12 w-full">{busy ? 'Checking credentials…' : <>Enter workspace <ArrowRight size={16} /></>}</Button>
      </form>
      <p className="mt-9 text-center text-xs leading-5 text-muted-foreground">Access is managed by your InteriorHub account.<br />Contact an administrator if you need an invite.</p>
    </div></section>
  </div>;
}