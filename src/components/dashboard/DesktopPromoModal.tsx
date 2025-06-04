import React from 'react';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DesktopPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DesktopPromoModal: React.FC<DesktopPromoModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation(['dashboard', 'common']);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl rounded-b-lg overflow-hidden animate-fade-in">
        {/* Handle/Indicator at top */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Close button */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-2 overflow-y-auto max-h-[85vh]">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2e35] mt-2 mb-6">
            Discover the full power of Sweeply
          </h1>

          {/* Illustration */}
          <div className="relative mb-8">
            <div className="bg-gray-100 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Reviews Card */}
                <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Total reviews</p>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl font-bold text-[#1a2e35]">92</span>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      37%
                    </span>
                  </div>
                </div>

                {/* Expenses Card */}
                <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Expenses</p>
                  <div className="mt-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">ITEM</span>
                      <span className="text-xs text-gray-500">DESCRIPTION</span>
                    </div>
                    <div className="mt-1 h-3 bg-gray-200 rounded"></div>
                    <div className="mt-1 h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>

              {/* Bottom Cards */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Booking Card */}
                <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Online Booking</p>
                  <p className="text-xs text-gray-500 mt-1">Time slot interval</p>
                  <div className="flex gap-1 mt-2">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-pulse-500 rounded flex items-center justify-center text-white text-xs">1h</div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>

                {/* Follow-up Card */}
                <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Automatic follow-up</p>
                  <div className="flex items-center mt-2">
                    <div className="w-4 h-4 bg-pulse-500 rounded-full mr-2"></div>
                    <span className="text-xs">SMS</span>
                    <div className="ml-auto bg-pulse-500 w-10 h-6 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="w-4 h-4 border border-gray-300 rounded-full mr-2"></div>
                    <span className="text-xs">Email</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlight Effect */}
            <div className="absolute -top-3 -left-3">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 25L10 15L15 10L25 5" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Feature List */}
          <div className="mb-8">
            <h2 className="text-lg text-gray-700 mb-4">
              Access Sweeply's full suite of time-saving tools like:
            </h2>
            <ul className="space-y-4">
              {[
                "Powerful, full-view scheduling",
                "Customizable online booking forms",
                "Automated quote and invoice follow-ups",
                "Job costing and automatic billing"
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-pulse-500 mr-3" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-gray-700 mb-8">
            Log in, on your computer, through the email in your inbox.
          </p>

          {/* Button */}
          <button 
            onClick={onClose}
            className="w-full bg-pulse-500 hover:bg-pulse-600 text-white py-4 rounded-md text-lg font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopPromoModal; 