import React, { useState } from 'react';
import { ChevronRight, Clipboard, Monitor, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type TodoItem = {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  link?: string;
  onClick?: () => void;
  color: string;
};

interface DesktopAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GettingStartedTodo = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [showDesktopDialog, setShowDesktopDialog] = useState(false);

  const todoItems: TodoItem[] = [
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
      onClick: () => setShowDesktopDialog(true),
      color: 'bg-blue-100 text-blue-600'
    },
  ];

  return (
    <>
      <div className="mb-8 px-1">
        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('dashboard:todo')}</h2>
        
        <div className="space-y-1.5 rounded-lg overflow-hidden shadow-sm">
          {todoItems.map((item) => (
            item.onClick ? (
              <div 
                key={item.id}
                onClick={item.onClick}
                className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
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
              </div>
            ) : (
              <Link 
                key={item.id}
                to={item.link || ''}
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
            )
          ))}
        </div>
      </div>

      <DesktopAppDialog open={showDesktopDialog} onOpenChange={setShowDesktopDialog} />
    </>
  );
};

const DesktopAppDialog: React.FC<DesktopAppDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
            {t('dashboard:discoverFullPower')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6">
          <div className="mx-auto">
            <img 
              src="/images/desktop-app-preview.png" 
              alt="Desktop App Preview" 
              className="w-full max-w-md rounded-md shadow-md"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x400?text=Sweeply+Desktop+App";
              }}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {t('dashboard:accessFullSuite')}
            </h3>
            
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('dashboard:powerfulScheduling')}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('dashboard:customizableBooking')}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('dashboard:automatedFollowUps')}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('dashboard:jobCosting')}</span>
              </li>
            </ul>
          </div>
          
          <p className="text-gray-700">
            {t('dashboard:logInOnComputer')}
          </p>
          
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onOpenChange(false)}
          >
            {t('common:gotIt')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GettingStartedTodo; 