import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-[#E2E6EC] p-5 transition-colors duration-150 ${
        onClick ? 'cursor-pointer hover:border-[#004481]' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#5B6573]">
          {title}
        </span>
        <div className="w-8 h-8 rounded-md bg-[#F7F8FA] border border-[#E2E6EC] text-[#004481] flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-[#121212] tracking-tight tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              trend.isPositive
                ? 'bg-[#ECFDF5] text-[#028448]'
                : 'bg-[#FEF2F2] text-[#C81E1E]'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1.5 text-xs text-[#5B6573] font-medium">{subtitle}</p>
      )}
    </div>
  );
};
