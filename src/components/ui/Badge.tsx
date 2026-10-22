import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'navy' | 'blue' | 'sky' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
  };

  const variantClasses = {
    success: 'bg-emerald-50 text-evalua-green border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    navy: 'bg-[#00405F]/10 text-evalua-navy border border-[#00405F]/20',
    blue: 'bg-[#0B4A8B]/10 text-evalua-blue border border-[#0B4A8B]/20',
    sky: 'bg-evalua-sky text-evalua-blue border border-blue-200/60',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const dotColors = {
    success: 'bg-evalua-green',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    navy: 'bg-evalua-navy',
    blue: 'bg-evalua-blue',
    sky: 'bg-sky-500',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-wide select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]} shrink-0`}
        />
      )}
      {children}
    </span>
  );
};
