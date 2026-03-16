'use client';

import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export default function ProgressIndicator({
  current,
  total,
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          className="relative h-2.5 flex-1 rounded-full overflow-hidden bg-white/[0.04]"
        >
          <motion.div
            initial={false}
            animate={{
              width: i < current ? '100%' : i === current ? '100%' : '0%',
              opacity: i <= current ? 1 : 0.3,
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-y-0 left-0 rounded-full ${
              i < current
                ? 'bg-gradient-to-r from-sol-green to-sol-green/80'
                : i === current
                ? 'bg-gradient-to-r from-sol-green to-sol-blue'
                : ''
            }`}
          />
          {/* Active pulse */}
          {i === current && (
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-sol-green/40 to-sol-blue/40 rounded-full"
            />
          )}
        </motion.div>
      ))}

      <motion.div
        key={current}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="ml-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1 flex items-center gap-1"
      >
        <span className="text-xs font-bold text-sol-green">{current + 1}</span>
        <span className="text-xs text-gray-600">/</span>
        <span className="text-xs text-gray-500">{total}</span>
      </motion.div>
    </div>
  );
}
