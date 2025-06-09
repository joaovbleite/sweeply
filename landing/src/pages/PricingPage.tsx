
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const PricingPage = () => {
  const plans = [
    {
      name: "Solo Cleaner",
      price: "$10",
      frequency: "/month",
      features: [
        "Up to 10 Clients",
        "Basic Scheduling",
        "Client Management",
        "Email Support",
      ],
      cta: "Choose Solo",
      href: "/signup?plan=solo",
      popular: false,
    },
    {
      name: "Cleaning Team",
      price: "$25",
      frequency: "/month",
      features: [
        "Unlimited Clients",
        "Advanced Scheduling",
        "Team Coordination",
        "Payment Processing",
        "Basic Reporting",
        "Priority Support",
      ],
      cta: "Choose Team",
      href: "/signup?plan=team",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      frequency: "",
      features: [
        "All Team Features",
        "Custom Integrations",
        "Dedicated Account Manager",
        "Advanced Analytics",
      ],
      cta: "Contact Us",
      href: "/contact",
      popular: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center text-sweeply-dark mb-4">
        Simple, Transparent Pricing
      </h1>
      <p className="text-xl text-gray-600 text-center mb-12">
        Choose the plan that's right for your cleaning business.
      </p>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg shadow-lg p-8 flex flex-col ${
              plan.popular ? "border-2 border-sweeply bg-sweeply-light" : "bg-white border"
            }`}
          >
            {plan.popular && (
              <div className="text-sm font-semibold text-sweeply bg-sweeply/10 px-3 py-1 rounded-full self-start mb-4">
                Most Popular
              </div>
            )}
            <h2 className="text-2xl font-bold text-sweeply-dark mb-2">{plan.name}</h2>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
              {plan.frequency && <span className="text-lg text-gray-500">{plan.frequency}</span>}
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className={`${
                plan.popular ? "bg-sweeply hover:bg-sweeply-dark text-white" : "bg-gray-100 text-sweeply hover:bg-gray-200"
              } w-full`}
            >
              <Link to={plan.href}>{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-600 mt-12">
        Need something different? <Link to="/contact" className="text-sweeply hover:underline">Contact us</Link> for custom solutions.
      </p>
    </div>
  );
};

export default PricingPage;
