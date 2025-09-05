import React, { useState, useEffect } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { Wallet, TrendingUp, Coins, Activity, Copy, ExternalLink, Trash2, RefreshCw, Image, Plus, ChevronRight, BarChart3 } from 'lucide-react';
import { getTokensByCreator, deleteToken, CreatedToken } from '../utils/tokenStorage';
import { getStoredImageData } from '../utils/ipfs';

const Dashboard: React.FC = () => {
  const { connected, publicKey } = useWalletContext();
  const [tokens, setTokens] = useState<CreatedToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens'>('overview');

  useEffect(() => {
    if (connected && publicKey) {
      loadTokens();
    }
  }, [connected, publicKey]);

  const loadTokens = () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const userTokens = getTokensByCreator(publicKey.toString());
      setTokens(userTokens);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDeleteToken = (mintAddress: string) => {
    if (window.confirm('Are you sure you want to remove this token from your dashboard? This will not affect the actual token on the blockchain.')) {
      deleteToken(mintAddress);
      loadTokens();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCompactAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const calculateStats = () => {
    const totalTokens = tokens.length;
    const totalSupply = tokens.reduce((sum, token) => sum + token.supply, 0);
    const totalTransactions = tokens.length;
    
    return {
      totalTokens,
      totalSupply,
      totalTransactions
    };
  };

  const getTokenImage = (token: CreatedToken) => {
    if (token.imageUrl) {
      const storedImage = getStoredImageData(token.imageUrl);
      if (storedImage) {
        return storedImage;
      }
      return token.imageUrl;
    }
    return null;
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="p-8 bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Please connect your Solana wallet to view your dashboard.
            </p>
            <div className="text-sm text-gray-500">
              Supported wallets: Phantom, Solflare, Torus
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl text-lime-400 font-bold mb-2 ">
              Token Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your tokens and track your portfolio performance.
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2 bg-slate-800/40 py-2 px-4 rounded-lg border border-slate-700/30">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Connected</span>
            </div>
            <button
              onClick={loadTokens}
              disabled={loading}
              className="p-2 bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/30 rounded-lg transition-colors duration-200 disabled:opacity-50"
              title="Refresh tokens"
            >
              <RefreshCw className={`w-5 h-5 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-700/30 mb-8">
          <button
            className={`py-3 px-6 font-medium text-sm flex items-center space-x-2 ${activeTab === 'overview' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm flex items-center space-x-2 ${activeTab === 'tokens' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('tokens')}
          >
            <Coins className="w-4 h-4" />
            <span>Your Tokens</span>
            <span className="bg-slate-700 text-gray-300 text-xs py-0.5 px-2 rounded-full">
              {tokens.length}
            </span>
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="mb-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 shadow-lg hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Coins className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                    +2.5%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stats.totalTokens}</h3>
                <p className="text-gray-400 text-sm">Tokens Created</p>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 shadow-lg hover:border-green-500/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                    +5.1%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stats.totalSupply.toLocaleString()}</h3>
                <p className="text-gray-400 text-sm">Total Supply</p>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 shadow-lg hover:border-purple-500/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                    +7.3%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stats.totalTransactions}</h3>
                <p className="text-gray-400 text-sm">Transactions</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 shadow-lg mb-8">
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/create"
                  className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-slate-700/30 rounded-xl hover:border-cyan-500/40 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Create Token</h3>
                  <p className="text-gray-400 text-sm text-center">Generate a new token on the Solana blockchain</p>
                </a>
                
                <div className="flex flex-col items-center justify-center p-6 bg-slate-700/20 border border-slate-700/30 rounded-xl">
                  <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
                  <p className="text-gray-400 text-sm text-center">Track your token performance (Coming Soon)</p>
                </div>
                
                <div className="flex flex-col items-center justify-center p-6 bg-slate-700/20 border border-slate-700/30 rounded-xl">
                 <a
                  href="/airdrop">
                  <div className="w-12 h-12 bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold rounded-lg flex items-center justify-center mb-4">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Airdrop</h3>
                  <p className="text-gray-400 text-sm text-center">Distribute tokens to multiple wallets </p>
                  </a>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              {tokens.length > 0 ? (
                <div className="space-y-4">
                  {tokens.slice(0, 3).map((token) => (
                    <div key={token.mintAddress} className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg border border-slate-700/30">
                      <div className="flex items-center space-x-4">
                        {getTokenImage(token) ? (
                          <img
                            src={getTokenImage(token)}
                            alt={token.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {token.symbol.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-white">{token.name}</h3>
                          <p className="text-xs text-gray-400">Created on {formatDate(token.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{token.supply.toLocaleString()} {token.symbol}</p>
                        <p className="text-xs text-gray-400">Supply</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Coins className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tokens Tab Content */}
        {activeTab === 'tokens' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-400">Loading your tokens...</p>
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-8 shadow-lg">
                <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Coins className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Tokens Created Yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You haven't created any tokens yet. Start by generating your first token on the Solana blockchain.
                </p>
                <a
                  href="/generate"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Token</span>
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tokens.map((token) => {
                  const tokenImage = getTokenImage(token);
                  
                  return (
                    <div
                      key={token.mintAddress}
                      className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {/* Token Header with Image */}
                      <div className="relative h-32 bg-gradient-to-r from-purple-900/30 to-cyan-900/30">
                        {tokenImage ? (
                          <img
                            src={tokenImage}
                            alt={token.name}
                            className="w-full h-full object-cover opacity-70"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl font-bold text-white opacity-30">
                              {token.symbol}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                        
                        {/* Token symbol badge */}
                        <div className="absolute top-4 left-4 bg-slate-900/80 text-white py-1 px-3 rounded-full text-xs font-medium backdrop-blur-sm">
                          {token.symbol}
                        </div>
                        
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteToken(token.mintAddress)}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-200"
                          title="Remove from dashboard"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        
                        {/* Token name */}
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-xl font-bold text-white">{token.name}</h3>
                          <p className="text-gray-300 text-sm">Created {formatDate(token.createdAt)}</p>
                        </div>
                      </div>

                      {/* Token Details */}
                      <div className="p-5">
                        {/* Description */}
                        {token.description && (
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{token.description}</p>
                        )}
                        
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-slate-700/20 p-3 rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">Supply</p>
                            <p className="text-white font-semibold">{token.supply.toLocaleString()}</p>
                          </div>
                          <div className="bg-slate-700/20 p-3 rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">Decimals</p>
                            <p className="text-white font-semibold">{token.decimals}</p>
                          </div>
                        </div>
                        
                        {/* Mint Address */}
                        <div className="mb-4">
                          <p className="text-gray-400 text-xs mb-2">Mint Address</p>
                          <div className="flex items-center justify-between bg-slate-700/20 p-2 rounded-lg">
                            <span className="text-white font-mono text-xs">
                              {formatCompactAddress(token.mintAddress)}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => copyToClipboard(token.mintAddress, `mint-${token.mintAddress}`)}
                                className="p-1 hover:bg-slate-600 rounded transition-colors"
                                title="Copy mint address"
                              >
                                <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                              </button>
                              <a
                                href={`https://explorer.solana.com/address/${token.mintAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-slate-600 rounded transition-colors"
                                title="View on Solana Explorer"
                              >
                                <ExternalLink className="w-3 h-3 text-gray-400 hover:text-white" />
                              </a>
                            </div>
                          </div>
                          {copied === `mint-${token.mintAddress}` && (
                            <span className="text-green-400 text-xs mt-1">Copied to clipboard!</span>
                          )}
                        </div>
                        
                        {/* Transaction Signature */}
                        <div>
                          <p className="text-gray-400 text-xs mb-2">Transaction</p>
                          <div className="flex items-center justify-between bg-slate-700/20 p-2 rounded-lg">
                            <span className="text-white font-mono text-xs">
                              {formatCompactAddress(token.transactionSignature)}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => copyToClipboard(token.transactionSignature, `tx-${token.mintAddress}`)}
                                className="p-1 hover:bg-slate-600 rounded transition-colors"
                                title="Copy transaction signature"
                              >
                                <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                              </button>
                              <a
                                href={`https://explorer.solana.com/tx/${token.transactionSignature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-slate-600 rounded transition-colors"
                                title="View on Solana Explorer"
                              >
                                <ExternalLink className="w-3 h-3 text-gray-400 hover:text-white" />
                              </a>
                            </div>
                          </div>
                          {copied === `tx-${token.mintAddress}` && (
                            <span className="text-green-400 text-xs mt-1">Copied to clipboard!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;