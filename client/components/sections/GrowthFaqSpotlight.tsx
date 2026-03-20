import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface GrowthFaqSpotlightProps {
  onCreateAccount?: () => void;
}

const faqItems = [
  {
    question: "How is contextual plagiarism different from plagiarism?",
    answer:
      "Traditional plagiarism checks look for matching text. Contextual plagiarism identifies idea-level overlap and reused reasoning, even when wording is different. It helps prevent content from sounding familiar or recycled.",
  },
  {
    question: "Should I aim for 100 out of 100 scores?",
    answer:
      "No. Scores are signals, not a finish line. An AI content checker helps optimize content for search systems and AI readers, but final decisions should come from content marketers, editors, and subject experts.",
  },
  {
    question: "What makes Centauri different from other SEO tools?",
    answer:
      "Centauri combines AI-powered content analysis with SEO metrics to give you a complete view of your content's performance. We analyze both technical SEO and content quality in a single tool.",
  },
  {
    question: "Can I integrate Centauri with my existing tools?",
    answer:
      "Yes. Centauri is built to fit modern editorial workflows, and the roadmap includes deeper integrations for content, SEO, and review operations.",
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
