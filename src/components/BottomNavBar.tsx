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
    { icon: DollarSign, label: 'Finance', path: '/finance' },
    { icon: Users, label: 'Team', path: '/team' },
    { icon: MoreHorizontal, label: 'More', path: '/more' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto px-4 z-50 pb-safe">
      <nav className="bg-black text-white rounded-full flex items-center justify-between px-6 py-3.5 max-w-md mx-auto shadow-lg relative">
        <AnimatePresence initial={false}>
          {currentPath && (
            <motion.div
              className="absolute w-9 h-9 bg-white rounded-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                x: navItems.findIndex(item => 
                  currentPath === item.path || 
                  (item.path !== '/' && currentPath.startsWith(item.path))
                ) * 56 - 4
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 28 
              }}
              exit={{ scale: 0.8, opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {navItems.map((item) => {
          const isActive = currentPath === item.path || 
                          (item.path !== '/' && currentPath.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center z-10 transition-all duration-200 ease-in-out w-9 h-9 ${
                isActive 
                  ? "text-black" 
                  : "text-white hover:text-gray-300"
              }`}
              aria-label={item.label}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <item.icon className="w-5 h-5" strokeWidth={2} />
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNavBar; 