// import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import {
  ArrowRight
  , CheckCircle
} from 'lucide-react';
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6"; // for X (Twitter)

import bg from '../assets/bg.webp';
import btc from '../assets/bitc.webp';
import brain from '../assets/brain.webp';
import { Button } from '../pages/Button';
// If your Button component is located elsewhere, update the path accordingly.

// import TestimonialsMarquee from '../components/TestimonialsMarquee';

const About: React.FC = () => {

  const currentYear = new Date().getFullYear();

  // Platform fee information
  const platformFee = 0.08;
  const networkFee = 0.02;
  const totalFee = platformFee + networkFee;

  const stats = [
    { value: "1,247", label: "Tokens Created", suffix: "+" },
    { value: "0.1", label: "SOL to Start", suffix: "" },
    { value: "99.9", label: "Uptime", suffix: "%" },
    { value: "24/7", label: "Support", suffix: "" }
  ];
  const features = [
    {
      title: "AI-Powered",
      description: "Smart contract generation with artificial intelligence",
      image: "https://d64gsuwffb70l.cloudfront.net/68ad6c88b21b3752ff70f81c_1756196708904_90887354.webp",
      gradient: "from-lime-400 to-green-500"
    },
    {
      title: "Lightning Fast",
      description: "Deploy tokens faster than you can say 'blockchain'",
      image: "https://d64gsuwffb70l.cloudfront.net/68ad6c88b21b3752ff70f81c_1756196713001_bcf41366.webp",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      title: "Zero Code",
      description: "Visual interface that makes complexity disappear",
      image: "https://d64gsuwffb70l.cloudfront.net/68ad6c88b21b3752ff70f81c_1756196705196_5272a25c.webp",
      gradient: "from-emerald-400 to-teal-500"
    }
  ];
  const steps = [
    {
      number: "01",
      title: "Dream It",
      description: "Imagine your perfect token. Name it, define it, make it yours.",
      color: "lime-400"
    },
    {
      number: "02",
      title: "Build It",
      description: "Our AI transforms your vision into smart contract reality.",
      color: "green-400"
    },
    {
      number: "03",
      title: "Launch It",
      description: "Deploy to Solana and watch your creation come alive.",
      color: "emerald-400"
    }
  ];
  const testimonials = [
    {
      quote: "TokenStudio turned my idea into reality in 2 minutes. Mind = blown.",
      author: "Alex Chen",
      role: "DeFi Builder",
      rating: 5
    },
    {
      quote: "Finally, a platform that doesn't require a PhD in blockchain.",
      author: "Sarah Kim",
      role: "NFT Artist",
      rating: 5
    },
    {
      quote: "The future of token creation is here, and it's beautiful.",
      author: "Mike Rodriguez",
      role: "Crypto Entrepreneur",
      rating: 5
    }
  ];


  return (
    <>
      <SEO
        title="Solana Token Builder | TokenStudio"
        description="Create your own Solana SPL token in seconds. No coding required. Free and easy token creation on Solana blockchain."
      />
      <div className="min-h-screen overflow-hidden">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="absolute inset-0 opacity-20">
              <img
                src={bg}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-32 h-32 animate-bounce">
            <img
              src={btc}
              alt=""
              className="w-full h-full object-contain rounded-full opacity-60"
            />
          </div>

          <div className="absolute top-1/3 right-20 w-40 h-40 animate-spin-slow">
            <img
              src={brain}
              alt=""
              className="w-full h-full object-contain rounded-full opacity-60"
            />
          </div>

          <div className="absolute bottom-32 right-16 w-24 h-24 animate-pulse">
            <img
              src={brain}
              alt=""
              className="w-full h-full object-contain rounded-full opacity-40"
            />
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
            <div className="mb-8">
              <h1 className="text-8xl md:text-9xl font-black mb-6 leading-none">
                <span className="bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
                  TOKEN
                </span>
                <br />
                <span className="text-white">STUDIO</span>
              </h1>

              <div className="relative">
                <p className="text-2xl md:text-3xl text-gray-300 font-light mb-8 max-w-3xl mx-auto">
                  Create <span className="text-lime-400 font-bold">Solana tokens</span> in minutes, not months.
                  <br />No code. No complexity. Just pure innovation.
                </p>
              </div>
            </div>

            {/* Creative CTA Section */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-12">
              <Link
                to="/create"
                size="lg"
                className="bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold text-xl px-12 py-6 rounded-full hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-lime-400/25"
              >
                Launch Your Token
              </Link>

              <Link
                variant="outline"
                size="lg"
                className="border-2 border-lime-400 text-lime-400 font-bold text-xl px-12 py-6 rounded-full hover:bg-lime-400 hover:text-black transition-all duration-300"
              >
                See Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-lime-400">0.1</div>
                <div className="text-gray-400">SOL to start</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-lime-400">2min</div>
                <div className="text-gray-400">Deploy time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-lime-400">1000+</div>
                <div className="text-gray-400">Tokens created</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gray-800 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-lime-400/5 via-transparent to-green-400/5"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center group hover:scale-110 transition-transform duration-300"
                >
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 group-hover:border-lime-400/50 transition-colors duration-300">
                    <div className="text-4xl md:text-5xl font-black text-lime-400 mb-2">
                      {stat.value}
                      <span className="text-2xl">{stat.suffix}</span>
                    </div>
                    <div className="text-gray-400 font-medium text-lg">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-6 bg-gray-900 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-lime-400/10 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-6xl md:text-7xl font-black text-white mb-6">
                Why Choose
                <span className="bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent block">
                  TokenStudio?
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                We've reimagined token creation from the ground up
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 hover:border-lime-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-lime-400/10"
                >
                  {/* Feature Image */}
                  <div className="relative mb-8 h-48 overflow-hidden rounded-2xl">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                  </div>

                  {/* Content */}
                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-lime-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-6 bg-gradient-to-b from-gray-900 to-gray-800 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-6xl md:text-7xl font-black text-white mb-6">
                The Magic
                <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent block">
                  Happens Here
                </span>
              </h2>
            </div>

            <div className="relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 transform -translate-y-1/2 opacity-30"></div>

              <div className="grid md:grid-cols-3 gap-16 relative z-10">
                {steps.map((step, index) => (
                  <div key={index} className="text-center group">
                    {/* Step Number */}
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-800 border-4 border-${step.color} mb-8 group-hover:scale-110 transition-transform duration-300`}>
                      <span className={`text-3xl font-black text-${step.color}`}>
                        {step.number}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-4xl font-bold text-white mb-6 group-hover:text-lime-400 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-sm mx-auto">
                      {step.description}
                    </p>

                    {/* Decorative Element */}
                    <div className={`mt-8 w-16 h-1 bg-gradient-to-r from-${step.color} to-transparent mx-auto opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-20">
              <Link
                to="/create"
                className="inline-block bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold text-2xl px-16 py-6 rounded-full hover:scale-105 transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-lime-400/25">
                Start Creating Now
              </Link>
            </div>
          </div>
        </section>

        <section className="py-32 px-6 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-400/10 rounded-full blur-2xl animate-bounce delay-500"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-6xl md:text-7xl font-black text-white mb-6">
                Creators
                <span className="bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent block">
                  Love Us
                </span>
              </h2>
              <p className="text-xl text-gray-400">Join thousands who've already launched their vision</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="group relative bg-gray-800/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 hover:border-lime-400/50 transition-all duration-500 hover:scale-105"
                >
                  {/* Quote */}
                  <div className="mb-6">
                    <div className="text-6xl text-lime-400/20 font-black leading-none">"</div>
                    <p className="text-xl text-gray-300 leading-relaxed -mt-4">
                      {testimonial.quote}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-lime-400 rounded-full"></div>
                    ))}
                  </div>

                  {/* Author */}
                  <div>
                    <div className="font-bold text-white text-lg">{testimonial.author}</div>
                    <div className="text-gray-400">{testimonial.role}</div>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-400/5 to-green-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>

            {/* Community CTA */}
            <div className="text-center mt-20">
              <div className="inline-block">
                <h3 className="text-4xl font-bold text-white mb-8">Ready to join them?</h3>
                <Link
                  to={"/create"}
                  className="bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold text-xl px-12 py-4 rounded-full hover:scale-105 transition-all duration-300 cursor-pointer">
                  Create Your Token
                </Link>
              </div>
            </div>
          </div>
        </section>



        <footer className="bg-gray-900 border-t border-gray-800 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12">
              {/* Brand */}
              <div className="md:col-span-2 ">
                <div className="flex items-center">
                  <Link to="/" className="flex items-center space-x-2 mb-5">
                    <img src="token.png" alt="token" width={200} />
                  </Link>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                  The future of token creation. No code required, just pure innovation on Solana.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-white font-bold text-lg mb-4">Platform</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="/create" className="text-gray-400 hover:text-lime-400 transition-colors">
                      Create Token
                    </a>
                  </li>
                </ul>
              </div>

              {/* Social */}
              <div>
                <h4 className="text-white font-bold text-lg mb-4">Social</h4>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/profile.php?id=61579884360872" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lime-400 transition-colors text-xl">
                    <FaFacebookF />
                  </a>
                  <a href="https://x.com/token_studi0?t=_H2LpfGuT60HJ9iqbRyaVw&s=09" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lime-400 transition-colors text-xl">
                    <FaXTwitter />
                  </a>
                  <a href="https://www.instagram.com/token_studi0/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lime-400 transition-colors text-xl">
                    <FaInstagram />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <p className="text-gray-500">
                © {currentYear} TokenStudio. Built on Solana with ❤️
              </p>
            </div>
          </div>
        </footer>



      </div>
    </>
  );
};

export default About;