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
  variant = 'blue',
  size = 'md',
  pill = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold tracking-tight transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-offset-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap';

  const shapeClass = pill ? 'rounded-md' : 'rounded-md';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2',
  };

  const variantClasses = {
    primary:
      'bg-[#004481] text-white hover:bg-[#072146] focus:ring-[#004481]',
    secondary:
      'border border-[#CBD5E1] text-[#121212] bg-white hover:bg-[#F7F8FA] focus:ring-[#004481]',
    navy:
      'bg-[#072146] text-white hover:bg-[#04152E] focus:ring-[#072146]',
    blue:
      'bg-[#004481] text-white hover:bg-[#072146] focus:ring-[#004481]',
    outline:
      'border border-[#CBD5E1] text-[#121212] bg-white hover:bg-[#F7F8FA] focus:ring-[#004481]',
    ghost:
      'text-[#1464A5] hover:text-[#072146] hover:bg-[#F0F5FA] focus:ring-[#004481]',
    danger:
      'bg-[#C81E1E] text-white hover:bg-[#991B1B] focus:ring-[#C81E1E]',
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
