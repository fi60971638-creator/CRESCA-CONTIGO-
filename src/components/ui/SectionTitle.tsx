import React from 'react';

export interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  light = false,
}) => {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-3xl mb-12 ${alignClass}`}>
      {eyebrow && (
        <span
          className={`inline-block text-xs font-bold uppercase tracking-wider mb-3 px-2.5 py-1 rounded ${
            light
              ? 'bg-white/10 text-evalua-yellow'
              : 'bg-[#F0F5FA] text-[#004481]'
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${
          light ? 'text-white' : 'text-[#121212]'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed ${
            light ? 'text-slate-200' : 'text-[#5B6573]'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
