import React from 'react';
import { X, Check } from 'lucide-react';

interface DesktopPromoModalProps {
  onClose: () => void;
}

const DesktopPromoModal: React.FC<DesktopPromoModalProps> = ({ onClose }) => {
  const features = [
    "Powerful, full-view scheduling",
    "Customizable online booking forms",
    "Automated quote and invoice follow-ups",
    "Job costing and automatic billing",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div 
        className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 relative shadow-2xl"
        style={{ animation: 'scale-up 0.3s ease-out' }}
      >
        {/* Drag Handle */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-9 h-1 bg-gray-300 rounded-full" />
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-800 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-gray-900 mt-4 mb-4 text-left">
          Discover the full power of Sweeply
        </h2>

        {/* Feature Graphic Placeholder */}
        <div className="h-40 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 my-4">
          <div className="text-center">
             <img src="/lovable-uploads/c3d5522b-6886-4b75-8ffc-d020016bb9c2.png" alt="Sweeply on Desktop" className="w-full h-auto" />
          </div>
        </div>


        {/* Description/Checklist */}
        <p className="text-base text-gray-700 text-left mb-4">
          Access Sweeply's full suite of time-saving tools like:
        </p>
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-base font-medium text-gray-800">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Footer Text */}
        <p className="text-sm text-gray-600 text-left my-4">
          Log in, on your computer, through the email in your inbox.
        </p>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white text-base font-semibold py-3.5 px-6 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-95"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default DesktopPromoModal; 