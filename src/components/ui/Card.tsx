import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  padded = true,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 ${
        padded ? 'p-6' : ''
      } ${
        hoverEffect
          ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-evalua-blue/30'
          : 'shadow-xs'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
