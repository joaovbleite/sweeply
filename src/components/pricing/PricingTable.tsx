
import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const plansData = [
  {
    name: "Free",
    priceMonthly: 0,
    features: {
      "Team Members": "1",
      "Clients": "Up to 3",
      "Basic Scheduling": true,
      "Mobile Access": true,
      "Limited Support": true,
      "Automated Invoicing": false,
      "Multi-language Support": false,
      "Priority Email Support": false,
      "Smart Scheduling Assistant": false,
      "Job History & Notes": false,
      "AI-Powered Translation": false,
      "SMS Reminders": false,
      "Chat Support": false,
      "White-label Options": false,
      "Dedicated Account Manager": false,
      "Custom Integrations": false,
      "Onboarding & Team Training": false,
      "SLA Support": false,
    },
  },
  {
    name: "Standard",
    priceMonthly: 29,
    features: {
      "Team Members": "Up to 3",
      "Clients": "20",
      "Basic Scheduling": true,
      "Mobile Access": true,
      "Limited Support": false, 
      "Automated Invoicing": true,
      "Multi-language Support": true,
      "Priority Email Support": true,
      "Smart Scheduling Assistant": false,
      "Job History & Notes": false,
      "AI-Powered Translation": false,
      "SMS Reminders": false,
      "Chat Support": false,
      "White-label Options": false,
      "Dedicated Account Manager": false,
      "Custom Integrations": false,
      "Onboarding & Team Training": false,
      "SLA Support": false,
    },
  },
  {
    name: "Pro",
    isPopular: true,
    priceMonthly: 79,
    features: {
      "Team Members": "Up to 10",
      "Clients": "Unlimited",
      "Basic Scheduling": true, // Or "Advanced Scheduling"
      "Mobile Access": true,
      "Limited Support": false,
      "Automated Invoicing": true,
      "Multi-language Support": true,
      "Priority Email Support": true,
      "Smart Scheduling Assistant": true,
      "Job History & Notes": true,
      "AI-Powered Translation": true,
      "SMS Reminders": true,
      "Chat Support": true,
      "White-label Options": false,
      "Dedicated Account Manager": false,
      "Custom Integrations": false,
      "Onboarding & Team Training": false,
      "SLA Support": false,
    },
  },
  {
    name: "Enterprise",
    priceMonthly: "Custom",
    features: {
      "Team Members": "Unlimited",
      "Clients": "Unlimited",
      "Basic Scheduling": true, // Or "Customizable Scheduling"
      "Mobile Access": true,
      "Limited Support": false,
      "Automated Invoicing": true,
      "Multi-language Support": true,
      "Priority Email Support": true,
      "Smart Scheduling Assistant": true,
      "Job History & Notes": true,
      "AI-Powered Translation": true,
      "SMS Reminders": true,
      "Chat Support": true,
      "White-label Options": true,
      "Dedicated Account Manager": true,
      "Custom Integrations": true,
      "Onboarding & Team Training": true,
      "SLA Support": true,
    },
  },
];

const allFeaturesList = [
  "Team Members",
  "Clients",
  "Basic Scheduling",
  "Mobile Access",
  "Automated Invoicing",
  "Multi-language Support",
  "Smart Scheduling Assistant",
  "Job History & Notes",
  "AI-Powered Translation",
  "SMS Reminders",
  "Chat Support",
  "Priority Email Support",
  "Limited Support",
  "White-label Options",
  "Dedicated Account Manager",
  "Custom Integrations",
  "Onboarding & Team Training",
  "SLA Support",
];

const PricingTable: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50 animate-on-scroll">
      <div className="section-container">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="section-title mb-4">Compare Plans & Features</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Find the perfect fit for your business with our detailed feature breakdown.
          </p>
        </div>
        <div className="overflow-x-auto bg-white p-6 sm:p-8 rounded-xl shadow-elegant">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="w-[250px] text-left text-base font-semibold text-gray-700 sticky left-0 bg-white z-10">Feature</TableHead>
                {plansData.map((plan) => (
                  <TableHead 
                    key={plan.name} 
                    className={cn(
                      "w-[150px] text-center text-base font-semibold text-gray-700",
                      plan.name === "Pro" && "text-pulse-500"
                    )}
                  >
                    {plan.name}
                    {plan.name === "Pro" && <span className="block text-xs text-pulse-500 normal-case">(Most Popular)</span>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allFeaturesList.map((featureName) => (
                <TableRow key={featureName} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                  <TableCell className="font-medium text-gray-800 py-4 sticky left-0 bg-white group-hover:bg-gray-50/50 z-10">{featureName}</TableCell>
                  {plansData.map((plan) => {
                    const featureValue = plan.features[featureName as keyof typeof plan.features];
                    return (
                      <TableCell key={`${plan.name}-${featureName}`} className="text-center py-4">
                        {typeof featureValue === "boolean" ? (
                          featureValue ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-700 text-sm">{featureValue}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default PricingTable;
