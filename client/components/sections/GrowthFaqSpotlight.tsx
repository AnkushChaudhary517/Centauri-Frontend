import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface GrowthFaqSpotlightProps {
  onCreateAccount?: () => void;
}

const faqItems = [
  {
    question: "What actually sets Centauri apart from traditional SEO or GEO tools?",
    answer:
      "Most tools stop at keywords, backlinks, or surface-level optimization. Centauri evaluates how your content is understood, trusted, and reused by your users, search engines and AI systems. It looks at structure, intent coverage, factual grounding, and clarity, then connects every recommendation to a real outcome like better indexing, stronger authority, or higher engagement.",
  },
  {
    question: "How valuable are Centauri’s recommendations in improving content performance?",
    answer:
      "Centauri’s recommendations are designed to be directly usable, not theoretical. Each suggestion tells you exactly what to change and why it matters, whether it improves authority, readability, or indexing. This reduces editing time, removes guesswork, and helps teams move from “analyzing content” to actually improving it in fewer iterations.",
  },
  {
    question: "Why does Centauri evaluate human aspects of content when users are increasingly consuming answers through LLMs?",
    answer:
      "Because AI systems don’t just extract information, they prioritize content that is clear, well-structured, and trustworthy. Human-friendly elements like flow, clarity, and logical organization directly influence how machines interpret and reuse your content. And when users do visit your site, these same elements determine whether they stay, trust your brand, and take action.",
  },
  {
    question: "Should I try to get a perfect 100/100 SEO and AI Indexing score?",
    answer:
      "No. A perfect score isn’t the goal, and often isn’t practical. The goal is to ensure your content is complete, credible, and easy to interpret for both machines and humans. In many cases, improving from 60 to 80 creates more impact than chasing the last few points.",
  },
];

const benefits = [
  "2.5x higher visibility as E-E-A-T aligned pages get indexed more reliably",
  "40% less editing time when structure issues are addressed before final review",
  "27% higher engagement from cleaner, more scannable formatting",
  "30% faster review cycles with section-level notes",
];

export function GrowthFaqSpotlight({ onCreateAccount }: GrowthFaqSpotlightProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0b133a] via-[#08112d] to-[#04091a] text-white shadow-[0_30px_90px_rgba(7,15,40,0.24)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="border-b border-white/10 p-8 sm:p-10 lg:border-b-0 lg:border-r lg:border-white/10 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                Why teams choose Centauri
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                Create your account to begin your <span className="text-orange-400">free trial today.</span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">
                Teams using this workflow consistently see measurable gains across content quality,
                indexing readiness, and editorial turnaround time.
              </p>

              <div className="mt-8 space-y-4 text-sm text-slate-200">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="text-orange-400">■</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={onCreateAccount}
                  className="inline-flex items-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
                >
                  Start Your Free Trial
                </button>
                <p className="mt-4 text-sm text-slate-400">
                  No credit card required. Setup takes less than 2 minutes.
                </p>
              </div>
            </div>

            <div className="bg-white/6 p-8 sm:p-10 lg:p-12">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  FAQs
                </p>
                <h3 className="mt-4 text-3xl font-semibold leading-tight">
                  Frequently asked questions
                </h3>
              </div>

              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div
                    key={item.question}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-semibold text-white sm:text-base">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400 transition-transform ${
                          expandedIndex === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedIndex === index ? (
                      <div className="border-t border-white/10 px-5 py-4 text-sm leading-7 text-slate-300">
                        {item.answer}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
