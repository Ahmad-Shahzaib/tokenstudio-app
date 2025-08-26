import { Cpu, BarChart3, Wallet, Network } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        title: "Smart Automation",
        description: "Automated token deployment with gas optimization and seamless execution.",
        icon: Cpu,
    },
    {
        title: "Advanced Analytics",
        description: "Track performance with real-time insights and professional dashboards.",
        icon: BarChart3,
    },
    {
        title: "Secure Wallets",
        description: "Multi-chain, multi-sig wallets designed for institutional-grade security.",
        icon: Wallet,
    },
    {
        title: "Seamless Integration",
        description: "Connect effortlessly with DEXs, bridges, and DeFi protocols.",
        icon: Network,
    },
];

export default function WhyChooseCards() {
    return (
        <>
            <div className="max-w-7xl mx-auto"> {/* Heading */} <div className="text-center mb-16"> <h2 className="text-5xl md:text-6xl font-bold text-white mb-6"> Why Choose{" "} <span className="bg-gradient-to-r from-[#10B981] to-[#A3E635] bg-clip-text text-transparent"> Token Studio </span> ? </h2> <p className="text-xl text-gray-400 max-w-3xl mx-auto"> Empowering the next generation of decentralized finance with trust, speed, and innovation. </p> </div> </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 px-6">


                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        whileHover={{ scale: 1.05, rotate: 1 }}
                        className="group cursor-pointer relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-emerald-500/20 hover:border-emerald-400/40 shadow-lg hover:shadow-emerald-500/20 transition-all"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/10 to-[#A3E635]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#10B981] to-[#A3E635] shadow-md group-hover:scale-110 transition-transform">
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>
                            <h4 className="text-xl font-semibold text-white mb-2">{feature.title}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </>
    );
}
