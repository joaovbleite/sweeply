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

export type PropertyType = 
  | 'residential' 
  | 'commercial';

export type RecurringFrequency = 
  | 'weekly' 
  | 'biweekly' 
  | 'monthly' 
  | 'quarterly';

export interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Job {
  id: string;
  user_id: string;
  client_id: string;
  
  // Job Details
  title: string;
  description?: string;
  service_type: ServiceType;
  property_type: PropertyType;
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
  
  // Commercial-specific fields
  square_footage?: number;
  number_of_floors?: number;
  building_type?: string; // office, retail, warehouse, etc.
  
  // Residential-specific fields
  number_of_bedrooms?: number;
  number_of_bathrooms?: number;
  house_type?: string; // apartment, house, condo, etc.
  
  // Completion Details
  completion_notes?: string;
  before_photos?: string[];
  after_photos?: string[];
  
  // Recurring Job Info
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_end_date?: string; // ISO date string
  parent_job_id?: string;
  recurring_days_of_week?: number[]; // Array of day numbers (0-6)
  recurring_day_of_month?: number; // Day of month (1-31)
  recurring_occurrences?: number; // Total number of occurrences
  recurring_end_type?: 'never' | 'date' | 'occurrences'; // How recurrence ends
  
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
  
  // Line Items
  line_items?: LineItem[];
}

export interface CreateJobInput {
  client_id: string;
  title: string;
  description?: string;
  service_type: ServiceType;
  property_type: PropertyType;
  scheduled_date: string;
  scheduled_time?: string;
  estimated_duration?: number;
  estimated_price?: number;
  address?: string;
  special_instructions?: string;
  access_instructions?: string;
  
  // Commercial fields
  square_footage?: number;
  number_of_floors?: number;
  building_type?: string;
  
  // Residential fields
  number_of_bedrooms?: number;
  number_of_bathrooms?: number;
  house_type?: string;
  
  is_recurring?: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_end_date?: string;
  
  // Line Items
  line_items?: LineItem[];
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  service_type?: ServiceType;
  property_type?: PropertyType;
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
  
  // Commercial fields
  square_footage?: number;
  number_of_floors?: number;
  building_type?: string;
  
  // Residential fields
  number_of_bedrooms?: number;
  number_of_bathrooms?: number;
  house_type?: string;
  
  completion_notes?: string;
  before_photos?: string[];
  after_photos?: string[];
  is_recurring?: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_end_date?: string;
  
  // Line Items
  line_items?: LineItem[];
}

// Helper types for UI
export interface JobFilters {
  status?: JobStatus[];
  service_type?: ServiceType[];
  property_type?: PropertyType[];
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
 
 
 
 