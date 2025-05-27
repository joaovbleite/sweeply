export type CalendarView = 'month' | 'week' | 'day' | 'list' | 'timeline' | 'map';

export interface CalendarPreferences {
  defaultView: CalendarView;
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