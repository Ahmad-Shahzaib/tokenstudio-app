import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Zap, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import { useWalletContext } from '../contexts/WalletContext';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { connected, publicKey, connecting, connect, disconnect } = useWalletContext();
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const fetchBalance = async () => {
    if (!connected || !publicKey) return;

    setLoadingBalance(true);
    try {
      // Create a new connection
      // const connection = new Connection('https://api.devnet.solana.com');

      const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=cf83b40d-47c1-4e6d-ac47-cdf35e878b6d');
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchSolPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      setSolPrice(data.solana.usd);
    } catch (error) {
      console.error('Error fetching SOL price:', error);
    }
  };

  useEffect(() => {
    if (connected) {
      fetchBalance();
      fetchSolPrice();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('wallet-dropdown');
      const button = document.getElementById('wallet-button');

      if (dropdownOpen &&
        dropdown &&
        button &&
        !dropdown.contains(event.target as Node) &&
        !button.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      // Add a toast notification here if needed
    }
  };

  const openInExplorer = () => {
    if (publicKey) {
      // window.open(`https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`, '_blank');
      window.open(`https://explorer.solana.com/address/${publicKey.toString()}`, '_blank');

    }
  };

  return (
    <nav className="bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#1e293b] backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src="token.png" alt="token" width={200} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="relative px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white 
             hover:after:absolute hover:after:bottom-0 hover:after:left-0 
             hover:after:w-full hover:after:h-[2px] 
             hover:after:bg-gradient-to-r hover:after:from-[#10B981] hover:after:to-[#A3E635]"
              >
                Home
              </Link>

              <Link
                to="/create"
                className="relative px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white 
             hover:after:absolute hover:after:bottom-0 hover:after:left-0 
             hover:after:w-full hover:after:h-[2px] 
             hover:after:bg-gradient-to-r hover:after:from-[#10B981] hover:after:to-[#A3E635]"
              >
                Token Creator
              </Link>

              <Link
                to="/dashboard"
                className="relative px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white 
             hover:after:absolute hover:after:bottom-0 hover:after:left-0 
             hover:after:w-full hover:after:h-[2px] 
             hover:after:bg-gradient-to-r hover:after:from-[#10B981] hover:after:to-[#A3E635]"
              >
                Dashboard
              </Link> 

               <Link
                to="/airdrop"
                className="relative px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white 
             hover:after:absolute hover:after:bottom-0 hover:after:left-0 
             hover:after:w-full hover:after:h-[2px] 
             hover:after:bg-gradient-to-r hover:after:from-[#10B981] hover:after:to-[#A3E635]"
              >
                Airdrop 
              </Link> 
            </div>
          </div>

          {/* Wallet Button */}
          <div className="flex items-center">
            {connected ? (
              <div className="relative">
                <button
                  id="wallet-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 bg-[#0f172a]/60 backdrop-blur-lg border border-white/10 hover:border-emerald-400/50 px-4 py-2 rounded-lg transition-all"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#10B981] to-[#A3E635] rounded-full flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-white font-medium">
                        {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {loadingBalance ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : balance !== null ? (
                          `${balance.toFixed(2)} SOL`
                        ) : (
                          'Balance unavailable'
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    id="wallet-dropdown"
                    className="absolute right-0 mt-2 w-64 bg-[#0f172a]/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl z-50"
                  >
                    <div className="p-4 border-b border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
                      <div className="text-white font-mono text-sm break-all">
                        {publicKey?.toString()}
                      </div>
                      <div className="text-sm text-gray-400 mt-2 mb-1">Balance</div>
                      <div className="text-white font-medium">
                        {loadingBalance ? (
                          <span className="animate-pulse">Loading balance...</span>
                        ) : balance !== null ? (
                          <div className="flex items-center justify-between">
                            <span>{balance.toFixed(6)} SOL</span>
                            {solPrice && (
                              <span className="text-gray-400 text-xs">
                                ≈ ${(balance * solPrice).toFixed(2)} USD
                              </span>
                            )}
                          </div>
                        ) : (
                          'Balance unavailable'
                        )}
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={copyAddress}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-md transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy Address</span>
                      </button>
                      <button
                        onClick={openInExplorer}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View in Explorer</span>
                      </button>
                      <button
                        onClick={() => {
                          fetchBalance();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-md transition-colors"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Refresh Balance</span>
                      </button>
                      <div className="border-t border-white/10 mt-2 pt-2">
                        <button
                          onClick={() => {
                            disconnect();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="bg-gradient-to-r from-[#10B981] to-[#A3E635] hover:from-emerald-600 hover:to-lime-500 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a]/95 backdrop-blur-lg border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/')
                ? 'bg-gradient-to-r from-[#10B981] to-[#A3E635] text-gray-900'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/create"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/create')
                ? 'bg-gradient-to-r from-[#10B981] to-[#A3E635] text-gray-900'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Token Creator
            </Link>
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/dashboard')
                ? 'bg-gradient-to-r from-[#10B981] to-[#A3E635] text-gray-900'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>

             <Link
              to="/airdrop"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/airdrop')
                ? 'bg-gradient-to-r from-[#10B981] to-[#A3E635] text-gray-900'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Airdrop
            </Link>
          </div>

          {connected && (
            <div className="pt-4 pb-3 border-t border-white/10 px-3">
              <div className="flex items-center px-3 py-2">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#10B981] to-[#A3E635] rounded-full flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <div className="text-sm text-white font-medium">
                    {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {loadingBalance ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : balance !== null ? (
                      `${balance.toFixed(2)} SOL`
                    ) : (
                      'Balance unavailable'
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={copyAddress}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/10"
                >
                  Copy Address
                </button>
                <button
                  onClick={openInExplorer}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/10"
                >
                  View in Explorer
                </button>
                <button
                  onClick={fetchBalance}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/10"
                >
                  Refresh Balance
                </button>
                <button
                  onClick={() => {
                    disconnect();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>

  );
};

export default Navbar;