import React, { useState } from "react";
import { Check, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { motion } from "framer-motion";

const Subscription: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | '3months' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Define the plans based on user information
  const plans = [
    {
      id: "standard",
      name: "Standard",
      price: {
        monthly: 10,
        "3months": 20, // Pay 2 months, get 1 free
        yearly: 100 // Annual discount
      },
      description: "Perfect for small businesses",
      features: [
        "Basic scheduling",
        "Up to 50 clients",
        "Email support"
      ],
      color: "blue",
      isPopular: false
    },
    {
      id: "pro",
      name: "Pro",
      price: {
        monthly: 30,
        "3months": 60, // Pay 2 months, get 1 free
        yearly: 300 // Annual discount
      },
      description: "For growing businesses",
      features: [
        "Everything in Standard",
        "Advanced scheduling",
        "Unlimited clients",
        "Priority support",
        "Advanced reporting"
      ],
      color: "purple",
      isPopular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: {
        monthly: 75,
        "3months": 150, // Pay 2 months, get 1 free
        yearly: 485 // Special offer for yearly
      },
      description: "For large operations",
      features: [
        "Everything in Pro",
        "Custom website",
        "Dedicated account manager",
        "Custom integrations",
        "Premium support"
      ],
      color: "green",
      isPopular: false
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    // In a real implementation, this would navigate to a checkout page
    // or show a modal for payment details
    // For now, we'll just set the selected plan
  };

  const discountMessage = {
    monthly: "Regular price",
    "3months": "Pay 2 months today, get 1 month free",
    yearly: "Special yearly discount"
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-4 py-6 pb-28">
        <PageHeader 
          title={t('settings:subscription')} 
          backUrl="/more"
          rightElement={
            <CreditCard className="w-6 h-6 text-pulse-500" />
          }
        />

        {/* Billing Period Selection */}
        <div className="bg-white rounded-xl shadow-sm my-4 p-4">
          <h2 className="text-lg font-semibold mb-3">Billing Period</h2>
          <div className="flex rounded-lg bg-gray-100 p-1">
            {[
              { id: 'monthly', label: 'Monthly' },
              { id: '3months', label: '3 Months' },
              { id: 'yearly', label: 'Yearly' }
            ].map((period) => (
              <button
                key={period.id}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                  billingPeriod === period.id 
                    ? 'bg-white shadow text-pulse-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setBillingPeriod(period.id as 'monthly' | '3months' | 'yearly')}
              >
                {period.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2 font-medium">
            {discountMessage[billingPeriod]}
          </p>
        </div>
        
        {/* Current Plan (placeholder) */}
        <div className="bg-white rounded-xl shadow-sm mb-4 p-4">
          <h2 className="text-lg font-semibold mb-2">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Free Trial</p>
              <p className="text-xs text-gray-400">Expires in 14 days</p>
            </div>
            <button className="text-sm text-pulse-600 font-medium">
              Contact Support
            </button>
          </div>
        </div>

        {/* Plans */}
        <h2 className="text-xl font-bold mt-6 mb-3">Available Plans</h2>
        <div className="space-y-4">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -2 }}
              className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                selectedPlan === plan.id ? `border-2 border-${plan.color}-500` : ''
              }`}
            >
              {/* Plan Header */}
              <div className={`p-4 bg-gradient-to-r ${
                plan.color === 'blue' ? 'from-blue-500 to-blue-600' :
                plan.color === 'purple' ? 'from-purple-500 to-purple-600' :
                'from-green-500 to-green-600'
              } text-white`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.isPopular && (
                    <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded-full font-bold">
                      Popular
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.price[billingPeriod]}</span>
                  <span className="text-sm opacity-80">/{billingPeriod === 'yearly' ? 'year' : 'billing period'}</span>
                </div>
                <p className="text-sm mt-1 opacity-90">{plan.description}</p>
              </div>
              
              {/* Plan Features */}
              <div className="p-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className={`w-5 h-5 mr-2 text-${plan.color}-500 flex-shrink-0`} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`mt-4 w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                    plan.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                    'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Contact Support Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help choosing a plan or want to cancel?
          </p>
          <button className="text-pulse-600 font-medium text-sm">
            Contact Support
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Subscription; 