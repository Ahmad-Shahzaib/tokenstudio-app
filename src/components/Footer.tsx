import React from 'react';
import { X, Facebook, Youtube, Send, MessageSquare, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Social links
  const socialLinks = [
    { icon: <X className="h-4 w-4" />, url: "https://x.com/solsmint", name: "Twitter" },
    // { icon: <Facebook className="h-4 w-4" />, url: "https://facebook.com/solsmint", name: "Facebook" },
    // { icon: <Youtube className="h-4 w-4" />, url: "#", name: "YouTube" },
    // { icon: <Send className="h-4 w-4" />, url: "#", name: "TikTok" },
    // { icon: <MessageSquare className="h-4 w-4" />, url: "https://discord.gg/solsmint", name: "Discord" },
    { icon: <Send className="h-4 w-4" />, url: "https://t.me/solsmint", name: "Telegram" },
    // { icon: <Github className="h-4 w-4" />, url: "https://github.com/solsmint", name: "GitHub" },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900/80 to-slate-950 border-t border-slate-800 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-2 md:mb-0">
            © {currentYear} TokenStdio. All rights reserved.
          </div>

          <div className="flex space-x-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;