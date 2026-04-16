import { environment } from "@/config/environment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { authAPI } from "@/utils/AuthApi";
import { useAuth } from "@/utils/AuthContext";
import { cn } from "@/lib/utils";
import { Bot, MessageSquareText, Send, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

type AssistantTopic = {
  key: string;
  label: string;
  prompt: string;
};

type AssistantStep = "topics" | "confirm" | "compose" | "sent";

export function CentauriSupportAssistant() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<AssistantStep>("topics");
  const [selectedTopic, setSelectedTopic] = useState<AssistantTopic | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageContext = useMemo(() => getAssistantPageContext(location.pathname), [location.pathname]);

  if (!environment.enableCentauriAssistant) {
    return null;
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      setCurrentStep("topics");
      setSelectedTopic(null);
      setDraftMessage("");
      setIsSubmitting(false);
    }
  };

  const handleSelectTopic = (topic: AssistantTopic) => {
    setSelectedTopic(topic);
    setDraftMessage(
      `${topic.prompt}\n\nPage: ${pageContext.title}\nMy question: `,
    );
    setCurrentStep("confirm");
  };

  const handleSubmit = async () => {
    if (!selectedTopic || !draftMessage.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authAPI.submitSupportQuery({
        topicKey: selectedTopic.key,
        topicLabel: selectedTopic.label,
        message: draftMessage.trim(),
        pagePath: location.pathname,
        pageTitle: pageContext.title,
        email: user?.email,
        userId: user?.userId,
        metadata: {
          isAuthenticated,
          predefinedTopics: pageContext.topics.map((topic) => topic.label),
        },
      });

      toast({
        title: "Query received",
        description:
          response?.message ||
          "We have received your query and will share the solution on your registered email shortly.",
      });
      setCurrentStep("sent");
    } catch (error) {
      toast({
        title: "Could not send query",
        description:
          error instanceof Error
            ? error.message
            : "We could not submit your query right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[80] sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div className="w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-[28px] border border-[#dbe5f2] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_30px_70px_rgba(15,23,42,0.18)]">
          <div className="border-b border-[#e2e8f0] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_42%),linear-gradient(135deg,#eff6ff_0%,#ffffff_72%)] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d4ed8] text-white shadow-[0_12px_24px_rgba(29,78,216,0.28)]">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Centauri Assistant</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Support for {pageContext.title.toLowerCase()} with quick help topics and email follow-up.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 px-4 py-4">
            {currentStep === "topics" ? (
              <>
                <div className="rounded-[18px] border border-[#dbeafe] bg-white px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                    Suggested Questions
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Pick a topic and we&apos;ll prepare a support query with the right page context.
                  </p>
                </div>

                <div className="space-y-2">
                  {pageContext.topics.map((topic) => (
                    <button
                      key={topic.key}
                      type="button"
                      onClick={() => handleSelectTopic(topic)}
                      className="flex w-full items-start gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-[#93c5fd] hover:bg-[#f8fbff]"
                    >
                      <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#1d4ed8]">
                        <MessageSquareText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{topic.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{topic.prompt}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {currentStep === "confirm" && selectedTopic ? (
              <>
                <div className="rounded-[18px] border border-[#dbeafe] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">{selectedTopic.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selectedTopic.prompt}</p>
                </div>

                <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">Do you want to send a query?</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    We&apos;ll let you edit the message first, then send it with page details so the team can reply faster.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => setCurrentStep("topics")}
                    >
                      Not now
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 rounded-full bg-[#1d4ed8] hover:bg-[#1e40af]"
                      onClick={() => setCurrentStep("compose")}
                    >
                      Yes, continue
                    </Button>
                  </div>
                </div>
              </>
            ) : null}

            {currentStep === "compose" && selectedTopic ? (
              <>
                <div className="rounded-[18px] border border-[#dbeafe] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#2563eb]" />
                    <p className="text-sm font-semibold text-slate-900">{selectedTopic.label}</p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Edit the message if needed. We&apos;ll send it with your current page context.
                  </p>
                </div>

                <Textarea
                  value={draftMessage}
                  onChange={(event) => setDraftMessage(event.target.value)}
                  className="min-h-[140px] rounded-[18px] border-[#dbe5f2] bg-white text-sm leading-6"
                  placeholder="Describe your issue here..."
                />

                <div className="rounded-[16px] border border-slate-200 bg-white/80 px-4 py-3">
                  <p className="text-xs leading-6 text-slate-500">
                    {user?.email
                      ? `We will reply on your registered email: ${user.email}.`
                      : "If you are signed in, we will reply on your registered email. Otherwise, the team will review the request context first."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => setCurrentStep("topics")}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 rounded-full bg-[#1d4ed8] hover:bg-[#1e40af]"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !draftMessage.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Sending..." : "Send Query"}
                  </Button>
                </div>
              </>
            ) : null}

            {currentStep === "sent" ? (
              <div className="rounded-[18px] border border-[#dbeafe] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-5 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#dbeafe] text-[#1d4ed8]">
                  <Send className="h-5 w-5" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-900">Query sent successfully</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  We&apos;ll review the request and share the solution on your registered email as soon as possible.
                </p>
                <Button
                  type="button"
                  className="mt-4 rounded-full bg-[#1d4ed8] hover:bg-[#1e40af]"
                  onClick={() => handleOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className={cn(
          "ml-auto inline-flex items-center gap-2 rounded-full bg-[#1d4ed8] px-4 py-3 text-white shadow-[0_20px_40px_rgba(29,78,216,0.28)] transition hover:bg-[#1e40af]",
          isOpen && "hidden",
        )}
        aria-label="Open Centauri Assistant"
      >
        <Bot className="h-5 w-5" />
        <span className="hidden text-sm font-semibold sm:inline">Ask Centauri</span>
      </button>
    </div>
  );
}

function getAssistantPageContext(pathname: string): { title: string; topics: AssistantTopic[] } {
  const commonTopics: AssistantTopic[] = [
    {
      key: "subscription-status",
      label: "Subscription related",
      prompt: "I need help understanding my current plan, renewal, or subscription status.",
    },
    {
      key: "payment-help",
      label: "Payment related",
      prompt: "I need help with a payment issue, charge, checkout error, or invoice concern.",
    },
    {
      key: "credits-help",
      label: "Credits issue",
      prompt: "I need help with remaining credits, trial credits, or credits not updating correctly.",
    },
  ];

  if (pathname === "/pricing") {
    return {
      title: "Pricing Page",
      topics: [
        {
          key: "starter-plan",
          label: "Starter plan questions",
          prompt: "I need help understanding what is included in the Starter Plan and whether it fits my needs.",
        },
        {
          key: "checkout-failure",
          label: "Checkout problem",
          prompt: "I tried to subscribe but the Razorpay checkout or payment flow did not complete correctly.",
        },
        {
          key: "post-payment-credits",
          label: "Credits after payment",
          prompt: "My payment was successful, but my subscription or credits do not look correct yet.",
        },
        ...commonTopics,
      ],
    };
  }

  if (pathname === "/") {
    return {
      title: "Home Page",
      topics: [
        {
          key: "trial-access",
          label: "Free trial access",
          prompt: "I need help understanding trial access, onboarding, or how to get started with Centauri.",
        },
        {
          key: "analysis-help",
          label: "SEO analysis help",
          prompt: "I have a question about article upload, analysis flow, recommendations, or content scoring.",
        },
        {
          key: "account-help",
          label: "Account related",
          prompt: "I need help with login, signup, profile details, or account access.",
        },
        ...commonTopics,
      ],
    };
  }

  return {
    title: "Support Page",
    topics: [
      {
        key: "navigation-help",
        label: "Navigation help",
        prompt: "I need help finding the right page or getting back to the workspace.",
      },
      {
        key: "account-help",
        label: "Account related",
        prompt: "I need help with login, signup, profile details, or account access.",
      },
      ...commonTopics,
    ],
  };
}
