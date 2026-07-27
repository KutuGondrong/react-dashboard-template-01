type AnimatedBackgroundVariant = 'auth' | 'dashboard';

interface AnimatedBackgroundProps {
  variant?: AnimatedBackgroundVariant;
}

export function AnimatedBackground({ variant = 'auth' }: AnimatedBackgroundProps) {
  if (variant === 'dashboard') {
    return (
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.04),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06),transparent_60%)]" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-transparent to-transparent dark:from-primary-950/20 dark:via-transparent" />
    </div>
  );
}
