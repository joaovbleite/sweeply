import React from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Megaphone,
  MessageSquare,
  CreditCard,
  Sparkles,
  Gift,
  HelpCircle,
  User,
  Users,
  Building2,
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const More: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect is handled by AuthContext
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error(t('common:errorOccurred'));
    }
  };

  // Get user's email safely
  const userEmail = user?.email || '';

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Fixed header */}
        <div className="sticky top-0 left-0 right-0 z-20 bg-white shadow-sm">
          <div className="px-4 py-3 flex items-center">
            <h1 className="text-xl font-bold">{t('settings:more')}</h1>
          </div>
        </div>

        <div className="px-4 py-6">
          {/* Feature Boxes */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Link 
              to="/integrations" 
              className="flex flex-col items-start justify-between p-4 bg-white rounded-lg shadow border border-gray-100"
            >
              <Grid className="w-5 h-5 text-blue-600 mb-2" />
              <div>
                <div className="font-medium text-gray-900">{t('settings:appsAndIntegrations')}</div>
              </div>
            </Link>
            
            <a 
              href="https://barberops.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-start justify-between p-4 bg-white rounded-lg shadow border border-gray-100"
            >
              <Megaphone className="w-5 h-5 text-rose-600 mb-2" />
              <div>
                <div className="font-medium text-gray-900">{t('settings:marketing')}</div>
              </div>
            </a>
          </div>

          {/* Menu Lists */}
          <div className="mb-8">
            <div className="space-y-0.5">
              <Link 
                to="/support"
                className="flex items-center justify-between px-3 py-3.5 bg-white rounded-lg"
              >
                <span className="text-gray-800 font-medium">{t('settings:support')}</span>
                <div className="text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
              
              <Link 
                to="/subscription"
                className="flex items-center justify-between px-3 py-3.5 bg-white rounded-lg"
              >
                <span className="text-gray-800 font-medium">{t('settings:subscription')}</span>
                <div className="text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
              
              <Link 
                to="/refer"
                className="flex items-center justify-between px-3 py-3.5 bg-white rounded-lg"
              >
                <span className="text-gray-800 font-medium">{t('settings:referAFriend')}</span>
                <div className="text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
              
              <Link 
                to="/help"
                className="flex items-center justify-between px-3 py-3.5 bg-white rounded-lg"
              >
                <span className="text-gray-800 font-medium">{t('settings:help')}</span>
                <div className="text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gray-200 my-4"></div>
          
          {/* Second Menu List */}
          <div className="mb-8">
            <div className="space-y-0.5">
              <Link 
                to="/profile"
                className="flex items-center justify-between px-3 py-3.5 bg-white rounded-lg"
              >
                <span className="text-gray-800 font-medium">{t('settings:profile')}</span>
                <div className="text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
              
              <Link 
                to="/team"
                className="flex items-center justify-between px-3 py-3.5 bg-white rounded-lg"
              >
                <span className="text-gray-800 font-medium">{t('settings:manageTeam')}</span>
                <div className="text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
              
              <Link 
                to="/company"
                className="flex items-center justify-between px-3 py-3.5 bg-white rounded-lg"
              >
                <span className="text-gray-800 font-medium">{t('settings:companyDetails')}</span>
                <div className="text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
              
              <Link 
                to="/preferences"
                className="flex items-center justify-between px-3 py-3.5 bg-white rounded-lg"
              >
                <span className="text-gray-800 font-medium">{t('settings:preferences')}</span>
                <div className="text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gray-200 my-4"></div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-3.5 bg-white rounded-lg text-red-600 font-medium"
          >
            {t('common:logout')}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default More; 