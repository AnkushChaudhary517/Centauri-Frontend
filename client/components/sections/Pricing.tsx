import { Button } from "@/components/ui/button";

export function Pricing() {
  const plans = [
    {
      name: "Free 50",
      price: "$0",
      period: "free",
      features: [
        "Get 50 credits to start",
        "1 month free trial",
      ],
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      name: "Need 100",
      price: "$29",
      period: "/month",
      features: [
        "Get 100 credits monthly",
        "3 months subscription",
      ],
      color: "bg-gradient-to-br from-purple-600 to-blue-600",
    },
    {
      name: "Pro 250",
      price: "$59",
      period: "/month",
      features: [
        "Get 250 credits monthly",
        "20-day trial free trial",
      ],
      color: "bg-gradient-to-br from-blue-600 to-orange-600",
    },
    {
      name: "Premium 1000",
      price: "$199",
      period: "/month",
      features: [
        "Get 1000 credits yearly",
        "Lifetime free trial",
      ],
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="pricing-section bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Get extended access when you sign up with your work email
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`${plan.color} rounded-lg p-6 text-white`}
            >
              <h3 className="text-xl font-bold mb-4">{plan.name}</h3>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period !== "free" && (
                  <span className="text-sm ml-1">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-xl mt-1">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full bg-white text-primary hover:bg-gray-100 font-semibold py-2">
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
