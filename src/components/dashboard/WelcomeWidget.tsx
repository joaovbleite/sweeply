import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, TrendingUp, Target, Zap } from 'lucide-react';

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

  const todayQuote = quotes[new Date().getDay() % quotes.length];
  const QuoteIcon = todayQuote.icon;

  return (
    <div className="bg-gradient-to-r from-pulse-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-start justify-between">
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
    </div>
  );
};

export default WelcomeWidget; 