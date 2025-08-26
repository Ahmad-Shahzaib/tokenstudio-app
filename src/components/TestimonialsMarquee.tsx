
// import { FaStar } from "react-icons/fa";
import { Star } from "lucide-react";

export default function TestimonialsMarquee() {
    const reviews = [
        {
            name: "Sarah Johnson",
            image: "https://randomuser.me/api/portraits/women/44.jpg",
            rating: 5,
            text: "This platform streamlined our launch process—fast, secure, and reliable.",
        },
        {
            name: "Michael Chen",
            image: "https://randomuser.me/api/portraits/men/46.jpg",
            rating: 4,
            text: "Excellent experience! The tools are intuitive and save us months of effort.",
        },
        {
            name: "Emily Davis",
            image: "https://randomuser.me/api/portraits/women/65.jpg",
            rating: 5,
            text: "The support team was responsive and ensured a smooth launch for us.",
        },
        {
            name: "David Lee",
            image: "https://randomuser.me/api/portraits/men/22.jpg",
            rating: 5,
            text: "Highly recommended! The security and uptime have been rock-solid.",
        },
    ];

    // Render stars
    const Stars = ({ count }: { count: number }) => (
        <div className="flex gap-1">
            {[...Array(count)].map((_, i) => (
                // <Star key={i} className="text-yellow-400" />
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                // <p>h</p>
            ))}
        </div>
    );

    return (
        <section className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-16 overflow-hidden">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Trusted by Industry Leaders
                </h2>
                <p className="text-gray-400 mt-2">
                    Hear from companies who scaled faster with our platform
                </p>
            </div>

            {/* Row 1 (left to right) */}
            <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)] mb-8">
                <div className="flex animate-marquee gap-6">
                    {[...reviews, ...reviews].map((review, i) => (
                        <div
                            key={i}
                            className="min-w-[280px] bg-gray-900 rounded-xl p-6 shadow-md border border-gray-800"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <img
                                    src={review.image}
                                    alt={review.name}
                                    width={50}
                                    height={50}
                                    className="rounded-full"
                                />
                                <div>
                                    <h4 className="text-white font-semibold">{review.name}</h4>
                                    <Stars count={review.rating} />
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm">{review.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 2 (right to left) */}
            <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)]">
                <div className="flex animate-marquee-reverse gap-6">
                    {[...reviews, ...reviews].map((review, i) => (
                        <div
                            key={i}
                            className="min-w-[280px] bg-gray-900 rounded-xl p-6 shadow-md border border-gray-800"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <img
                                    src={review.image}
                                    alt={review.name}
                                    width={50}
                                    height={50}
                                    className="rounded-full"
                                />
                                <div>
                                    <h4 className="text-white font-semibold">{review.name}</h4>
                                    <Stars count={review.rating} />
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm">{review.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
