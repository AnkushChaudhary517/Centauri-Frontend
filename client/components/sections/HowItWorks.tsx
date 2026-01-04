export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Sign up and connect",
      description:
        "Create your account and link your web content to get started.",
      icon: "👤",
      color: "bg-orange-100",
      textColor: "text-orange-600",
      url:"/assets/steps/signup.png"
    },
    {
      number: "2",
      title: "Upload or paste URL",
      description:
        "Upload a document or paste your URL and let AI magic happen.",
      icon: "📤",
      color: "bg-blue-100",
      textColor: "text-blue-600",
      url:"/assets/steps/upload.png"
    },
    {
      number: "3",
      title: "Rich the review using our content ranking tool",
      description:
        "Check, modify, and perfect your content with precise recommendations.",
      icon: "✓",
      color: "bg-purple-100",
      textColor: "text-purple-600",
      url:"/assets/steps/review.png"
    },
    {
      number: "4",
      title: "Deploy your piece",
      description:
        "Publish your optimized content with confidence and track performance.",
      icon: "🚀",
      color: "bg-green-100",
      textColor: "text-green-600",
      url:"/assets/steps/download.png"
    },
  ];

  return (
    <div className="how-it-works-section bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How <span className="text-orange-500">Centauri</span> works as your
            <br />
            end-to-end content review tool
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`${step.color} rounded-lg p-3 flex-shrink-0`}>
                <img
            src={step.url}
            //alt="Background shape"
            className="w-full h-full object-contain"
            loading="lazy"
          />
                </div>
                <div className="flex flex-col">
                <span className="inline-block w-fit px-[5px] py-[5px] font-Sora text-[14px] bg-orange-500 text-white m-1.5 rounded-[10px]">
                    Step {step.number}
                  </span>
                  <p className={`font-bold ${step.textColor} mb-2`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
