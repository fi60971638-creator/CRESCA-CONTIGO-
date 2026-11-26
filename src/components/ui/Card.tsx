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
      className={`bg-white rounded-lg border border-[#E2E6EC] ${
        padded ? 'p-5 sm:p-6' : ''
      } ${
        hoverEffect
          ? 'transition-colors duration-150 hover:border-[#004481]/40'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
