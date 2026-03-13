'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > prev && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const links = [
    { href: '/trade', label: 'Trade' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/learn', label: 'Learn' },
    {
      href: 'https://explorer.solana.com/?cluster=devnet',
      label: 'Explorer',
      external: true,
    },
  ];

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: hidden ? -96 : 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-8 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-sm.png"
            alt="SolanaEdu"
            className="h-[72px] w-auto object-contain"
          />
          <span className="hidden sm:inline text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
            Devnet
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const isActive = !link.external && pathname?.startsWith(link.href);
            const Component = link.external ? 'a' : Link;
            const extraProps = link.external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {};

            return (
              <Component
                key={link.href}
                href={link.href}
                {...(extraProps as any)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-sol-green'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-sol-green"
                    style={{ boxShadow: '0 0 8px rgba(20, 241, 149, 0.4)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {link.external && (
                  <svg className="inline-block w-3 h-3 ml-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </Component>
            );
          })}

          <div className="w-px h-6 bg-white/[0.06] mx-2" />

          <WalletMultiButton className="!bg-sol-green/10 hover:!bg-sol-green/20 !text-sol-green !border !border-sol-green/20 hover:!border-sol-green/30 !rounded-lg !h-9 !text-sm !font-semibold !transition-all !duration-300" />
        </div>
      </div>
    </motion.nav>
  );
}
