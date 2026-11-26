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
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-semibold',
  };

  const variantClasses = {
    success: 'bg-[#ECFDF5] text-[#028448] border border-[#A7F3D0]',
    warning: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
    danger: 'bg-[#FEF2F2] text-[#C81E1E] border border-[#FECACA]',
    navy: 'bg-[#072146]/10 text-[#072146] border border-[#072146]/20',
    blue: 'bg-[#F0F5FA] text-[#004481] border border-[#B8D0E6]',
    sky: 'bg-[#F0F5FA] text-[#1464A5] border border-[#B8D0E6]',
    neutral: 'bg-[#F7F8FA] text-[#374151] border border-[#E2E6EC]',
  };

  const dotColors = {
    success: 'bg-[#028448]',
    warning: 'bg-[#B45309]',
    danger: 'bg-[#C81E1E]',
    navy: 'bg-[#072146]',
    blue: 'bg-[#004481]',
    sky: 'bg-[#1464A5]',
    neutral: 'bg-[#6B7280]',
  };

  return (
    <span
      className={`inline-flex items-center rounded select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
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
