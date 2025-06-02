import React, { useState } from "react";
import { 
  Settings, 
  User, 
  Bell, 
  Globe, 
  Moon, 
  Sun,
  LogOut, 
  ChevronRight,
  Smartphone,
  Shield,
  CreditCard,
  HelpCircle,
  FileText,
  Mail
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const MobileSettings: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect is handled by AuthContext
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error(t('common:errorOccurred'));
    }
  };

  // Dummy function to handle dark mode toggle for now
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(`${darkMode ? 'Light' : 'Dark'} mode will be implemented soon`);
  };

  const settingSections = [
    {
      title: t('settings:account'),
      items: [
        { id: 'profile', icon: User, label: t('settings:profile'), path: '/profile' },
        { id: 'notifications', icon: Bell, label: t('settings:notifications'), path: '/notifications' },
        { id: 'language', icon: Globe, label: t('settings:language'), path: '/language' },
      ]
    },
    {
      title: t('settings:preferences'),
      items: [
        { 
          id: 'darkMode', 
          icon: darkMode ? Sun : Moon, 
          label: t('settings:darkMode'), 
          toggle: true,
          checked: darkMode,
          onChange: toggleDarkMode
        },
        { id: 'mobileApp', icon: Smartphone, label: t('settings:mobileApp'), path: '/mobile-app' },
      ]
    },
    {
      title: t('settings:billing'),
      items: [
        { id: 'subscription', icon: CreditCard, label: t('settings:subscription'), path: '/subscription' },
        { id: 'invoices', icon: FileText, label: t('settings:invoices'), path: '/billing-invoices' },
      ]
    },
    {
      title: t('settings:support'),
      items: [
        { id: 'help', icon: HelpCircle, label: t('settings:helpCenter'), path: '/help' },
        { id: 'contact', icon: Mail, label: t('settings:contactSupport'), path: '/contact' },
        { id: 'privacy', icon: Shield, label: t('settings:privacySecurity'), path: '/privacy' },
      ]
    }
  ];

  // Get user display information safely
  const userEmail = user?.email || '';
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <div className="flex items-center mb-6">
          <Settings className="w-7 h-7 mr-3 text-pulse-500" />
          <h1 className="text-2xl font-bold text-gray-900">{t('settings:settings')}</h1>
        </div>

        {/* User Profile Preview */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">{userName}</h2>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        {settingSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h3>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {section.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <div className="border-t border-gray-100" />}
                  {item.toggle ? (
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 text-gray-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={item.checked} 
                          onChange={item.onChange} 
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pulse-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-500"></div>
                      </label>
                    </div>
                  ) : (
                    <a 
                      href={item.path} 
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 text-gray-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 mt-4 bg-white text-red-600 rounded-xl shadow-sm hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('common:logout')}</span>
        </button>

        <div className="text-center mt-8 text-xs text-gray-500">
          <p>Version 1.0.0</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Sweeply. All rights reserved.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default MobileSettings; 