import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Rocket, Star, Code, Globe, Users, TrendingUp, CheckCircle, Sparkles, Layers, Lock } from 'lucide-react';
// import TestimonialsMarquee from '../components/TestimonialsMarquee';
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Animated Background */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">Next-Gen Token Platform</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              SOLANA TOKEN
            </span>
            <br />
            <span className="text-white">FORGE 2025</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            The most advanced platform for creating and deploying Solana tokens.
            Launch your project with enterprise-grade security, lightning-fast deployment,
            and institutional-level infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              to="/create"
              className="group bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-10 py-5 rounded-2xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center space-x-3 shadow-2xl hover:shadow-purple-500/25"
            >
              <span>Launch Your Token</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="group border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-10 py-5 rounded-2xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center space-x-3">
              <span>Watch Demo</span>
              <div className="w-3 h-3 bg-purple-400 group-hover:bg-white rounded-full animate-pulse"></div>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-400 text-sm">Tokens Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$2.5B+</div>
              <div className="text-gray-400 text-sm">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99.99%</div>
              <div className="text-gray-400 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400 text-sm">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">TokenForge</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built for the future of decentralized finance with cutting-edge technology and unmatched security.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Deploy your tokens in under 30 seconds with our optimized smart contracts and automated deployment pipeline.
              </p>
              <div className="flex items-center space-x-2 text-cyan-400 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Sub-second confirmation</span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Enterprise Security</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Bank-grade security with multi-signature wallets, smart contract audits, and advanced encryption protocols.
              </p>
              <div className="flex items-center space-x-2 text-cyan-400 text-sm font-medium">
                <Lock className="w-4 h-4" />
                <span>Audited by top firms</span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Launch Ready</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Complete tokenomics setup, liquidity pool creation, and marketplace listing - all in one seamless flow.
              </p>
              <div className="flex items-center space-x-2 text-cyan-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>Instant market access</span>
              </div>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 hover:border-purple-500/30 transition-all">
              <Code className="w-8 h-8 text-purple-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">No Code Required</h4>
              <p className="text-gray-400 text-sm">Create tokens without any programming knowledge</p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 hover:border-cyan-500/30 transition-all">
              <Globe className="w-8 h-8 text-cyan-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Global Access</h4>
              <p className="text-gray-400 text-sm">Available worldwide with multi-language support</p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 hover:border-green-500/30 transition-all">
              <Users className="w-8 h-8 text-green-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Community Driven</h4>
              <p className="text-gray-400 text-sm">Join thousands of successful token creators</p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 hover:border-yellow-500/30 transition-all">
              <Layers className="w-8 h-8 text-yellow-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Advanced Tools</h4>
              <p className="text-gray-400 text-sm">Professional-grade analytics and management</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Launch in <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-400">From concept to launch in minutes, not months</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Configure Token</h3>
              <p className="text-gray-400 leading-relaxed">
                Set your token name, symbol, supply, and other parameters using our intuitive interface.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Deploy & Mint</h3>
              <p className="text-gray-400 leading-relaxed">
                Our platform handles the complex blockchain interactions and deploys your token securely.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Launch & Grow</h3>
              <p className="text-gray-400 leading-relaxed">
                Access advanced tools for marketing, liquidity management, and community building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600/10 via-slate-800/50 to-cyan-600/10 rounded-3xl p-12 backdrop-blur-lg border border-white/10 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 transform rotate-12 scale-150"></div>
            </div>

            <div className="relative grid md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">50K+</div>
                <div className="text-gray-300 font-medium">Tokens Created</div>
                <div className="text-sm text-gray-400 mt-1">This month: +2.5K</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">$2.5B+</div>
                <div className="text-gray-300 font-medium">Total Market Cap</div>
                <div className="text-sm text-gray-400 mt-1">24h change: +15%</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">99.99%</div>
                <div className="text-gray-300 font-medium">Platform Uptime</div>
                <div className="text-sm text-gray-400 mt-1">Enterprise SLA</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">24/7</div>
                <div className="text-gray-300 font-medium">Expert Support</div>
                <div className="text-sm text-gray-400 mt-1">Avg response: 2min</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Industry Leaders</span>
            </h2>
            <p className="text-xl text-gray-400">Join the ecosystem of successful projects</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all transform hover:scale-105">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                "TokenForge revolutionized our token launch. The entire process was seamless, and we raised $2M in our first week. The security features gave our investors complete confidence."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">SC</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Sarah Chen</div>
                  <div className="text-gray-400">CEO, DeFi Innovations</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all transform hover:scale-105">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                "The advanced analytics and automated deployment saved us 6 months of development time. TokenForge is the gold standard for professional token launches."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">MR</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Marcus Rodriguez</div>
                  <div className="text-gray-400">CTO, Blockchain Ventures</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-green-500/50 transition-all transform hover:scale-105">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                "From concept to market in 48 hours. TokenForge's platform is incredibly powerful yet simple to use. Our token is now trading on major exchanges."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">AK</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Alex Kim</div>
                  <div className="text-gray-400">Founder, NextGen Protocol</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <TestimonialsMarquee /> */}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-3xl p-12 border border-slate-700/50">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Ready to Launch Your <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Token Empire</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of successful projects that chose TokenForge for their token deployment.
              Start building the future of decentralized finance today.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/create"
                className="group bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-12 py-6 rounded-2xl text-xl font-semibold transition-all transform hover:scale-105 inline-flex items-center space-x-3 shadow-2xl hover:shadow-purple-500/25"
              >
                <span>Start Building Now</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Starting at</div>
                <div className="text-2xl font-bold text-white">0.1 SOL</div>
                <div className="text-sm text-gray-400">per token</div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Instant deployment</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;