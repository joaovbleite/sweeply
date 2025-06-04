import React from 'react';
import { ChevronRight, Clipboard, Monitor, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GettingStartedTodo = () => {
  const { t } = useTranslation(['dashboard', 'common']);

  const todoItems = [
    {
      id: 'create-quote',
      icon: Clipboard,
      title: t('dashboard:createQuote'),
      description: t('dashboard:boostRevenue'),
      link: '/quotes/new',
      color: 'bg-rose-100 text-rose-600'
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
      color: 'bg-gray-100 text-gray-600'
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dashboard:todo')}</h2>
      
      <div className="space-y-px">
        {todoItems.map((item) => (
          <Link 
            key={item.id}
            to={item.link}
            className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-full ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GettingStartedTodo; 