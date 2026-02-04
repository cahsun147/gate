"use client";

import { PrivyProvider } from "@privy-io/react-auth";
// 1. Import jaringan yang Anda inginkan dari viem
import { mainnet, base, bsc } from "viem/chains";

export default function PrivyWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <p>Error: Privy App ID is missing in .env.local</p>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // Konfigurasi Tamilan Login web3
        appearance: {
          theme: 'dark',               
          accentColor: '#676FFF',     
          showWalletLoginFirst: false, 
        },

        // Embedded Wallets: Wajib ada agar user login Email otomatis punya wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },

        // Konfigurasi Jaringan (EVM Networks)
        // Array ini menentukan jaringan apa saja yang didukung aplikasi Anda
        supportedChains: [mainnet, base, bsc],
        
        // Jaringan default saat user pertama kali connect
        // Anda bisa ubah ini ke 'base' atau 'bsc' jika ingin defaultnya bukan Ethereum
        defaultChain: mainnet, 
      }}
    >
      {children}
    </PrivyProvider>
  );
}