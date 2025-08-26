"use client";
import { useState } from "react";

const faqs = [
    {
        question: "What is Token Studio?",
        answer:
            "Token Studio is a platform that allows you to easily create, manage, and deploy blockchain tokens without requiring deep technical knowledge.",
    },
    {
        question: "Do I need coding skills to use Token Studio?",
        answer:
            "No coding skills are required. Token Studio provides an intuitive interface so anyone can launch tokens and manage them securely.",
    },
    {
        question: "Which blockchains does Token Studio support?",
        answer:
            "Currently, Token Studio supports Ethereum, Binance Smart Chain, and Polygon, with more networks planned for future updates.",
    },
    {
        question: "How secure is Token Studio?",
        answer:
            "We use industry-standard encryption, smart contract audits, and multi-layer security to ensure your tokens and data remain safe.",
    },
    {
        question: "Can I customize my tokens?",
        answer:
            "Yes, Token Studio allows you to fully customize your tokens, including supply, name, symbol, and advanced features such as burning and minting.",
    },
];

export default function FAQ() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    return (
        <section
            id="faq"
            className="py-20 px-4 sm:px-6 lg:px-8 "
        >
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Frequently Asked{" "}
                        <span className="bg-gradient-to-r from-[#10B981] to-[#A3E635] bg-clip-text text-transparent">
                            Questions
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400">
                        Everything you need to know about Token Studio
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="mb-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 overflow-hidden"
                        >
                            <button
                                className="w-full flex justify-between items-center p-6 text-left"
                                onClick={() => toggleFaq(index)}
                            >
                                <h3 className="text-xl font-semibold text-white">
                                    {faq.question}
                                </h3>
                                <div
                                    className={`transform transition-transform ${activeFaq === index ? "rotate-180" : ""
                                        }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${activeFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="p-6 pt-0 text-gray-300 border-t border-slate-700/30">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
