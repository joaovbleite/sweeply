import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  Save,
  Clock,
  Calendar,
  Bell,
  Globe,
  Palette,
  Layout,
  Map,
  BarChart3,
  Eye,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarPreferences {
  defaultView: 'month' | 'week' | 'day' | 'list' | 'timeline' | 'map';
  workingHours: { start: string; end: string };
  maxJobsPerDay: number;
  autoRefreshInterval: number;
  showWeekends: boolean;
  showRevenue: boolean;
  showConflicts: boolean;
  theme: 'light' | 'dark' | 'auto';
  colorScheme: 'default' | 'colorful' | 'minimal';
  timeFormat: '12h' | '24h';
  weekStartsOn: 'sunday' | 'monday';
  notifications: {
    jobReminders: boolean;
    conflictAlerts: boolean;
    dailySummary: boolean;
  };
}

interface CalendarSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: CalendarPreferences) => void;
  currentPreferences?: CalendarPreferences;
  darkMode?: boolean;
}

const defaultPreferences: CalendarPreferences = {
  defaultView: 'month',
  workingHours: { start: '08:00', end: '18:00' },
  maxJobsPerDay: 8,
  autoRefreshInterval: 30,
  showWeekends: true,
  showRevenue: true,
  showConflicts: true,
  theme: 'light',
  colorScheme: 'default',
  timeFormat: '12h',
  weekStartsOn: 'sunday',
  notifications: {
    jobReminders: true,
    conflictAlerts: true,
    dailySummary: false
  }
};

const CalendarSettings: React.FC<CalendarSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  currentPreferences = defaultPreferences,
  darkMode = false
}) => {
  const [preferences, setPreferences] = useState<CalendarPreferences>(currentPreferences);
  const [activeTab, setActiveTab] = useState<'general' | 'display' | 'notifications'>('general');

  useEffect(() => {
    setPreferences(currentPreferences);
  }, [currentPreferences]);

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white'
          } rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Calendar Settings
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all relative ${
                    activeTab === tab.id
                      ? darkMode ? 'text-pulse-400' : 'text-pulse-600'
                      : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                        darkMode ? 'bg-pulse-400' : 'bg-pulse-600'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Default View */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Default Calendar View
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['month', 'week', 'day', 'list', 'timeline', 'map'].map((view) => (
                      <button
                        key={view}
                        onClick={() => setPreferences({ ...preferences, defaultView: view as any })}
                        className={`py-2 px-3 rounded-lg capitalize transition-all ${
                          preferences.defaultView === view
                            ? 'bg-pulse-500 text-white'
                            : darkMode
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Working Hours
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Start</label>
                      <input
                        type="time"
                        value={preferences.workingHours.start}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          workingHours: { ...preferences.workingHours, start: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-lg ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-gray-100 border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">End</label>
                      <input
                        type="time"
                        value={preferences.workingHours.end}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          workingHours: { ...preferences.workingHours, end: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-lg ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-gray-100 border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Max Jobs Per Day */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum Jobs Per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={preferences.maxJobsPerDay}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      maxJobsPerDay: parseInt(e.target.value) || 8
                    })}
                    className={`w-full px-3 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  />
                </div>

                {/* Auto Refresh */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Auto-refresh Interval (seconds)
                  </label>
                  <select
                    value={preferences.autoRefreshInterval}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      autoRefreshInterval: parseInt(e.target.value)
                    })}
                    className={`w-full px-3 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <option value="0">Disabled</option>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                  </select>
                </div>

                {/* Week Settings */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Week Starts On
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['sunday', 'monday'].map((day) => (
                      <button
                        key={day}
                        onClick={() => setPreferences({
                          ...preferences,
                          weekStartsOn: day as 'sunday' | 'monday'
                        })}
                        className={`py-2 px-3 rounded-lg capitalize transition-all ${
                          preferences.weekStartsOn === day
                            ? 'bg-pulse-500 text-white'
                            : darkMode
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'light', icon: Sun, label: 'Light' },
                      { value: 'dark', icon: Moon, label: 'Dark' },
                      { value: 'auto', icon: Settings, label: 'Auto' }
                    ].map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <button
                          key={theme.value}
                          onClick={() => setPreferences({
                            ...preferences,
                            theme: theme.value as any
                          })}
                          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                            preferences.theme === theme.value
                              ? 'bg-pulse-500 text-white'
                              : darkMode
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{theme.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Scheme */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Color Scheme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['default', 'colorful', 'minimal'].map((scheme) => (
                      <button
                        key={scheme}
                        onClick={() => setPreferences({
                          ...preferences,
                          colorScheme: scheme as any
                        })}
                        className={`py-2 px-3 rounded-lg capitalize transition-all ${
                          preferences.colorScheme === scheme
                            ? 'bg-pulse-500 text-white'
                            : darkMode
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {scheme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Format */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Time Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['12h', '24h'].map((format) => (
                      <button
                        key={format}
                        onClick={() => setPreferences({
                          ...preferences,
                          timeFormat: format as '12h' | '24h'
                        })}
                        className={`py-2 px-3 rounded-lg transition-all ${
                          preferences.timeFormat === format
                            ? 'bg-pulse-500 text-white'
                            : darkMode
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {format === '12h' ? '12-hour' : '24-hour'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Options */}
                <div className="space-y-4">
                  <h3 className="font-medium">Display Options</h3>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Show Weekends</span>
                    <input
                      type="checkbox"
                      checked={preferences.showWeekends}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        showWeekends: e.target.checked
                      })}
                      className="toggle"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm">Show Revenue</span>
                    <input
                      type="checkbox"
                      checked={preferences.showRevenue}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        showRevenue: e.target.checked
                      })}
                      className="toggle"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm">Show Conflicts</span>
                    <input
                      type="checkbox"
                      checked={preferences.showConflicts}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        showConflicts: e.target.checked
                      })}
                      className="toggle"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="font-medium">Email Notifications</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Job Reminders</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get notified 1 hour before scheduled jobs
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notifications.jobReminders}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          jobReminders: e.target.checked
                        }
                      })}
                      className="toggle"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Conflict Alerts</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Alert when scheduling conflicts are detected
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notifications.conflictAlerts}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          conflictAlerts: e.target.checked
                        }
                      })}
                      className="toggle"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Daily Summary</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive daily schedule summary at 7 AM
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notifications.dailySummary}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          dailySummary: e.target.checked
                        }
                      })}
                      className="toggle"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end gap-3 p-6 border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CalendarSettings; 