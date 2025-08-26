export default function Stats() {
    const stats = [
        { value: "50K+", label: "Tokens Created" },
        { value: "$2.5B+", label: "Total Volume" },
        { value: "99.99%", label: "Uptime" },
        { value: "24/7", label: "Support" },
    ];

    return (
        <section className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-16">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="bg-gray-900 rounded-xl shadow-md p-6 flex flex-col items-center 
                         transition transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                        >
                            <h3 className="text-3xl md:text-4xl font-extrabold text-[#93de1a] hover:text-white">
                                {stat.value}
                            </h3>
                            <p className="mt-2 text-gray-400">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
