'use client';

import { motion } from 'framer-motion';
import LeaderboardWidget from '@/components/LeaderboardWidget';

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white pt-28">
      <div className="fixed inset-0 pointer-events-none">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-sol-purple/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-sm text-gray-500 mt-1">Top traders ranked by profit & loss</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LeaderboardWidget limit={50} compact={false} showUserRank={true} />
        </motion.div>
      </div>
    </main>
  );
}
