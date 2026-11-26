import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#374151] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-md border bg-[#F7F8FA] py-2.5 text-sm font-medium text-[#121212] transition-colors placeholder:text-[#6B7280] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#004481]/15 focus:border-[#004481] disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:text-[#6B7280] ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-[#C81E1E] focus:border-[#C81E1E] focus:ring-[#C81E1E]/15 bg-[#FEF2F2]/40'
                : 'border-[#D1D5DB] hover:border-[#9CA3AF]'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6B7280]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs font-semibold text-[#C81E1E]">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs font-medium text-[#1464A5]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
