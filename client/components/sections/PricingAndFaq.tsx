import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export function PricingAndFAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqItems: FAQItem[] = [
    {
      question: "How is contextual plagiarism different from plagiarism?",
      answer:
        "Traditional plagiarism checks look for matching text. Contextual plagiarism identifies idea-level overlap and reused reasoning, even when wording is different. It helps prevent content from sounding familiar or recycled.",
    },
    {
      question: "Should I aim for 100 out of 100 scores?",
      answer:
        "No. Scores are signals, not a finish line. An AI content checker helps optimize content for search systems and AI readers, but final decisions should come from content marketers, editors, and subject experts. Content is written for people first, and human judgment is essential before publishing.",
    },
    {
      question: "What makes Centauri different from other SEO tools?",
      answer:
        "Centauri combines AI-powered content analysis with SEO metrics to give you a complete view of your content's performance. We analyze both technical SEO and content quality in a single tool.",
    },
    {
      question: "Can I integrate Centauri with my existing tools?",
      answer:
        "Yes, Centauri provides API access and integrations with popular content management systems. Check our documentation for available integrations.",
    },
  ];

  const benefits = [
    { label: "First 50 sign-ups:", value: "1 year free" },
    { label: "Next 50 sign-ups:", value: "3 months free" },
    { label: "All other work emails:", value: "30-day free trial" },
    { label: "Personal emails:", value: "14-day free trial" },
  ];

  return (
    <div className="pricing-faq-section bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main container with row flex */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left side - Pricing/Sign-up benefits */}
          <div className="flex flex-col justify-start">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              Get extended access when you sign up with your <span className="text-orange-500">work email</span>
            </h2>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-orange-500 text-white">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">{benefit.label}</span>
                      <br />
                      <span className="text-orange-500 font-semibold">{benefit.value}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Call-to-action button */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
                Start Your Free Trial
              </button>
              <p className="text-sm text-gray-600 text-center mt-4">
                No credit card required. Setup takes less than 2 minutes.
              </p>
            </div>
          </div>

          {/* Right side - FAQ */}
          <div className="flex flex-col justify-start">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
              <span className="text-orange-500">Frequently</span> Asked Questions
            </h2>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-orange-300 hover:shadow-md"
                >
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-left text-gray-900 font-semibold text-sm sm:text-base leading-snug">
                      {item.question}
                    </h3>
                    <ChevronDown
                      className={`flex-shrink-0 w-5 h-5 text-orange-500 transition-transform duration-200 ${
                        expandedIndex === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedIndex === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional help link */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Can't find what you're looking for?{" "}
                <a href="#" className="text-orange-500 font-semibold hover:underline">
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
