import React, { useState } from "react";
import { Check, CreditCard, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { motion } from "framer-motion";

const Subscription: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro' | 'enterprise'>('standard');
  
  // Define the plans based on user information
  const plans = {
    standard: {
      name: "Standard",
      price: {
        monthly: 9.99,
        yearly: 95.99 // ~20% discount from $119.88
      },
      description: "Perfect for small businesses",
      features: [
        "Basic scheduling",
        "Up to 50 clients", 
        "Client management",
        "Email support",
        "Job scheduling",
        "Mobile app access"
      ],
      limitations: [
        "Limited reporting",
        "No team features",
        "No custom branding"
      ],
      memberLimit: "1 member limit",
      color: "blue",
      savings: "$23.89"
    },
    pro: {
      name: "Pro",
      price: {
        monthly: 30,
        yearly: 288 // ~20% discount from $360
      },
      description: "For growing businesses",
      features: [
        "Advanced scheduling",
        "Unlimited clients",
        "Priority support",
        "Advanced reporting",
        "Team management (up to 5)",
        "Custom invoicing",
        "Email notifications",
        "Client portal"
      ],
      limitations: [
        "Limited integrations"
      ],
      memberLimit: "5 member limit",
      color: "purple",
      savings: "$72"
    },
    enterprise: {
      name: "Enterprise",
      price: {
        monthly: 75,
        yearly: 720 // ~20% discount from $900
      },
      description: "For large operations",
      features: [
        "Everything in Pro",
        "Custom website",
        "Dedicated account manager",
        "Custom integrations",
        "Premium support",
        "Advanced analytics",
        "White labeling",
        "Unlimited team members"
      ],
      limitations: [],
      memberLimit: "Unlimited members",
      color: "green",
      savings: "$180"
    }
  };

  // Current active plan details
  const activePlan = plans[selectedPlan];

  const handlePlanSelect = (planId: 'standard' | 'pro' | 'enterprise') => {
    setSelectedPlan(planId);
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

        {/* Plan Selection Tabs */}
        <div className="mt-4 bg-gray-100 rounded-full p-1.5 flex mb-8">
          {['standard', 'pro', 'enterprise'].map((plan) => (
            <button
              key={plan}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition ${
                selectedPlan === plan 
                  ? 'bg-white shadow text-gray-800' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handlePlanSelect(plan as 'standard' | 'pro' | 'enterprise')}
            >
              {plan === 'standard' ? 'Standard' : plan === 'pro' ? 'Pro' : 'Enterprise'}
            </button>
          ))}
        </div>

        {/* Selected Plan Details */}
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            {activePlan.name}
          </h1>
          <div className="text-center mt-2 mb-6">
            <span className="inline-block px-4 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
              {activePlan.memberLimit}
            </span>
          </div>
          
          {/* Feature List */}
          <div className="mt-4 bg-[#14171f] rounded-xl p-6">
            {activePlan.features.map((feature, index) => (
              <div key={index} className="flex items-start mb-6">
                <Check className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-white text-lg font-medium">{feature}</p>
                </div>
              </div>
            ))}
            
            {/* Limitations */}
            {activePlan.limitations.map((limitation, index) => (
              <div key={`limit-${index}`} className="flex items-start mb-6">
                <X className="w-6 h-6 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-lg">{limitation}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pricing Options */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div 
              className={`border-2 rounded-xl p-4 text-center cursor-pointer ${
                billingPeriod === 'yearly' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              <p className="text-2xl font-bold text-blue-600">${activePlan.price.yearly}</p>
              <p className="text-gray-700 font-medium">per year</p>
            </div>
            <div 
              className={`border-2 rounded-xl p-4 text-center cursor-pointer ${
                billingPeriod === 'monthly' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              <p className="text-2xl font-bold text-gray-800">${activePlan.price.monthly}</p>
              <p className="text-gray-700 font-medium">per month</p>
            </div>
          </div>
          
          {/* Subscribe Button */}
          <button className="mt-6 w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl text-lg transition shadow-md">
            Subscribe for ${billingPeriod === 'yearly' ? activePlan.price.yearly : activePlan.price.monthly} / {billingPeriod === 'yearly' ? 'year' : 'month'}
          </button>
          
          {billingPeriod === 'yearly' && (
            <p className="text-center text-sm text-blue-600 font-medium mt-2">
              Save {activePlan.savings} with annual billing
            </p>
          )}
        </div>
        
        {/* Current Plan (moved to bottom) */}
        <div className="bg-white rounded-xl shadow-sm my-8 p-4">
          <h2 className="text-lg font-semibold mb-2">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-medium">Free Trial</p>
              <p className="text-sm text-gray-500">Expires in 7 days</p>
            </div>
            <button className="text-sm text-blue-600 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50">
              Contact Support
            </button>
          </div>
        </div>
        
        {/* Contact Support Info */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Need help choosing a plan or want to cancel?
          </p>
          <button className="text-blue-600 font-medium text-sm">
            Contact Support
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Subscription; 