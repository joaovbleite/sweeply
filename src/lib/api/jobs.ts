import { supabase } from '@/lib/supabase';
import { Job, CreateJobInput, UpdateJobInput, JobFilters, JobStats, JobStatus } from '@/types/job';

export const jobsApi = {
  // Get all jobs for the current user
  async getAll(filters?: JobFilters): Promise<Job[]> {
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
      .order('scheduled_date', { ascending: false });

    // Apply filters
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
      query = query.gte('scheduled_date', filters.date_from);
    }
    
    if (filters?.date_to) {
      query = query.lte('scheduled_date', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      throw new Error('Failed to fetch jobs');
    }

    return data || [];
  },

  // Get a single job by ID
  async getById(id: string): Promise<Job | null> {
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
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      throw new Error('Failed to fetch job');
    }

    return data;
  },

  // Create a new job
  async create(jobData: CreateJobInput): Promise<Job> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          ...jobData,
          user_id: user.id,
        }
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job');
    }

    return data;
  },

  // Update an existing job
  async update(id: string, updates: UpdateJobInput): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating job:', error);
      throw new Error('Failed to update job');
    }

    return data;
  },

  // Delete a job
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job:', error);
      throw new Error('Failed to delete job');
    }
  },

  // Get jobs for today
  async getToday(): Promise<Job[]> {
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
      .eq('scheduled_date', today)
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error fetching today\'s jobs:', error);
      throw new Error('Failed to fetch today\'s jobs');
    }

    return data || [];
  },

  // Get upcoming jobs (next 7 days)
  async getUpcoming(): Promise<Job[]> {
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
      .gte('scheduled_date', today)
      .lte('scheduled_date', nextWeekStr)
      .in('status', ['scheduled', 'in_progress'])
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming jobs:', error);
      throw new Error('Failed to fetch upcoming jobs');
    }

    return data || [];
  },

  // Get job statistics
  async getStats(): Promise<JobStats> {
    const { data, error } = await supabase
      .from('jobs')
      .select('status, actual_price, estimated_price');

    if (error) {
      console.error('Error fetching job stats:', error);
      throw new Error('Failed to fetch job statistics');
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
  },

  // Search jobs
  async search(searchTerm: string): Promise<Job[]> {
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
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,special_instructions.ilike.%${searchTerm}%`)
      .order('scheduled_date', { ascending: false });

    if (error) {
      console.error('Error searching jobs:', error);
      throw new Error('Failed to search jobs');
    }

    return data || [];
  },

  // Update job status
  async updateStatus(id: string, status: JobStatus, additionalData?: Partial<UpdateJobInput>): Promise<Job> {
    const updates: UpdateJobInput = { status, ...additionalData };
    
    // Auto-set timestamps based on status
    if (status === 'in_progress' && !updates.actual_start_time) {
      updates.actual_start_time = new Date().toISOString();
    } else if (status === 'completed' && !updates.actual_end_time) {
      updates.actual_end_time = new Date().toISOString();
    }

    return this.update(id, updates);
  },
}; 
 