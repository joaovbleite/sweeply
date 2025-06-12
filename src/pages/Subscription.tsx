import React, { useState } from "react";
import { Check, CreditCard, X, Sparkles } from "lucide-react";
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
      savings: "$23.89",
      badge: null
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
      savings: "$72",
      badge: "Popular"
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
      savings: "$180",
      badge: null
    }
  };

  // Current active plan details
  const activePlan = plans[selectedPlan];

  const handlePlanSelect = (planId: 'standard' | 'pro' | 'enterprise') => {
    setSelectedPlan(planId);
  };

  // Color mapping for plans
  const planColors = {
    standard: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700",
      highlight: "bg-blue-500",
      lightText: "text-blue-600",
      icon: "text-blue-500"
    },
    pro: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      button: "bg-purple-600 hover:bg-purple-700",
      highlight: "bg-purple-500",
      lightText: "text-purple-600",
      icon: "text-purple-500"
    },
    enterprise: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      button: "bg-emerald-600 hover:bg-emerald-700",
      highlight: "bg-emerald-500",
      lightText: "text-emerald-600",
      icon: "text-emerald-500"
    }
  };

  const currentColors = planColors[selectedPlan];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-4 py-6 pb-28">
        <PageHeader 
          title={t('settings:subscription')} 
          backUrl="/more"
          rightElement={
            <CreditCard className={`w-6 h-6 ${currentColors.icon}`} />
          }
        />

        {/* Billing Toggle */}
        <div className="mt-6 mb-8">
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-full inline-flex">
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'yearly' 
                    ? `${currentColors.button} text-white shadow-md` 
                    : 'text-gray-600'
                }`}
              >
                Yearly
                {billingPeriod === 'yearly' && (
                  <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                )}
              </button>
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'monthly' 
                    ? `${currentColors.button} text-white shadow-md` 
                    : 'text-gray-600'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {/* Plan Selection Cards */}
        <div className="space-y-4 mb-8">
          {Object.entries(plans).map(([planId, plan]) => (
            <motion.div
              key={planId}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: planId === 'standard' ? 0 : planId === 'pro' ? 0.1 : 0.2 }}
              className={`relative rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                selectedPlan === planId
                  ? `${planColors[planId as keyof typeof planColors].border} shadow-lg`
                  : 'border-gray-200'
              }`}
              onClick={() => handlePlanSelect(planId as 'standard' | 'pro' | 'enterprise')}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute top-0 right-0">
                  <div className={`${planColors[planId as keyof typeof planColors].button} text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center`}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {plan.badge}
                  </div>
                </div>
              )}
              
              <div className={`p-5 ${selectedPlan === planId ? planColors[planId as keyof typeof planColors].bg : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-lg font-bold ${selectedPlan === planId ? planColors[planId as keyof typeof planColors].text : 'text-gray-800'}`}>
                      {plan.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">{plan.description}</p>
                  </div>
                  {selectedPlan === planId && (
                    <div className="bg-white rounded-full p-1 shadow-sm">
                      <Check className={`w-5 h-5 ${planColors[planId as keyof typeof planColors].icon}`} />
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <div className="flex items-baseline">
                    <span className={`text-2xl font-bold ${selectedPlan === planId ? planColors[planId as keyof typeof planColors].text : 'text-gray-800'}`}>
                      ${billingPeriod === 'yearly' ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-gray-500 ml-1 text-sm">
                      /{billingPeriod === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  
                  {billingPeriod === 'yearly' && (
                    <p className={`text-xs font-medium mt-1 ${planColors[planId as keyof typeof planColors].lightText}`}>
                      Save {plan.savings} with annual billing
                    </p>
                  )}
                </div>
                
                <div className="mt-3 flex items-center">
                  <div className={`w-2 h-2 rounded-full ${selectedPlan === planId ? planColors[planId as keyof typeof planColors].highlight : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-600 ml-2">{plan.memberLimit}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Plan Details */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6"
        >
          {/* Feature List */}
          <div className={`mt-4 rounded-2xl p-6 shadow-lg ${currentColors.bg} border ${currentColors.border}`}>
            <h2 className={`text-xl font-bold mb-4 ${currentColors.text}`}>
              What's included
            </h2>
            
            {activePlan.features.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start mb-5"
              >
                <div className={`rounded-full p-1 ${currentColors.highlight} mr-3 flex-shrink-0`}>
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">{feature}</p>
                </div>
              </motion.div>
            ))}
            
            {/* Limitations */}
            {activePlan.limitations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-gray-500 font-medium mb-3">Limitations</h3>
                {activePlan.limitations.map((limitation, index) => (
                  <motion.div 
                    key={`limit-${index}`} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (activePlan.features.length + index) * 0.05 }}
                    className="flex items-start mb-4"
                  >
                    <div className="rounded-full p-1 bg-gray-200 mr-3 flex-shrink-0">
                      <X className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-500">{limitation}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          {/* Subscribe Button */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`mt-6 w-full py-4 ${currentColors.button} text-white font-semibold rounded-xl text-lg transition shadow-md flex items-center justify-center`}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Subscribe Now
          </motion.button>
          
          {billingPeriod === 'yearly' && (
            <p className={`text-center text-sm ${currentColors.lightText} font-medium mt-2`}>
              Save {activePlan.savings} with annual billing
            </p>
          )}
        </motion.div>
        
        {/* Current Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 my-8 p-5"
        >
          <h2 className="text-lg font-semibold mb-2">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <p className="text-gray-700 font-medium">Free Trial</p>
              </div>
              <p className="text-sm text-gray-500 mt-1">Expires in 7 days</p>
            </div>
            <button className={`text-sm ${currentColors.lightText} font-medium px-3 py-1.5 rounded-md hover:bg-gray-100`}>
              Contact Support
            </button>
          </div>
        </motion.div>
        
        {/* Contact Support Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-gray-600 mb-2">
            Need help choosing a plan or want to cancel?
          </p>
          <button className={`${currentColors.lightText} font-medium text-sm`}>
            Contact Support
          </button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Subscription; 