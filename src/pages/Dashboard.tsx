import React, { useState, useEffect } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { Wallet, TrendingUp, Coins, Activity, Copy, ExternalLink, Trash2, RefreshCw, Image } from 'lucide-react';
import { getTokensByCreator, deleteToken, CreatedToken } from '../utils/tokenStorage';
import { getStoredImageData } from '../utils/ipfs';

const Dashboard: React.FC = () => {
  const { connected, publicKey } = useWalletContext();
  const [tokens, setTokens] = useState<CreatedToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string>('');

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateStats = () => {
    const totalTokens = tokens.length;
    const totalSupply = tokens.reduce((sum, token) => sum + token.supply, 0);
    const totalTransactions = tokens.length; // Each token creation is one transaction
    
    return {
      totalTokens,
      totalSupply,
      totalTransactions
    };
  };

  const getTokenImage = (token: CreatedToken) => {
    if (token.imageUrl) {
      // Try to get stored image data first
      const storedImage = getStoredImageData(token.imageUrl);
      if (storedImage) {
        return storedImage;
      }
      // Fallback to original URL
      return token.imageUrl;
    }
    return null;
  };

  if (!connected) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-6" />
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
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Dashboard
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Manage your tokens and track your portfolio performance.
          </p>
        </div>

        {/* Wallet Info */}
        <div className="mb-8 p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Connected Wallet</h3>
                <p className="text-gray-400 font-mono text-sm">
                  {publicKey?.toString()}
                </p>
              </div>
            </div>
            <button
              onClick={loadTokens}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{stats.totalTokens}</h3>
                <p className="text-gray-400">Tokens Created</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{stats.totalSupply.toLocaleString()}</h3>
                <p className="text-gray-400">Total Supply</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{stats.totalTransactions}</h3>
                <p className="text-gray-400">Transactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Token List */}
        <div className="p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Tokens</h2>
            {tokens.length > 0 && (
              <span className="text-sm text-gray-400">
                {tokens.length} token{tokens.length !== 1 ? 's' : ''} found
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Loading your tokens...</p>
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Tokens Yet</h3>
              <p className="text-gray-500 mb-6">
                You haven't created any tokens yet. Start by generating your first token.
              </p>
              <a
                href="/generate"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
              >
                <Coins className="w-5 h-5" />
                <span>Create Your First Token</span>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokens.map((token) => {
                const tokenImage = getTokenImage(token);
                
                return (
                  <div
                    key={token.mintAddress}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6 hover:border-slate-500/50 transition-all duration-200 group"
                  >
                    {/* Token Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {tokenImage ? (
                          <img
                            src={tokenImage}
                            alt={token.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {token.symbol.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-white">{token.name}</h3>
                          <p className="text-gray-400 text-sm">{token.symbol}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteToken(token.mintAddress)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                        title="Remove from dashboard"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    {/* Token Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Supply:</span>
                        <span className="text-white font-medium">{token.supply.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Decimals:</span>
                        <span className="text-white font-medium">{token.decimals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Created:</span>
                        <span className="text-white font-medium text-xs">{formatDate(token.createdAt)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {token.description && (
                      <div className="mb-4">
                        <p className="text-gray-300 text-sm line-clamp-2">{token.description}</p>
                      </div>
                    )}

                    {/* Mint Address */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Mint Address:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(token.mintAddress, `mint-${token.mintAddress}`)}
                            className="p-1 hover:bg-slate-600 rounded transition-colors"
                            title="Copy mint address"
                          >
                            <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                          </button>
                          <a
                            href={`https://explorer.solana.com/address/${token.mintAddress}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-slate-600 rounded transition-colors"
                            title="View on Solana Explorer"
                          >
                            <ExternalLink className="w-3 h-3 text-gray-400 hover:text-white" />
                          </a>
                        </div>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded-lg">
                        <span className="text-white font-mono text-xs break-all">
                          {token.mintAddress}
                        </span>
                        {copied === `mint-${token.mintAddress}` && (
                          <span className="text-green-400 text-xs ml-2">Copied!</span>
                        )}
                      </div>
                    </div>

                    {/* Transaction Link */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Transaction:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(token.transactionSignature, `tx-${token.mintAddress}`)}
                          className="p-1 hover:bg-slate-600 rounded transition-colors"
                          title="Copy transaction signature"
                        >
                          <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                        </button>
                        <a
                          href={`https://explorer.solana.com/tx/${token.transactionSignature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-slate-600 rounded transition-colors"
                          title="View on Solana Explorer"
                        >
                          <ExternalLink className="w-3 h-3 text-gray-400 hover:text-white" />
                        </a>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded-lg mt-2">
                      <span className="text-white font-mono text-xs break-all">
                        {token.transactionSignature}
                      </span>
                      {copied === `tx-${token.mintAddress}` && (
                        <span className="text-green-400 text-xs ml-2">Copied!</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;