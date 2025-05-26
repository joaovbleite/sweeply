export type EmployeeStatus = 'active' | 'inactive' | 'terminated' | 'on_leave';
export type EmployeeRole = 'cleaner' | 'supervisor' | 'manager' | 'admin' | 'driver';
export type PayrollFrequency = 'weekly' | 'bi_weekly' | 'monthly';
export type PaymentMethod = 'direct_deposit' | 'check' | 'cash';
export type PerformanceRating = 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory';

export interface Employee {
  id: string;
  user_id: string;
  
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // Employment Details
  employee_id: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  hire_date: string;
  termination_date?: string;
  department?: string;
  
  // Compensation
  hourly_rate: number;
  salary?: number;
  payroll_frequency: PayrollFrequency;
  payment_method: PaymentMethod;
  bank_account?: string;
  routing_number?: string;
  
  // Work Schedule
  weekly_hours: number;
  schedule_notes?: string;
  
  // Skills and Certifications
  skills: string[];
  certifications: string[];
  languages: string[];
  
  // Performance Metrics
  current_rating?: PerformanceRating;
  total_jobs_completed: number;
  average_rating: number;
  total_hours_worked: number;
  
  // Metadata
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  role: EmployeeRole;
  hire_date: string;
  department?: string;
  hourly_rate: number;
  salary?: number;
  payroll_frequency: PayrollFrequency;
  payment_method: PaymentMethod;
  bank_account?: string;
  routing_number?: string;
  weekly_hours: number;
  schedule_notes?: string;
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  notes?: string;
}

export interface UpdateEmployeeInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  role?: EmployeeRole;
  status?: EmployeeStatus;
  termination_date?: string;
  department?: string;
  hourly_rate?: number;
  salary?: number;
  payroll_frequency?: PayrollFrequency;
  payment_method?: PaymentMethod;
  bank_account?: string;
  routing_number?: string;
  weekly_hours?: number;
  schedule_notes?: string;
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  current_rating?: PerformanceRating;
  notes?: string;
}

export interface EmployeeFilters {
  status?: EmployeeStatus[];
  role?: EmployeeRole[];
  department?: string;
  hire_date_from?: string;
  hire_date_to?: string;
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  on_leave: number;
  terminated: number;
  total_payroll: number;
  avg_hourly_rate: number;
  avg_performance_rating: number;
  total_hours_this_month: number;
}

// Payroll Types
export interface PayrollPeriod {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  status: 'draft' | 'processed' | 'paid';
  total_amount: number;
  total_hours: number;
  created_at: string;
  updated_at: string;
}

export interface PayrollEntry {
  id: string;
  user_id: string;
  employee_id: string;
  payroll_period_id: string;
  employee?: Employee;
  
  // Hours and Pay
  regular_hours: number;
  overtime_hours: number;
  holiday_hours: number;
  sick_hours: number;
  vacation_hours: number;
  
  // Rates
  regular_rate: number;
  overtime_rate: number;
  holiday_rate: number;
  
  // Calculations
  gross_pay: number;
  deductions: number;
  net_pay: number;
  
  // Deduction Details
  tax_deductions: number;
  insurance_deductions: number;
  other_deductions: number;
  
  // Bonuses and Adjustments
  bonus: number;
  adjustments: number;
  
  // Job Performance
  jobs_completed: number;
  performance_bonus: number;
  
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePayrollEntryInput {
  employee_id: string;
  payroll_period_id: string;
  regular_hours: number;
  overtime_hours?: number;
  holiday_hours?: number;
  sick_hours?: number;
  vacation_hours?: number;
  bonus?: number;
  adjustments?: number;
  jobs_completed?: number;
  performance_bonus?: number;
  deductions?: number;
  tax_deductions?: number;
  insurance_deductions?: number;
  other_deductions?: number;
  notes?: string;
}

// Performance Types
export interface PerformanceReview {
  id: string;
  user_id: string;
  employee_id: string;
  employee?: Employee;
  
  // Review Details
  review_period_start: string;
  review_period_end: string;
  review_date: string;
  reviewer_name: string;
  
  // Performance Metrics
  overall_rating: PerformanceRating;
  punctuality_rating: PerformanceRating;
  quality_rating: PerformanceRating;
  teamwork_rating: PerformanceRating;
  communication_rating: PerformanceRating;
  initiative_rating: PerformanceRating;
  
  // Quantitative Metrics
  jobs_completed: number;
  client_satisfaction_score: number;
  attendance_percentage: number;
  
  // Feedback
  strengths: string[];
  areas_for_improvement: string[];
  goals: string[];
  comments: string;
  employee_comments?: string;
  
  // Action Items
  action_items: string[];
  next_review_date?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CreatePerformanceReviewInput {
  employee_id: string;
  review_period_start: string;
  review_period_end: string;
  review_date: string;
  reviewer_name: string;
  overall_rating: PerformanceRating;
  punctuality_rating: PerformanceRating;
  quality_rating: PerformanceRating;
  teamwork_rating: PerformanceRating;
  communication_rating: PerformanceRating;
  initiative_rating: PerformanceRating;
  jobs_completed: number;
  client_satisfaction_score: number;
  attendance_percentage: number;
  strengths: string[];
  areas_for_improvement: string[];
  goals: string[];
  comments: string;
  employee_comments?: string;
  action_items: string[];
  next_review_date?: string;
}

export interface PerformanceMetrics {
  employee_id: string;
  period_start: string;
  period_end: string;
  jobs_completed: number;
  total_hours: number;
  average_job_rating: number;
  client_complaints: number;
  client_compliments: number;
  attendance_rate: number;
  punctuality_rate: number;
  revenue_generated: number;
} 
 
 
 
 