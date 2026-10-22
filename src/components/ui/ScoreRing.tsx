import React from 'react';
import { motion } from 'motion/react';

export interface ScoreRingProps {
  score?: number;
  minScore?: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showBadge?: boolean;
  badgePosition?: 'left' | 'bottom' | 'center';
  children?: React.ReactNode;
  animate?: boolean;
  className?: string;
  categoryText?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score = 743,
  minScore = 300,
  maxScore = 850,
  size = 'md',
  showBadge = true,
  badgePosition = 'left',
  children,
  animate = true,
  className = '',
  categoryText,
}) => {
  // Normalize score between 0 and 1
  const clampedScore = Math.max(minScore, Math.min(maxScore, score));
  const progress = (clampedScore - minScore) / (maxScore - minScore);

  // Determine angle from 0 to 360 degrees (starting at bottom/180deg)
  const angleDeg = 180 + progress * 360;
  const radians = (angleDeg * Math.PI) / 180;

  // Dimensions
  const sizeMap = {
    sm: { container: 'w-24 h-24', ringWidth: 'p-1.5', badge: 'text-xs px-2 py-0.5', dot: 'w-2.5 h-2.5' },
    md: { container: 'w-40 h-40', ringWidth: 'p-2.5', badge: 'text-sm px-3 py-1', dot: 'w-3.5 h-3.5' },
    lg: { container: 'w-56 h-56', ringWidth: 'p-3', badge: 'text-base px-4 py-1.5', dot: 'w-4 h-4' },
    hero: { container: 'w-72 sm:w-96 lg:w-[480px] h-72 sm:h-96 lg:h-[480px]', ringWidth: 'p-3 sm:p-4', badge: 'text-xl sm:text-2xl px-5 py-2', dot: 'w-4 sm:w-5 h-4 sm:h-5' },
  };

  const currentSize = sizeMap[size];

  // Category based on standard credit scores
  const getCategory = (val: number) => {
    if (categoryText) return categoryText;
    if (val >= 750) return 'Excelente';
    if (val >= 700) return 'Muy bueno';
    if (val >= 640) return 'Bueno';
    if (val >= 580) return 'Regular';
    return 'Riesgo alto';
  };

  // Badge background color according to score
  const getBadgeColor = (val: number) => {
    if (val >= 700) return 'bg-[#8BD04F] text-slate-950';
    if (val >= 640) return 'bg-evalua-yellow text-slate-950';
    if (val >= 580) return 'bg-amber-400 text-slate-950';
    return 'bg-rose-500 text-white';
  };

  // Position of dot on ring radius (percentage from center: 50% + cos/sin * ~47%)
  const radiusPercent = 48;
  const dotX = 50 + radiusPercent * Math.cos(radians);
  const dotY = 50 + radiusPercent * Math.sin(radians);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer Conic Ring Container */}
      <div className={`relative ${currentSize.container} rounded-full`}>
        {/* Animated Conic Ring */}
        <motion.div
          animate={animate ? { rotate: [0, 360] } : undefined}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-0 rounded-full score-conic-ring shadow-xl`}
          style={{ willChange: 'transform' }}
        />

        {/* Needle/Dot on the ring showing exact score point */}
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${dotX}%`, top: `${dotY}%` }}
        >
          <div className={`${currentSize.dot} rounded-full bg-white ring-2 ring-slate-900/20 shadow-md flex items-center justify-center`}>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>
        </div>

        {/* Inner Content Container */}
        <div className={`absolute inset-2 sm:inset-3 rounded-full overflow-hidden bg-white shadow-inner flex items-center justify-center`}>
          {children ? (
            children
          ) : (
            <div className="text-center p-3 select-none">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Score Crediticio
              </span>
              <span className="block text-3xl sm:text-4xl font-extrabold text-evalua-navy tracking-tight mt-1">
                {score}
              </span>
              <span className="inline-block mt-1 text-xs font-bold text-evalua-green bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {getCategory(score)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Score Badge (TransUnion pill/circle e.g. "743" in #8BD04F on the left edge) */}
      {showBadge && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={`absolute z-30 font-black tracking-tight rounded-full shadow-lg border-2 border-white flex items-center justify-center gap-1.5 select-none ${
            badgePosition === 'left'
              ? '-left-4 sm:-left-6 top-1/2 -translate-y-1/2'
              : badgePosition === 'bottom'
              ? 'bottom-0 translate-y-1/2'
              : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
          } ${currentSize.badge} ${getBadgeColor(score)}`}
        >
          <span>{score}</span>
        </motion.div>
      )}
    </div>
  );
};
