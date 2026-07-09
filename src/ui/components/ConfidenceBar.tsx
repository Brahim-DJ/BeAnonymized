interface ConfidenceBarProps {
  confidence: number;
  size?: 'sm' | 'xs';
}

export function ConfidenceBar({ confidence, size = 'sm' }: ConfidenceBarProps) {
  const pct = Math.round(confidence * 100);
  const colorClass = confidence > 0.8 ? 'bg-success' : confidence > 0.5 ? 'bg-warning' : 'bg-destructive';
  const widthClass = size === 'sm' ? 'w-14' : 'w-10';
  const textClass = size === 'sm' ? 'text-xs' : 'text-[10px]';

  return (
    <div className="flex items-center gap-2">
      <div className={`${widthClass} bg-secondary h-1.5 overflow-hidden rounded-full`}>
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`${textClass} text-muted-foreground tabular-nums`}>{pct}%</span>
    </div>
  );
}
