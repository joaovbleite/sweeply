import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, TrendingUp, Target, Zap, Plus, Calendar, Users, Lightbulb } from 'lucide-react';

const WelcomeWidget = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  // Random motivational quotes
  const quotes = [
    { text: "A clean space is a happy place!", icon: Sparkles },
    { text: "Building success one clean at a time", icon: TrendingUp },
    { text: "Your dedication makes homes shine", icon: Target },
    { text: "Excellence in every detail", icon: Zap }
  ];

  // Business tips that rotate daily
  const businessTips = [
    "💡 Follow up with clients 24 hours after service to ensure satisfaction",
    "💡 Offer package deals for recurring weekly or bi-weekly cleanings",
    "💡 Take before/after photos to showcase your quality work",
    "💡 Ask satisfied clients for referrals - word of mouth is powerful",
    "💡 Set aside 15 minutes each day to update your schedule",
    "💡 Seasonal deep cleaning services can boost your revenue",
    "💡 Professional photos for your portfolio attract premium clients"
  ];

  const todayQuote = quotes[new Date().getDay() % quotes.length];
  const todayTip = businessTips[new Date().getDate() % businessTips.length];
  const QuoteIcon = todayQuote.icon;

  return (
    <div className="bg-gradient-to-r from-pulse-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2">
            {getGreeting()}, {userName}! 👋
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <QuoteIcon className="w-5 h-5" />
            <p className="text-lg opacity-90">{todayQuote.text}</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="opacity-75">Today's Date</p>
              <p className="font-semibold">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div>
              <p className="opacity-75">Current Time</p>
              <p className="font-semibold">{new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:block">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Quick Actions & Business Tip */}
      <div className="border-t border-white/20 pt-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          {/* Quick Actions */}
          <div className="flex gap-3">
            <Link 
              to="/add-job" 
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Job</span>
            </Link>
            <Link 
              to="/calendar" 
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Schedule</span>
            </Link>
            <Link 
              to="/clients" 
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Clients</span>
            </Link>
          </div>

          {/* Daily Business Tip */}
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
            <Lightbulb className="w-4 h-4 text-yellow-300" />
            <span className="text-sm opacity-90">{todayTip}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeWidget; 