import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation(['pricing', 'common']);
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [activeTab, setActiveTab] = useState('Plus');

  const plans = {
    Plus: {
      name: 'Plus Plan',
      limit: '1 member limit',
      features: [
        'Unlimited file uploads',
        '30 day page history',
        'Invite up to 100 guests',
        'View data with charts',
        'Site customizations',
      ],
      prices: {
        yearly: 119.99,
        monthly: 11.99,
      },
    },
    'Sweeply AI': {
      name: 'AI Plan',
      limit: '1 member limit',
      features: [
        'All Plus features',
        'AI-powered scheduling',
        'Automated reports',
        'Predictive analytics',
        'Priority support',
      ],
      prices: {
        yearly: 229.99,
        monthly: 24.99,
      },
    },
    'Plus & AI': {
        name: 'Plus & AI Plan',
        limit: '5 members limit',
        features: [
          'All AI features',
          'Team collaboration tools',
          'Advanced security',
          'Custom integrations',
          'Dedicated account manager',
        ],
        prices: {
          yearly: 349.99,
          monthly: 39.99,
        },
      },
  };

  const currentPlan = plans[activeTab as keyof typeof plans];
  const ctaPrice = selectedPlan === 'yearly' ? currentPlan.prices.yearly : currentPlan.prices.monthly;

  return (
    <div className="bg-[#121212] min-h-screen flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]"></div>
      <div className="bg-[#121212] rounded-3xl p-6 w-full max-w-md z-10 relative shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="bg-[#1A1A1A] p-1 rounded-xl flex-grow">
            <div className="flex justify-around bg-[#1A1A1A] p-1 rounded-lg">
              {Object.keys(plans).map((planName) => (
                <button
                  key={planName}
                  onClick={() => setActiveTab(planName)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300 w-full ${
                    activeTab === planName
                      ? 'bg-[#2E2E2E] text-white'
                      : 'bg-transparent text-gray-400'
                  }`}
                >
                  {planName}
                </button>
              ))}
            </div>
          </div>
          <button className="ml-4 p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Plan Details */}
        <div className="text-center my-6">
          <h1 className="text-2xl font-bold text-white">{currentPlan.name}</h1>
          <span className="mt-2 inline-block bg-[#2B2B2B] text-gray-400 text-xs font-medium px-3 py-1 rounded-full">
            {currentPlan.limit}
          </span>
        </div>

        {/* Features */}
        <div className="bg-[#1E1E1E] rounded-2xl p-4 relative mb-6">
          <img src="/lovable-uploads/5663820f-6c97-4492-9210-9eaa1a8dc415.png" alt="Illustration" className="absolute -left-8 -bottom-8 w-24 h-auto opacity-80 transform -rotate-12" />
          <img src="/lovable-uploads/af412c03-21e4-4856-82ff-d1a975dc84a9.png" alt="Illustration" className="absolute -right-8 -top-8 w-24 h-auto opacity-80 transform rotate-12" />
          
          <ul className="space-y-3 z-10 relative">
            {currentPlan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check size={16} className="text-[#1EA7FD] mr-3 flex-shrink-0" />
                <span className="text-white text-base font-medium">{feature}</span>
              </li>
            ))}
          </ul>
           <p className="text-gray-500 text-sm mt-4 ml-7">and more...</p>
        </div>

        {/* Pricing Options */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`flex-1 p-4 rounded-xl text-center transition-all duration-300 ${
              selectedPlan === 'yearly'
                ? 'bg-[#0A0A0A] border-2 border-[#1EA7FD]'
                : 'bg-[#0A0A0A] border border-gray-700'
            }`}
          >
            <p className={`text-lg font-bold ${selectedPlan === 'yearly' ? 'text-[#1EA7FD]' : 'text-gray-400'}`}>
              ${currentPlan.prices.yearly}
            </p>
            <p className="text-sm text-gray-500">per year</p>
          </button>
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`flex-1 p-4 rounded-xl text-center transition-all duration-300 ${
              selectedPlan === 'monthly'
                ? 'bg-[#0A0A0A] border-2 border-[#1EA7FD]'
                : 'bg-[#0A0A0A] border border-gray-700'
            }`}
          >
            <p className={`text-lg font-bold ${selectedPlan === 'monthly' ? 'text-[#1EA7FD]' : 'text-gray-400'}`}>
              ${currentPlan.prices.monthly}
            </p>
            <p className="text-sm text-gray-500">per month</p>
          </button>
        </div>

        {/* CTA */}
        <button className="w-full bg-[#1EA7FD] text-white font-semibold py-4 rounded-xl text-base hover:bg-blue-500 transition-colors">
          Subscribe for ${ctaPrice} / {selectedPlan === 'yearly' ? 'year' : 'month'}
        </button>

        {/* Footer Links */}
        <div className="text-center mt-6 space-x-6">
          <button className="text-gray-500 text-sm hover:text-white transition-colors">Restore subscription</button>
          <button className="text-gray-500 text-sm hover:text-white transition-colors">Terms of service</button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage; 