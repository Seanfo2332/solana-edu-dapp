import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "../components/solana/solana-provider";
import { QuizProgressProvider } from "../contexts/QuizProgressContext";
import Navbar from "../components/Navbar";
import LiveTicker from "../components/LiveTicker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolanaEdu — Financial Literacy for the Next Generation",
  description:
    "A Solana-based educational dApp for young investors to learn about Web3 safely on Devnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f]`}
      >
        <SolanaProvider>
          <QuizProgressProvider>
            <LiveTicker />
            <Navbar />
            {children}
          </QuizProgressProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
