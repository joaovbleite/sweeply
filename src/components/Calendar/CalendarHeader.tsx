import React from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Filter,
  Download,
  Settings,
  BarChart3,
  Eye,
  EyeOff,
  RefreshCw,
  Grid3x3,
  List,
  Clock,
  Map,
  Search,
  Bell,
  Sun,
  Moon,
  Zap,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarView } from '@/types/calendar';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  onQuickAdd: () => void;
  onExport: () => void;
  onToggleAnalytics: () => void;
  onToggleAutoRefresh: () => void;
  onSearch?: (searchTerm: string) => void;
  autoRefresh: boolean;
  showAnalytics: boolean;
  stats: {
    todayJobs: number;
    weeklyRevenue: number;
    conflicts: number;
  };
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  onViewChange,
  onDateChange,
  onQuickAdd,
  onExport,
  onToggleAnalytics,
  onToggleAutoRefresh,
  onSearch,
  autoRefresh,
  showAnalytics,
  stats,
  darkMode = false,
  onToggleDarkMode
}) => {
  const viewOptions: { value: CalendarView; icon: React.ReactNode; label: string }[] = [
    { value: 'month', icon: <Grid3x3 className="w-4 h-4" />, label: 'Month' },
    { value: 'week', icon: <Calendar className="w-4 h-4" />, label: 'Week' },
    { value: 'day', icon: <Clock className="w-4 h-4" />, label: 'Day' },
    { value: 'list', icon: <List className="w-4 h-4" />, label: 'List' },
    { value: 'timeline', icon: <BarChart3 className="w-4 h-4" />, label: 'Timeline' },
    { value: 'map', icon: <Map className="w-4 h-4" />, label: 'Map' }
  ];

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'week' || view === 'timeline') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'week' || view === 'timeline') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const getDateDisplay = () => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'week' || view === 'timeline') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'EEEE, MMMM d, yyyy');
  };

  return (
    <div className={`space-y-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Calendar Icon with Animation */}
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="hidden sm:block"
          >
            <div className="p-3 bg-gradient-to-br from-pulse-500 to-purple-600 rounded-2xl shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              className={`p-2 rounded-lg transition-all ${
                darkMode 
                  ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.h2
                key={getDateDisplay()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="text-xl sm:text-2xl font-bold min-w-[200px] sm:min-w-[280px] text-center"
              >
                {getDateDisplay()}
              </motion.h2>
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className={`p-2 rounded-lg transition-all ${
                darkMode 
                  ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateChange(new Date())}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Today
            </motion.button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggle with Animation */}
          <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            {viewOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewChange(option.value)}
                className={`relative px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-1.5 ${
                  view === option.value 
                    ? '' 
                    : darkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
                title={option.label}
              >
                {view === option.value && (
                  <motion.div
                    layoutId="activeView"
                    className={`absolute inset-0 rounded-lg ${
                      darkMode 
                        ? 'bg-gradient-to-r from-pulse-600 to-purple-600' 
                        : 'bg-gradient-to-r from-pulse-500 to-purple-500'
                    }`}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${view === option.value ? 'text-white' : ''}`}>
                  {option.icon}
                </span>
                <span className={`relative z-10 hidden sm:inline ${view === option.value ? 'text-white' : ''}`}>
                  {option.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Utility Buttons */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleAutoRefresh}
              className={`p-2 rounded-lg transition-all ${
                autoRefresh 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                  : darkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleAnalytics}
              className={`p-2 rounded-lg transition-all ${
                showAnalytics 
                  ? 'bg-pulse-100 text-pulse-600 dark:bg-pulse-900 dark:text-pulse-300' 
                  : darkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            >
              {showAnalytics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExport}
              className={`p-2 rounded-lg transition-all ${
                darkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Export Calendar"
            >
              <Download className="w-4 h-4" />
            </motion.button>

            {onToggleDarkMode && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleDarkMode}
                className={`p-2 rounded-lg transition-all ${
                  darkMode
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.button>
            )}
          </div>

          {/* Quick Add Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onQuickAdd}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg ${
              darkMode
                ? 'bg-gradient-to-r from-pulse-600 to-purple-600 text-white hover:from-pulse-700 hover:to-purple-700'
                : 'bg-gradient-to-r from-pulse-500 to-purple-500 text-white hover:from-pulse-600 hover:to-purple-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </motion.button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 flex-wrap"
      >
        <div className={`flex items-center gap-6 px-4 py-2 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-300">{stats.todayJobs}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Today</div>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <div className="text-lg font-bold text-green-600 dark:text-green-300">${stats.weeklyRevenue}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">This Week</div>
            </div>
          </div>

          {stats.conflicts > 0 && (
            <>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded-lg animate-pulse">
                  <Bell className="w-4 h-4 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600 dark:text-red-300">{stats.conflicts}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Conflicts</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search jobs, clients..."
              onChange={(e) => onSearch?.(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg transition-all ${
                darkMode
                  ? 'bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-pulse-500'
              }`}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarHeader; 