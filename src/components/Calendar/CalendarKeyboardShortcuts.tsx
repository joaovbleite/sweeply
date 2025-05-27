import React, { useEffect } from 'react';
import { 
  Keyboard, 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  Grid3x3,
  List,
  Map,
  BarChart3,
  Clock,
  Filter,
  Download,
  Search,
  X,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcut {
  key: string;
  description: string;
  icon?: React.ReactNode;
  modifier?: 'ctrl' | 'cmd' | 'shift' | 'alt';
}

interface CalendarKeyboardShortcutsProps {
  onShortcut: (action: string) => void;
  darkMode?: boolean;
  showHelper?: boolean;
  onToggleHelper?: () => void;
}

const CalendarKeyboardShortcuts: React.FC<CalendarKeyboardShortcutsProps> = ({
  onShortcut,
  darkMode = false,
  showHelper = false,
  onToggleHelper
}) => {
  const shortcuts: KeyboardShortcut[] = [
    { key: 'n', description: 'New Job', icon: <Plus className="w-4 h-4" />, modifier: 'ctrl' },
    { key: 'ArrowLeft', description: 'Previous Period', icon: <ArrowLeft className="w-4 h-4" /> },
    { key: 'ArrowRight', description: 'Next Period', icon: <ArrowRight className="w-4 h-4" /> },
    { key: 't', description: 'Go to Today' },
    { key: '1', description: 'Month View', icon: <Grid3x3 className="w-4 h-4" /> },
    { key: '2', description: 'Week View', icon: <Clock className="w-4 h-4" /> },
    { key: '3', description: 'Day View' },
    { key: '4', description: 'List View', icon: <List className="w-4 h-4" /> },
    { key: '5', description: 'Timeline View', icon: <BarChart3 className="w-4 h-4" /> },
    { key: '6', description: 'Map View', icon: <Map className="w-4 h-4" /> },
    { key: 'f', description: 'Open Filters', icon: <Filter className="w-4 h-4" />, modifier: 'ctrl' },
    { key: 'e', description: 'Export Calendar', icon: <Download className="w-4 h-4" />, modifier: 'ctrl' },
    { key: '/', description: 'Focus Search', icon: <Search className="w-4 h-4" /> },
    { key: 'd', description: 'Toggle Dark Mode', icon: <Moon className="w-4 h-4" />, modifier: 'ctrl' },
    { key: 'Escape', description: 'Close Modal', icon: <X className="w-4 h-4" /> },
    { key: '?', description: 'Show/Hide Shortcuts', icon: <Keyboard className="w-4 h-4" /> }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement || 
          e.target instanceof HTMLSelectElement) {
        return;
      }

      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Check for question mark (shift + /)
      if (shift && key === '/' && onToggleHelper) {
        e.preventDefault();
        onToggleHelper();
        return;
      }

      // New Job (Ctrl/Cmd + N)
      if (ctrl && key === 'n') {
        e.preventDefault();
        onShortcut('newJob');
      }
      // Navigation
      else if (key === 'ArrowLeft' && !ctrl && !shift) {
        e.preventDefault();
        onShortcut('previousPeriod');
      }
      else if (key === 'ArrowRight' && !ctrl && !shift) {
        e.preventDefault();
        onShortcut('nextPeriod');
      }
      else if (key === 't' && !ctrl && !shift) {
        e.preventDefault();
        onShortcut('today');
      }
      // View changes (1-6)
      else if (['1', '2', '3', '4', '5', '6'].includes(key) && !ctrl && !shift) {
        e.preventDefault();
        const views = ['month', 'week', 'day', 'list', 'timeline', 'map'];
        onShortcut(`view-${views[parseInt(key) - 1]}`);
      }
      // Filters (Ctrl/Cmd + F)
      else if (ctrl && key === 'f') {
        e.preventDefault();
        onShortcut('openFilters');
      }
      // Export (Ctrl/Cmd + E)
      else if (ctrl && key === 'e') {
        e.preventDefault();
        onShortcut('export');
      }
      // Search (/)
      else if (key === '/' && !shift && !ctrl) {
        e.preventDefault();
        onShortcut('focusSearch');
      }
      // Dark Mode (Ctrl/Cmd + D)
      else if (ctrl && key === 'd') {
        e.preventDefault();
        onShortcut('toggleDarkMode');
      }
      // Escape
      else if (key === 'Escape') {
        onShortcut('closeModal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onShortcut, onToggleHelper]);

  const getModifierKey = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return isMac ? 'Cmd' : 'Ctrl';
  };

  return (
    <AnimatePresence>
      {showHelper && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-8 right-8 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-xl shadow-2xl p-6 max-w-md z-50`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-pulse-500" />
              Keyboard Shortcuts
            </h3>
            <button
              onClick={onToggleHelper}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {shortcuts.map((shortcut, index) => (
              <motion.div
                key={shortcut.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {shortcut.icon && (
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {shortcut.icon}
                    </div>
                  )}
                  <span className="text-sm">{shortcut.description}</span>
                </div>
                <div className="flex items-center gap-1">
                  {shortcut.modifier && (
                    <>
                      <kbd className={`px-2 py-1 text-xs rounded ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 border border-gray-600' 
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}>
                        {shortcut.modifier === 'cmd' || shortcut.modifier === 'ctrl' 
                          ? getModifierKey() 
                          : shortcut.modifier.charAt(0).toUpperCase() + shortcut.modifier.slice(1)
                        }
                      </kbd>
                      <span className="text-xs text-gray-500">+</span>
                    </>
                  )}
                  <kbd className={`px-2 py-1 text-xs rounded ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 border border-gray-600' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}>
                    {shortcut.key === 'ArrowLeft' ? '←' :
                     shortcut.key === 'ArrowRight' ? '→' :
                     shortcut.key === 'Escape' ? 'Esc' :
                     shortcut.key}
                  </kbd>
                </div>
              </motion.div>
            ))}
          </div>

          <div className={`mt-4 pt-4 border-t text-xs text-center ${
            darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
          }`}>
            Press <kbd className={`px-1.5 py-0.5 rounded ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>?</kbd> to toggle this help
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CalendarKeyboardShortcuts; 