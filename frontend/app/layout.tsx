import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '@/providers/chakra-provider';
import { StacksWalletProvider } from '@/providers/stacks-provider';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Micro-Task Bounty Platform - Decentralized Task Marketplace",
  description: "Create, complete, and earn from micro-tasks on the blockchain. A decentralized platform for task creators and workers.",
  keywords: "blockchain, tasks, bounty, stacks, crypto, freelance, micro-tasks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${poppins.variable} ${inter.variable}`}>
        <Providers>
          <StacksWalletProvider>
            {children}
          </StacksWalletProvider>
        </Providers>
      </body>
    </html>
  );
}
