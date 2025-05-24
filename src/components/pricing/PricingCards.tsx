
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Import Button for consistent styling base

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
                "bg-white rounded-xl shadow-lg p-6 sm:p-8 flex flex-col text-left relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                plan.isPopular ? "border-emerald-500 border-2 ring-2 ring-emerald-500 ring-offset-2" : "border border-gray-200",
                `animate-on-scroll stagger-${index + 1}`
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.isPopular && (
                <div className="absolute top-0 -right-10 transform rotate-45 bg-emerald-500 text-white text-xs font-semibold px-10 py-1.5">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold font-display mb-1 text-gray-800">{plan.name}</h3>
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
                    <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild={false} // Ensure it's a button, not a slot for an <a> for now
                className={cn(
                  "w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors",
                  (plan.isPopular || plan.isEnterprise) 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                    : "bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50"
                )}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingCards;
