import React, { useState } from 'react';
import { ChevronRight, Clipboard, Monitor, UserPlus, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

const GettingStartedTodo = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [showDesktopPopup, setShowDesktopPopup] = useState(false);
  
  const todoItems = [
    {
      id: 'create-quote',
      icon: Clipboard,
      title: t('dashboard:createQuote'),
      description: t('dashboard:boostRevenue'),
      link: '/quotes/new',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'add-client',
      icon: UserPlus,
      title: t('dashboard:addClient'),
      description: t('dashboard:buildDatabase'),
      link: '/clients/new',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'try-desktop',
      icon: Monitor,
      title: t('dashboard:tryDesktop'),
      description: t('dashboard:timeSavingFeatures'),
      link: '#', // Changed to # to handle click manually
      color: 'bg-blue-100 text-blue-600'
    },
  ];

  const handleTryDesktopClick = (e) => {
    // Only show popup on mobile/tablet
    if (window.innerWidth <= 1024) {
      e.preventDefault();
      setShowDesktopPopup(true);
    } else {
      // On desktop, navigate to the original link
      window.location.href = 'https://app.sweeplypro.com';
    }
  };

  return (
    <div className="mb-8 px-1">
      <h2 className="text-xl font-bold text-gray-900 mb-3">{t('dashboard:todo')}</h2>
      
      <div className="space-y-1.5 rounded-lg overflow-hidden shadow-sm">
        {todoItems.map((item) => (
          <Link 
            key={item.id}
            to={item.link}
            onClick={item.id === 'try-desktop' ? handleTryDesktopClick : undefined}
            className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Desktop Features Popup */}
      <Dialog open={showDesktopPopup} onOpenChange={setShowDesktopPopup}>
        <DialogContent className="sm:max-w-[95%] max-h-[90vh] overflow-y-auto p-0 rounded-xl">
          <DialogClose className="absolute right-4 top-4 z-10">
            <X className="h-6 w-6 text-gray-700" />
          </DialogClose>
          
          <div className="flex flex-col p-6 pb-0">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Discover the full power of Sweeply
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Total reviews section */}
              <div className="border rounded-lg p-4 shadow-sm relative">
                <div className="absolute -left-2 -top-2">
                  <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-green-300 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-1">Total reviews</h3>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">92</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                    37%
                  </span>
                </div>
              </div>

              {/* Expenses section */}
              <div className="border rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-medium mb-2">Expenses</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500 font-medium">ITEM</div>
                  <div className="text-gray-500 font-medium">DESCRIPTION</div>
                  <div className="bg-gray-100 h-4 rounded"></div>
                  <div className="bg-gray-100 h-4 rounded"></div>
                </div>
              </div>

              {/* Online Booking section */}
              <div className="border rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-medium mb-2">Online Booking</h3>
                <div className="mb-2">Time slot interval</div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"></div>
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">1h</div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"></div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"></div>
                </div>
              </div>

              {/* Automatic follow-up section */}
              <div className="border rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-medium mb-2">Automatic follow-up</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span>SMS</span>
                  <div className="ml-auto bg-green-600 w-12 h-6 rounded-full relative flex items-center">
                    <span className="text-white text-xs ml-1">ON</span>
                    <div className="absolute right-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                  <span>Email</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">
                Access Sweeply's full suite of time-saving tools like:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <Check className="text-green-600 w-6 h-6" />
                  <span className="text-lg">Powerful, full-view scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-600 w-6 h-6" />
                  <span className="text-lg">Customizable online booking forms</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-600 w-6 h-6" />
                  <span className="text-lg">Automated quote and invoice follow-ups</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-600 w-6 h-6" />
                  <span className="text-lg">Job costing and automatic billing</span>
                </li>
              </ul>
            </div>

            <p className="text-lg mb-6">
              Log in, on your computer, through the email in your inbox.
            </p>
          </div>

          <button 
            className="w-full bg-green-600 text-white text-xl font-medium py-4 hover:bg-green-700 transition-colors"
            onClick={() => setShowDesktopPopup(false)}
          >
            Got it
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GettingStartedTodo; 