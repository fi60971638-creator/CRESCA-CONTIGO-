import React, { useEffect, useState } from 'react';
import { animate, useMotionValue, useReducedMotion } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 0.65,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const prefersReducedMotion = useReducedMotion();
  const motionVal = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState<number>(prefersReducedMotion ? value : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const controls = animate(motionVal, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(latest);
      }
    });

    return () => controls.stop();
  }, [value, duration, prefersReducedMotion, motionVal]);

  const formatted = displayValue.toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
