'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function WalletGate({ children }: { children: ReactNode }) {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 relative overflow-hidden pt-28">
        <div className="fixed inset-0 pointer-events-none">
          <div className="dot-grid absolute inset-0" />
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-sol-green/[0.04] rounded-full blur-[80px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-sol-purple/[0.05] rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative gradient-border p-10 max-w-md w-full text-center space-y-6 bg-[var(--card)]"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto w-20 h-20 rounded-2xl bg-sol-purple/10 border border-sol-purple/20 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sol-purple">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Connect a Solana wallet to access the quiz modules and start your
              learning journey on Devnet.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <WalletMultiButton className="!bg-sol-green/10 hover:!bg-sol-green/15 !text-sol-green !border !border-sol-green/20 !rounded-xl !h-12 !text-sm !mx-auto !font-semibold !transition-all !duration-300" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-gray-600"
          >
            Make sure Phantom is set to Devnet
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
