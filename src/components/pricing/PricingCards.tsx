
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardsProps {
  isAnnual: boolean;
}

const plans = [
  {
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      "1 Team Member",
      "Up to 3 Clients",
      "Basic Scheduling",
      "Mobile Access",
      "Limited Support",
    ],
    cta: "Get Started",
    isPopular: false,
  },
  {
    name: "Standard",
    priceMonthly: 29,
    priceAnnual: 29 * 12 * 0.85, // 15% discount
    features: [
      "Up to 3 Team Members",
      "20 Clients",
      "Automated Invoicing",
      "Multi-language Support",
      "Priority Email Support",
    ],
    cta: "Choose Standard",
    isPopular: false,
  },
  {
    name: "Pro",
    priceMonthly: 79,
    priceAnnual: 79 * 12 * 0.85, // 15% discount
    features: [
      "Up to 10 Team Members",
      "Unlimited Clients",
      "Smart Scheduling Assistant",
      "Job History & Notes",
      "AI-Powered Translation",
      "SMS Reminders",
      "Chat Support",
    ],
    cta: "Choose Pro",
    isPopular: true,
  },
  {
    name: "Enterprise",
    priceMonthly: "Custom",
    priceAnnual: "Custom", // Ensure this is handled as a string
    features: [
      "Unlimited Team Members",
      "White-label Options",
      "Dedicated Account Manager",
      "Custom Integrations",
      "Onboarding & Team Training",
      "SLA Support",
    ],
    cta: "Contact Sales",
    isPopular: false,
    isEnterprise: true,
  },
];

const PricingCards: React.FC<PricingCardsProps> = ({ isAnnual }) => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "glass-card p-6 sm:p-8 flex flex-col text-left relative overflow-hidden animate-on-scroll",
                plan.isPopular ? "border-pulse-500 border-2 shadow-elegant-hover" : "border-gray-200",
                `stagger-${index + 1}` // For staggered animation
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.isPopular && (
                <div className="absolute top-0 -right-10 transform rotate-45 bg-pulse-500 text-white text-xs font-semibold px-10 py-1.5">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold font-display mb-1">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  {isAnnual
                    ? typeof plan.priceAnnual === 'number'
                      ? `$${(plan.priceAnnual / 12).toFixed(0)}`
                      : plan.priceAnnual
                    : typeof plan.priceMonthly === 'number'
                      ? `$${plan.priceMonthly.toFixed(0)}`
                      : plan.priceMonthly
                  }
                </span>
                <span className="text-sm text-gray-500">
                  {typeof plan.priceMonthly === 'number' ? "/month" : ""}
                  {isAnnual && typeof plan.priceMonthly === 'number' && plan.priceMonthly > 0 && <span className="block text-xs">(billed annually)</span>}
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-pulse-500 mr-2 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#" // Placeholder link
                className={cn(
                  plan.isPopular || plan.isEnterprise ? "button-primary w-full text-center" : "button-secondary w-full text-center",
                )}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingCards;

