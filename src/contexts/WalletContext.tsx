import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  connecting: boolean;
  balance: number | null;
  loadingBalance: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (transaction: any) => Promise<string>;
  fetchBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const network = WalletAdapterNetwork.Devnet; // Change to 'Devnet' or 'Mainnet
const endpoint = clusterApiUrl(network);

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new TorusWalletAdapter(),
];

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

function WalletContextProvider({ children }: WalletProviderProps) {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const fetchBalance = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setBalance(null);
      return;
    }

    setLoadingBalance(true);
    try {
      const connection = new Connection(endpoint);
      const balance = await connection.getBalance(wallet.publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [wallet.connected, wallet.publicKey]);

  const connect = async () => {
    try {
      setConnecting(true);

      if (!wallet.wallet) {
        setVisible(true);
        return;
      }

      await wallet.connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await wallet.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const sendTransaction = async (transaction: any) => {
    if (!wallet.sendTransaction) {
      throw new Error('Wallet does not support transaction sending');
    }

    const connection = new Connection(endpoint);
    const signature = await wallet.sendTransaction(transaction, connection);
    return signature;
  };

  const contextValue: WalletContextType = {
    connected: wallet.connected,
    publicKey: wallet.publicKey,
    connecting: connecting || wallet.connecting,
    balance,
    loadingBalance,
    connect,
    disconnect,
    sendTransaction,
    fetchBalance,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}