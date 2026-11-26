import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface CreditPortfolioIllustrationProps {
  activeCount: number;
  completionPct: number;
}

export const CreditPortfolioIllustration: React.FC<CreditPortfolioIllustrationProps> = ({
  activeCount,
  completionPct
}) => {
  const shouldReduce = useReducedMotion();
  const normalizedPct = Math.max(12, Math.min(100, Math.round(completionPct)));

  return (
    <div
      className="relative w-full h-full min-h-[168px] flex items-center justify-center select-none"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 340 190"
        className="w-full max-w-[330px] h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fintechAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#004481" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#004481" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="fintechCardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#072146" />
            <stop offset="100%" stopColor="#004481" />
          </linearGradient>
        </defs>

        {/* Subtle geometric ledger grid */}
        <g opacity="0.55">
          <line x1="20" y1="36" x2="320" y2="36" stroke="#E2E6EC" strokeDasharray="3 4" />
          <line x1="20" y1="80" x2="320" y2="80" stroke="#E2E6EC" strokeDasharray="3 4" />
          <line x1="20" y1="124" x2="320" y2="124" stroke="#E2E6EC" strokeDasharray="3 4" />
          <line x1="20" y1="168" x2="320" y2="168" stroke="#E2E6EC" />
        </g>

        {/* Back layer: Financial Dossier Sheet */}
        <motion.g
          initial={shouldReduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <rect
            x="24"
            y="22"
            width="210"
            height="136"
            rx="10"
            fill="#FFFFFF"
            stroke="#D6DFEB"
            strokeWidth="1.2"
          />

          {/* Sheet top header lines */}
          <rect x="40" y="38" width="54" height="6" rx="3" fill="#072146" opacity="0.85" />
          <rect x="40" y="49" width="88" height="4" rx="2" fill="#94A3B8" opacity="0.55" />

          {/* Animated miniature portfolio bars */}
          {[
            { x: 42, h: 28, color: '#CBD5E1', delay: 0.12 },
            { x: 56, h: 42, color: '#93C5FD', delay: 0.18 },
            { x: 70, h: 35, color: '#1464A5', delay: 0.24 },
            { x: 84, h: 52, color: '#004481', delay: 0.3 },
            { x: 98, h: 44, color: '#1464A5', delay: 0.36 },
            { x: 112, h: 60, color: '#028448', delay: 0.42 }
          ].map((bar, i) => (
            <motion.rect
              key={i}
              x={bar.x}
              y={136 - bar.h}
              width="9"
              height={bar.h}
              rx="2.5"
              fill={bar.color}
              initial={shouldReduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ originY: '136px', transformBox: 'fill-box' }}
              transition={{ duration: 0.5, delay: bar.delay, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}

          {/* Cashflow Curve Overlay */}
          <motion.path
            d="M 134 128 C 148 118, 156 122, 168 104 C 180 86, 192 94, 218 70 L 218 136 L 134 136 Z"
            fill="url(#fintechAreaGrad)"
            initial={shouldReduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          />
          <motion.path
            d="M 134 128 C 148 118, 156 122, 168 104 C 180 86, 192 94, 218 70"
            stroke="#004481"
            strokeWidth="2.4"
            strokeLinecap="round"
            initial={shouldReduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.circle
            cx="218"
            cy="70"
            r="4"
            fill="#028448"
            stroke="#FFFFFF"
            strokeWidth="2"
            initial={shouldReduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.85 }}
          />
        </motion.g>

        {/* Floating Foreground Card: Payment Capacity & Dossier Gauge */}
        <motion.g
          initial={shouldReduce ? false : { opacity: 0, x: 12, y: 6 }}
          animate={
            shouldReduce
              ? { opacity: 1, x: 0, y: 0 }
              : {
                  opacity: 1,
                  x: 0,
                  y: [0, -3.5, 0]
                }
          }
          transition={
            shouldReduce
              ? { duration: 0.3 }
              : {
                  opacity: { duration: 0.45, delay: 0.2 },
                  x: { duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }
                }
          }
        >
          <rect
            x="198"
            y="84"
            width="124"
            height="86"
            rx="10"
            fill="url(#fintechCardGrad)"
          />
          <rect
            x="198.6"
            y="84.6"
            width="122.8"
            height="84.8"
            rx="9.4"
            stroke="#FFFFFF"
            strokeOpacity="0.16"
            strokeWidth="1.2"
          />

          {/* Shield & Checkmark */}
          <rect x="210" y="96" width="22" height="22" rx="6" fill="#FFFFFF" fillOpacity="0.14" />
          <motion.path
            d="M 216.5 107 L 220 110.5 L 226 103.5"
            stroke="#8BD04F"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={shouldReduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          />

          <text
            x="240"
            y="105"
            fill="#CBD5E1"
            fontSize="8.5"
            fontWeight="600"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            AVANCE CARTERA
          </text>
          <text
            x="240"
            y="117"
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="700"
            fontFamily="IBM Plex Mono, monospace"
          >
            {normalizedPct}% · {activeCount} exp.
          </text>

          {/* Animated progress bar inside floating card */}
          <rect x="210" y="132" width="100" height="5" rx="2.5" fill="#FFFFFF" fillOpacity="0.18" />
          <motion.rect
            x="210"
            y="132"
            width={normalizedPct}
            height="5"
            rx="2.5"
            fill="#8BD04F"
            initial={shouldReduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{ originX: '210px', transformBox: 'fill-box' }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          />

          <text
            x="210"
            y="154"
            fill="#93C5FD"
            fontSize="8.5"
            fontWeight="500"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            Flujo y sustento S/
          </text>
        </motion.g>
      </svg>
    </div>
  );
};
