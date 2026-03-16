'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo, useState, useEffect, type ReactNode } from 'react';

import '@solana/wallet-adapter-react-ui/styles.css';

export function SolanaProvider({ children }: { children: ReactNode }) {
  // Prevent SSR hydration mismatch — wallet adapter needs the browser
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // DEVNET ONLY — students use free/fake SOL for learning
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Empty array = auto-detect wallets via the Wallet Standard protocol.
  // Phantom, Solflare, Backpack etc. register themselves automatically.
  const wallets = useMemo(() => [], []);

  if (!mounted) return null;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
