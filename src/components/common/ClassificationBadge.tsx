import React from 'react';
import { ScopeClassification } from '../../types';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ClassificationBadgeProps {
  classification: ScopeClassification;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ClassificationBadge: React.FC<ClassificationBadgeProps> = ({
  classification,
  showIcon = true,
  size = 'md',
}) => {
  // Respecting anti-slop zero-pill guidelines:
  // Rendered as clean, unboxed text with precise typographic weight and subtle indicator dot/icon,
  // rather than a candy pill capsule.
  const config = {
    OUT_OF_SCOPE: {
      label: 'Potentially out of scope',
      textColor: 'text-rose-700 dark:text-rose-600',
      dotColor: 'bg-rose-500',
      icon: ShieldAlert,
      subtext: 'Requires Change Order or Agreement',
      ariaLabel: 'Status: Potentially out of scope',
    },
    SCOPE_CREEP_RISK: {
      label: 'Needs review',
      textColor: 'text-amber-700 dark:text-amber-600',
      dotColor: 'bg-amber-500',
      icon: AlertTriangle,
      subtext: 'Uncertain or ambiguous boundary',
      ariaLabel: 'Status: Needs review — human verification advised',
    },
    IN_SCOPE: {
      label: 'Within scope',
      textColor: 'text-emerald-700 dark:text-emerald-600',
      dotColor: 'bg-emerald-500',
      icon: CheckCircle2,
      subtext: 'Covered by agreement deliverables',
      ariaLabel: 'Status: Within scope',
    },
  }[classification] || {
    label: 'Needs review',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
    icon: AlertTriangle,
    subtext: 'Uncertain',
    ariaLabel: 'Status: Needs review',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs gap-1.5',
    md: 'text-sm gap-2',
    lg: 'text-base gap-2.5',
  }[size];

  return (
    <div
      role="status"
      aria-label={config.ariaLabel}
      className={`inline-flex items-center font-bold ${config.textColor} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor} shrink-0`} aria-hidden="true" />
      {showIcon && (
        <Icon
          className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}
          aria-hidden="true"
        />
      )}
      <span className="tracking-tight">{config.label}</span>
      <span className="sr-only">({config.ariaLabel})</span>
    </div>
  );
};
