import type { HTMLAttributes, ReactNode } from 'react';
import type { EntityType } from '../../core/types.ts';
import { ENTITY_COLORS } from '../../core/types.ts';

interface EntityMarkProps extends HTMLAttributes<HTMLElement> {
  color: string;
  children: ReactNode;
}

export function EntityMark({ color, children, style, ...props }: EntityMarkProps) {
  return (
    <mark
      {...props}
      style={{
        backgroundColor: color + '20',
        borderBottom: `2px solid ${color}`,
        color,
        padding: '1px 3px',
        borderRadius: '2px',
        ...style,
      }}
    >
      {children}
    </mark>
  );
}

interface EntityBadgeProps {
  type: EntityType;
  label: string;
}

export function EntityBadge({ type, label }: EntityBadgeProps) {
  const color = ENTITY_COLORS[type];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-sm"
      style={{ backgroundColor: color + '20', color }}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
