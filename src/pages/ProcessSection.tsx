import React from 'react'
import { Cog, Rocket, TrendingUp } from "lucide-react"

const ProcessSection = () => {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Heading */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Get Started in{" "}
                        <span className="bg-gradient-to-r from-[#10B981] to-[#A3E635] bg-clip-text text-transparent">
                            3 Easy Steps
                        </span>
                    </h2>
                    <p className="text-xl text-gray-300">
                        Build and launch with clarity — simple, fast, and professional
                    </p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-10">

                    {/* Step 1 */}
                    <div className="group relative p-8 rounded-2xl bg-[#111827]/60 border border-[#10B981]/20 hover:border-[#A3E635]/40 transition-all shadow-lg hover:shadow-[#10B981]/20">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#10B981] to-[#A3E635] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Cog className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-4">Configure</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Define your project name, symbol, and supply with an easy-to-use interface.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="group relative p-8 rounded-2xl bg-[#111827]/60 border border-[#10B981]/20 hover:border-[#A3E635]/40 transition-all shadow-lg hover:shadow-[#10B981]/20">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#10B981] to-[#A3E635] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Rocket className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-4">Deploy</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Securely deploy your setup with just a click — no complex steps required.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="group relative p-8 rounded-2xl bg-[#111827]/60 border border-[#10B981]/20 hover:border-[#A3E635]/40 transition-all shadow-lg hover:shadow-[#10B981]/20">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#10B981] to-[#A3E635] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-4">Launch</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Unlock professional tools for growth, marketing, and community building.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProcessSection
