import { supabase } from '@/lib/supabase';
import { Job, CreateJobInput, UpdateJobInput, JobFilters, JobStats, JobStatus } from '@/types/job';
import { 
  withRetry, 
  ensureAuthenticated, 
  validateRequired, 
  validateDate,
  PerformanceMonitor,
  ApiError,
  ValidationError
} from './base';

// Enhanced validation for job data
const validateJobInput = (jobData: CreateJobInput): void => {
  validateRequired(jobData.client_id, 'client_id');
  validateRequired(jobData.title, 'title');
  validateRequired(jobData.service_type, 'service_type');
  validateRequired(jobData.scheduled_date, 'scheduled_date');
  
  validateDate(jobData.scheduled_date, 'scheduled_date');
  
  if (jobData.scheduled_time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(jobData.scheduled_time)) {
      throw new ValidationError('Invalid time format. Use HH:MM format', 'scheduled_time');
    }
  }
  
  if (jobData.estimated_duration && jobData.estimated_duration <= 0) {
    throw new ValidationError('Estimated duration must be greater than 0', 'estimated_duration');
  }
  
  if (jobData.estimated_price && jobData.estimated_price < 0) {
    throw new ValidationError('Estimated price cannot be negative', 'estimated_price');
  }
  
  if (jobData.recurring_end_date) {
    validateDate(jobData.recurring_end_date, 'recurring_end_date');
    
    // Ensure end date is after start date
    const startDate = new Date(jobData.scheduled_date);
    const endDate = new Date(jobData.recurring_end_date);
    if (endDate <= startDate) {
      throw new ValidationError('Recurring end date must be after scheduled date', 'recurring_end_date');
    }
  }
};

export const jobsApi = {
  // Get all jobs for the current user
  async getAll(filters?: JobFilters): Promise<Job[]> {
    const endTimer = PerformanceMonitor.startTimer('jobs.getAll');
    
    try {
      return await withRetry(async () => {
        const userId = await ensureAuthenticated();
        
        let query = supabase
          .from('jobs')
          .select(`
            *,
            client:clients(
              id,
              name,
              email,
              phone,
              address,
              city,
              state,
              zip
            )
          `)
          .eq('user_id', userId)
          .order('scheduled_date', { ascending: false });

        // Apply filters with validation
        if (filters?.status && filters.status.length > 0) {
          query = query.in('status', filters.status);
        }
        
        if (filters?.service_type && filters.service_type.length > 0) {
          query = query.in('service_type', filters.service_type);
        }
        
        if (filters?.client_id) {
          query = query.eq('client_id', filters.client_id);
        }
        
        if (filters?.date_from) {
          validateDate(filters.date_from, 'date_from');
          query = query.gte('scheduled_date', filters.date_from);
        }
        
        if (filters?.date_to) {
          validateDate(filters.date_to, 'date_to');
          query = query.lte('scheduled_date', filters.date_to);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return data || [];
      });
    } finally {
      endTimer();
    }
  },

  // Get a single job by ID
  async getById(id: string): Promise<Job | null> {
    const endTimer = PerformanceMonitor.startTimer('jobs.getById');
    
    try {
      validateRequired(id, 'id');
      
      return await withRetry(async () => {
        const userId = await ensureAuthenticated();
        
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            client:clients(
              id,
              name,
              email,
              phone,
              address,
              city,
              state,
              zip
            )
          `)
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Job not found
          }
          throw error;
        }

        return data;
      });
    } finally {
      endTimer();
    }
  },

  // Create a new job
  async create(jobData: CreateJobInput): Promise<Job> {
    const endTimer = PerformanceMonitor.startTimer('jobs.create');
    
    try {
      validateJobInput(jobData);
      
      return await withRetry(async () => {
        const userId = await ensureAuthenticated();
        
        const { data, error } = await supabase
          .from('jobs')
          .insert([
            {
              ...jobData,
              user_id: userId,
            }
          ])
          .select(`
            *,
            client:clients(
              id,
              name,
              email,
              phone,
              address,
              city,
              state,
              zip
            )
          `)
          .single();

        if (error) {
          throw error;
        }

        return data;
      });
    } finally {
      endTimer();
    }
  },

  // Update an existing job
  async update(id: string, updates: UpdateJobInput): Promise<Job> {
    const endTimer = PerformanceMonitor.startTimer('jobs.update');
    
    try {
      validateRequired(id, 'id');
      
      // Validate update data
      if (updates.scheduled_date) {
        validateDate(updates.scheduled_date, 'scheduled_date');
      }
      
      if (updates.scheduled_time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(updates.scheduled_time)) {
          throw new ValidationError('Invalid time format. Use HH:MM format', 'scheduled_time');
        }
      }
      
      if (updates.estimated_duration && updates.estimated_duration <= 0) {
        throw new ValidationError('Estimated duration must be greater than 0', 'estimated_duration');
      }
      
      if (updates.estimated_price && updates.estimated_price < 0) {
        throw new ValidationError('Estimated price cannot be negative', 'estimated_price');
      }
      
      return await withRetry(async () => {
        const userId = await ensureAuthenticated();
        
        const { data, error } = await supabase
          .from('jobs')
          .update(updates)
          .eq('id', id)
          .eq('user_id', userId)
          .select(`
            *,
            client:clients(
              id,
              name,
              email,
              phone,
              address,
              city,
              state,
              zip
            )
          `)
          .single();

        if (error) {
          throw error;
        }

        return data;
      });
    } finally {
      endTimer();
    }
  },

  // Delete a job
  async delete(id: string): Promise<void> {
    const endTimer = PerformanceMonitor.startTimer('jobs.delete');
    
    try {
      validateRequired(id, 'id');
      
      await withRetry(async () => {
        const userId = await ensureAuthenticated();
        
        const { error } = await supabase
          .from('jobs')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          throw error;
        }
      });
    } finally {
      endTimer();
    }
  },

  // Get jobs for today
  async getToday(): Promise<Job[]> {
    const endTimer = PerformanceMonitor.startTimer('jobs.getToday');
    
    try {
      return await withRetry(async () => {
        const userId = await ensureAuthenticated();
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            client:clients(
              id,
              name,
              email,
              phone,
              address,
              city,
              state,
              zip
            )
          `)
          .eq('user_id', userId)
          .eq('scheduled_date', today)
          .order('scheduled_time', { ascending: true });

        if (error) {
          throw error;
        }

        return data || [];
      });
    } finally {
      endTimer();
    }
  },

  // Get upcoming jobs (next 7 days)
  async getUpcoming(): Promise<Job[]> {
    const endTimer = PerformanceMonitor.startTimer('jobs.getUpcoming');
    
    try {
      return await withRetry(async () => {
        const userId = await ensureAuthenticated();
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            client:clients(
              id,
              name,
              email,
              phone,
              address,
              city,
              state,
              zip
            )
          `)
          .eq('user_id', userId)
          .gte('scheduled_date', today)
          .lte('scheduled_date', nextWeekStr)
          .in('status', ['scheduled', 'in_progress'])
          .order('scheduled_date', { ascending: true })
          .order('scheduled_time', { ascending: true });

        if (error) {
          throw error;
        }

        return data || [];
      });
    } finally {
      endTimer();
    }
  },

  // Get job statistics
  async getStats(): Promise<JobStats> {
    const endTimer = PerformanceMonitor.startTimer('jobs.getStats');
    
    try {
      return await withRetry(async () => {
        const userId = await ensureAuthenticated();
        
        const { data, error } = await supabase
          .from('jobs')
          .select('status, actual_price, estimated_price')
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        const stats: JobStats = {
          total: data.length,
          scheduled: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0,
          total_revenue: 0,
          avg_job_value: 0,
        };

        data.forEach(job => {
          // Count by status
          switch (job.status) {
            case 'scheduled':
              stats.scheduled++;
              break;
            case 'in_progress':
              stats.in_progress++;
              break;
            case 'completed':
              stats.completed++;
              break;
            case 'cancelled':
              stats.cancelled++;
              break;
          }

          // Calculate revenue (use actual_price if available, otherwise estimated_price)
          const jobValue = job.actual_price || job.estimated_price || 0;
          if (job.status === 'completed' && jobValue > 0) {
            stats.total_revenue += jobValue;
          }
        });

        // Calculate average job value
        const completedJobs = data.filter(job => job.status === 'completed' && (job.actual_price || job.estimated_price));
        if (completedJobs.length > 0) {
          const totalValue = completedJobs.reduce((sum, job) => sum + (job.actual_price || job.estimated_price || 0), 0);
          stats.avg_job_value = totalValue / completedJobs.length;
        }

        return stats;
      });
    } finally {
      endTimer();
    }
  },

  // Search jobs
  async search(searchTerm: string): Promise<Job[]> {
    const endTimer = PerformanceMonitor.startTimer('jobs.search');
    
    try {
      validateRequired(searchTerm, 'searchTerm');
      
      if (searchTerm.length < 2) {
        throw new ValidationError('Search term must be at least 2 characters long', 'searchTerm');
      }
      
      return await withRetry(async () => {
        const userId = await ensureAuthenticated();
        
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            client:clients(
              id,
              name,
              email,
              phone,
              address,
              city,
              state,
              zip
            )
          `)
          .eq('user_id', userId)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,special_instructions.ilike.%${searchTerm}%`)
          .order('scheduled_date', { ascending: false });

        if (error) {
          throw error;
        }

        return data || [];
      });
    } finally {
      endTimer();
    }
  },

  // Update job status
  async updateStatus(id: string, status: JobStatus, additionalData?: Partial<UpdateJobInput>): Promise<Job> {
    const endTimer = PerformanceMonitor.startTimer('jobs.updateStatus');
    
    try {
      validateRequired(id, 'id');
      validateRequired(status, 'status');
      
      const updates: UpdateJobInput = { status, ...additionalData };
      
      // Auto-set timestamps based on status
      if (status === 'in_progress' && !updates.actual_start_time) {
        updates.actual_start_time = new Date().toISOString();
      } else if (status === 'completed' && !updates.actual_end_time) {
        updates.actual_end_time = new Date().toISOString();
      }

      return await this.update(id, updates);
    } finally {
      endTimer();
    }
  },

  // Bulk operations
  async bulkUpdateStatus(ids: string[], status: JobStatus): Promise<Job[]> {
    const endTimer = PerformanceMonitor.startTimer('jobs.bulkUpdateStatus');
    
    try {
      validateRequired(ids, 'ids');
      validateRequired(status, 'status');
      
      if (ids.length === 0) {
        throw new ValidationError('At least one job ID is required', 'ids');
      }
      
      if (ids.length > 50) {
        throw new ValidationError('Cannot update more than 50 jobs at once', 'ids');
      }
      
      return await withRetry(async () => {
        const userId = await ensureAuthenticated();
        
        const updates: any = { status };
        
        // Auto-set timestamps based on status
        if (status === 'in_progress') {
          updates.actual_start_time = new Date().toISOString();
        } else if (status === 'completed') {
          updates.actual_end_time = new Date().toISOString();
        }
        
        const { data, error } = await supabase
          .from('jobs')
          .update(updates)
          .in('id', ids)
          .eq('user_id', userId)
          .select(`
            *,
            client:clients(
              id,
              name,
              email,
              phone,
              address,
              city,
              state,
              zip
            )
          `);

        if (error) {
          throw error;
        }

        return data || [];
      });
    } finally {
      endTimer();
    }
  },

  // Get performance metrics
  getPerformanceMetrics() {
    return PerformanceMonitor.getMetrics();
  },

  // Reset performance metrics
  resetPerformanceMetrics() {
    PerformanceMonitor.reset();
  }
}; 