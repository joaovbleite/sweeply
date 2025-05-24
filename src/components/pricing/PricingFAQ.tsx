import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Can I change my plan later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated for the current billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, including Visa, Mastercard, American Express, and Discover. For Enterprise plans, we also support invoicing.",
  },
  {
    question: "Is there a discount for annual billing?",
    answer:
      "Yes, we offer a 15% discount if you choose to pay annually. You can select this option using the toggle at the top of the pricing page.",
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer:
      "If you exceed your plan limits (e.g., team members or clients), we'll notify you. You can then choose to upgrade your plan or adjust your usage. We don't automatically charge overage fees.",
  },
];

const PricingFAQ: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white animate-on-scroll">
      <div className="section-container">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="section-title mb-4">Frequently Asked Questions</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Find answers to common questions about our pricing and plans.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem value={`item-${index + 1}`} key={index} className="border-b border-gray-200">
                <AccordionTrigger className="py-5 text-lg font-medium text-gray-800 hover:text-emerald-600 text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 pt-0 text-gray-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default PricingFAQ;
