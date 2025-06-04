import React, { useState } from 'react';
import { ChevronRight, Clipboard, Monitor, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import DesktopPromoModal from './DesktopPromoModal';

const GettingStartedTodo = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [isDesktopPromoOpen, setIsDesktopPromoOpen] = useState(false);
  const isMobile = useIsMobile();

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
      link: 'https://app.sweeplypro.com',
      color: 'bg-blue-100 text-blue-600'
    },
  ];

  const handleItemClick = (id: string, e: React.MouseEvent) => {
    if (id === 'try-desktop' && isMobile) {
      e.preventDefault();
      setIsDesktopPromoOpen(true);
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
            className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
            onClick={(e) => handleItemClick(item.id, e)}
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

      {/* Desktop Promo Modal */}
      <DesktopPromoModal 
        isOpen={isDesktopPromoOpen} 
        onClose={() => setIsDesktopPromoOpen(false)} 
      />
    </div>
  );
};

export default GettingStartedTodo; 