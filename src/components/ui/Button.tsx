import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'navy' | 'blue' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  pill = true,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const shapeClass = pill ? 'rounded-full' : 'rounded-xl';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 shadow-xs',
    md: 'text-sm px-5 py-2.5 gap-2 shadow-xs',
    lg: 'text-base px-7 py-3.5 gap-2.5 shadow-sm',
  };

  const variantClasses = {
    primary:
      'bg-evalua-yellow text-slate-950 hover:bg-[#ebd000] focus:ring-evalua-yellow shadow-sm hover:shadow',
    secondary:
      'border-2 border-white text-white hover:bg-white hover:text-evalua-navy focus:ring-white',
    navy:
      'bg-evalua-navy text-white hover:bg-[#00344d] focus:ring-evalua-navy text-white',
    blue:
      'bg-evalua-blue text-white hover:bg-[#08386a] focus:ring-evalua-blue text-white',
    outline:
      'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:ring-evalua-blue',
    ghost:
      'text-slate-700 hover:text-evalua-blue hover:bg-evalua-sky focus:ring-evalua-blue',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
  };

  return (
    <button
      className={`${baseClasses} ${shapeClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
