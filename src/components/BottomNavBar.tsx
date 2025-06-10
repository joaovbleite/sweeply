import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, DollarSign, Users, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: DollarSign, label: 'Billing', path: '/billing' },
    { icon: Users, label: 'Team', path: '/team' },
    { icon: MoreHorizontal, label: 'More', path: '/more' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav className="flex justify-around items-center bg-black text-white h-[72px] rounded-t-3xl px-6">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || 
                          (item.path !== '/' && currentPath.startsWith(item.path));

          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className="flex flex-col items-center justify-center relative"
            >
              <div className="relative w-12 h-12 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-white rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        transition: { 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 30,
                          duration: 0.3
                        }
                      }}
                      exit={{ 
                        scale: 0, 
                        opacity: 0,
                        transition: { 
                          duration: 0.2 
                        }
                      }}
                    />
                  )}
                </AnimatePresence>
                
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: isActive ? 0.9 : 1,
                    transition: { 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30 
                    }
                  }}
                  className="z-10"
                >
                  <item.icon 
                    className={`w-6 h-6 transition-colors ${isActive ? 'text-black' : 'text-white'}`} 
                  />
                </motion.div>
              </div>
              
              <motion.span
                className={`text-[10px] mt-0.5 font-medium transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400'}`}
                animate={{ 
                  y: isActive ? -2 : 0,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }
                }}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </nav>
      
      {/* Safe area padding for notched devices */}
      <div className="h-[env(safe-area-inset-bottom, 0px)] bg-black"></div>
    </div>
  );
};

export default BottomNavBar; 