interface StepBadgeProps {
  label: string
  active?: boolean
  done?: boolean
}

export default function StepBadge({ label, active = false, done = false }: StepBadgeProps) {
  const base = 'rounded-pill px-3 py-1 text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1.5 border'
  const variant = done
    ? 'bg-emerald-50 text-emerald-700 border-emerald-100/60'
    : active
    ? 'bg-primary/5 text-primary border-primary/10'
    : 'bg-slate-100 text-slate-500 border-slate-200/60'
  return <span className={`${base} ${variant}`}>{done && '✓ '}{label}</span>
}
