import React, { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';

const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation(['pricing', 'common']);
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [activeTab, setActiveTab] = useState('Plus');
  const navigate = useNavigate();

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
    <AppLayout hideBottomNav>
      <div className="flex flex-col h-full bg-[#121212]">
        {/* Custom Header */}
        <div className="sticky top-0 left-0 right-0 z-30 bg-[#121212]">
          <div className="flex items-center justify-between px-4 pt-8 pb-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)} 
                className="mr-2 text-white"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-white">
                Subscription
              </h1>
            </div>
          </div>
        </div>
        
        {/* Subscription Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-[#121212] rounded-3xl p-6 w-full max-w-md mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]"></div>
            
            {/* Plan Selection Tabs */}
            <div className="bg-[#1A1A1A] p-1 rounded-xl mb-4 relative z-10">
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

        {/* Plan Details */}
            <div className="text-center my-6 relative z-10">
          <h1 className="text-2xl font-bold text-white">{currentPlan.name}</h1>
          <span className="mt-2 inline-block bg-[#2B2B2B] text-gray-400 text-xs font-medium px-3 py-1 rounded-full">
            {currentPlan.limit}
          </span>
        </div>

        {/* Features */}
            <div className="bg-[#1E1E1E] rounded-2xl p-4 relative mb-6 z-10">
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
            <div className="flex gap-4 mb-6 relative z-10">
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
            <button className="w-full bg-[#1EA7FD] text-white font-semibold py-4 rounded-xl text-base hover:bg-blue-500 transition-colors relative z-10">
          Subscribe for ${ctaPrice} / {selectedPlan === 'yearly' ? 'year' : 'month'}
        </button>

        {/* Footer Links */}
            <div className="text-center mt-6 space-x-6 relative z-10">
          <button className="text-gray-500 text-sm hover:text-white transition-colors">Restore subscription</button>
          <button className="text-gray-500 text-sm hover:text-white transition-colors">Terms of service</button>
        </div>
      </div>
    </div>
        
        {/* Bottom Navigation */}
        <div className="bg-[#121212] pt-4 pb-8">
          <div className="flex justify-around items-center">
            <a href="/dashboard" className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              <span className="text-xs text-white mt-1">Home</span>
            </a>
            <a href="/calendar" className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
              <span className="text-xs text-white mt-1">Schedule</span>
            </a>
            <div className="flex flex-col items-center relative">
              <div className="bg-[#004E2E] w-14 h-14 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-8 h-8">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              </div>
            </div>
            <a href="/clients" className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="text-xs text-white mt-1">Clients</span>
            </a>
            <a href="/more" className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
              <span className="text-xs text-white mt-1">More</span>
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SubscriptionPage; 