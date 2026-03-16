'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { useQuizProgress } from '@/contexts/QuizProgressContext';

export default function NarrativeSidebar() {
  const { connected, publicKey } = useWallet();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="gradient-border p-6 space-y-5 relative"
    >
      {/* Top accent beam */}
      <div className="absolute top-0 left-[20%] right-[20%] h-px">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-sol-green/30 to-transparent" />
      </div>

      <h2 className="text-lg font-bold text-white">
        {connected ? 'Welcome, Explorer' : 'Get Started'}
      </h2>

      {connected ? (
        <ConnectedState publicKey={publicKey?.toBase58()} />
      ) : (
        <DisconnectedState />
      )}
    </motion.div>
  );
}

function ConnectedState({ publicKey }: { publicKey?: string }) {
  const { completedCount } = useQuizProgress();
  const progressPercent = (completedCount / 5) * 100;

  return (
    <div className="space-y-4">
      {/* Wallet Address */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]"
      >
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">
          Your Devnet Wallet
        </p>
        <p className="text-sm text-sol-green font-mono break-all">
          {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
        </p>
      </motion.div>

      {/* Quiz CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link
          href="/quiz"
          className="group block w-full text-center relative overflow-hidden bg-sol-green/10 hover:bg-sol-green/15 border border-sol-green/20 hover:border-sol-green/30 text-sol-green font-semibold py-3 px-4 rounded-xl transition-all duration-300 text-sm"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {completedCount > 0 ? 'Continue Learning' : 'Start Learning'}
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              &rarr;
            </motion.span>
          </span>
        </Link>
      </motion.div>

      {/* Devnet SOL */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <a
          href="https://faucet.solana.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-sol-purple/10 hover:bg-sol-purple/15 text-sol-purple font-semibold py-3 px-4 rounded-xl transition-all duration-300 text-sm border border-sol-purple/20 hover:border-sol-purple/30"
        >
          Get Free Devnet SOL
        </a>
      </motion.div>

      {/* Learning Progress */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]"
      >
        <div className="flex justify-between text-xs mb-3">
          <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
            Progress
          </span>
          <span className="text-gray-400">
            <span className="font-bold text-sol-green">{completedCount}</span>
            <span className="text-gray-600"> / </span>
            <span>5</span>
          </span>
        </div>
        <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            className="h-full rounded-full bg-gradient-to-r from-sol-green to-sol-blue"
          />
        </div>
        <div className="flex justify-between mt-2.5 px-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                n <= completedCount ? 'bg-sol-green' : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function DisconnectedState() {
  const steps = [
    {
      title: 'Install Phantom Wallet',
      description: 'Free browser extension for Solana.',
      action: (
        <a
          href="https://phantom.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white/[0.04] hover:bg-white/[0.06] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors border border-white/[0.06]"
        >
          Download Phantom
        </a>
      ),
    },
    {
      title: 'Switch to Devnet',
      description: null,
      content: (
        <ol className="text-sm text-gray-500 space-y-1 list-decimal list-inside">
          <li>Open Phantom &rarr; Settings</li>
          <li>Developer Settings</li>
          <li>Enable Testnet Mode</li>
          <li>Select Solana Devnet</li>
        </ol>
      ),
    },
    {
      title: 'Connect & Start',
      description: 'Connect your wallet to begin.',
      action: (
        <WalletMultiButton className="!bg-sol-green/10 hover:!bg-sol-green/15 !text-sol-green !border !border-sol-green/20 !rounded-xl !h-10 !text-sm !w-full !justify-center !font-semibold !transition-all !duration-300" />
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 + 0.2 }}
          className="bg-white/[0.02] rounded-xl p-4 space-y-3 border border-white/[0.04]"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sol-green/10 text-sol-green text-[10px] font-bold flex items-center justify-center border border-sol-green/20">
              {i + 1}
            </span>
            <h3 className="text-sm font-semibold text-white">{step.title}</h3>
          </div>
          {step.description && (
            <p className="text-sm text-gray-500 leading-relaxed pl-[30px]">
              {step.description}
            </p>
          )}
          {'content' in step && step.content && (
            <div className="pl-[30px]">{step.content}</div>
          )}
          {'action' in step && step.action && (
            <div className="pl-[30px]">{step.action}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
