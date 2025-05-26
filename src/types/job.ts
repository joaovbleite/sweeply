export type ServiceType = 
  | 'regular' 
  | 'deep_clean' 
  | 'move_in' 
  | 'move_out' 
  | 'post_construction' 
  | 'one_time';

export type JobStatus = 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export type RecurringFrequency = 
  | 'weekly' 
  | 'biweekly' 
  | 'monthly' 
  | 'quarterly';

export interface Job {
  id: string;
  user_id: string;
  client_id: string;
  
  // Job Details
  title: string;
  description?: string;
  service_type: ServiceType;
  status: JobStatus;
  
  // Scheduling
  scheduled_date: string; // ISO date string
  scheduled_time?: string; // HH:MM format
  estimated_duration?: number; // in minutes
  actual_start_time?: string; // ISO datetime string
  actual_end_time?: string; // ISO datetime string
  
  // Pricing
  estimated_price?: number;
  actual_price?: number;
  
  // Location & Instructions
  address?: string;
  special_instructions?: string;
  access_instructions?: string;
  
  // Completion Details
  completion_notes?: string;
  before_photos?: string[];
  after_photos?: string[];
  
  // Recurring Job Info
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_end_date?: string; // ISO date string
  parent_job_id?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Joined data (when fetching with client info)
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export interface CreateJobInput {
  client_id: string;
  title: string;
  description?: string;
  service_type: ServiceType;
  scheduled_date: string;
  scheduled_time?: string;
  estimated_duration?: number;
  estimated_price?: number;
  address?: string;
  special_instructions?: string;
  access_instructions?: string;
  is_recurring?: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_end_date?: string;
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  service_type?: ServiceType;
  status?: JobStatus;
  scheduled_date?: string;
  scheduled_time?: string;
  estimated_duration?: number;
  actual_start_time?: string;
  actual_end_time?: string;
  estimated_price?: number;
  actual_price?: number;
  address?: string;
  special_instructions?: string;
  access_instructions?: string;
  completion_notes?: string;
  before_photos?: string[];
  after_photos?: string[];
  is_recurring?: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_end_date?: string;
}

// Helper types for UI
export interface JobFilters {
  status?: JobStatus[];
  service_type?: ServiceType[];
  client_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface JobStats {
  total: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total_revenue: number;
  avg_job_value: number;
} 