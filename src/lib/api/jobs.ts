import { supabase } from '@/lib/supabase';
import { Job, CreateJobInput, UpdateJobInput, JobFilters, JobStats, JobStatus } from '@/types/job';
import { RecurringPattern } from '@/components/RecurringJobPattern';

export const jobsApi = {
  // Get all jobs for the current user
  async getAll(filters?: JobFilters & { is_recurring?: boolean, show_instances?: boolean }): Promise<Job[]> {
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
    
    if (filters?.property_type && filters.property_type.length > 0) {
      query = query.in('property_type', filters.property_type);
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

    // Apply recurring filter
    if (filters?.is_recurring !== undefined) {
      query = query.eq('is_recurring', filters.is_recurring);
    }

    // By default, hide recurring instances unless specifically requested
    // This prevents showing all 43 instances of a recurring job
    if (!filters?.show_instances) {
      query = query.is('parent_job_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      throw new Error('Failed to fetch jobs');
    }

    return data || [];
  },

  // Get all jobs including recurring instances (for calendar view)
  async getAllWithInstances(filters?: JobFilters): Promise<Job[]> {
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
    
    if (filters?.property_type && filters.property_type.length > 0) {
      query = query.in('property_type', filters.property_type);
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

    // This method intentionally includes ALL jobs (parents and instances)

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs with instances:', error);
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

    // Build the insert data object more explicitly
    const insertData: any = {
      client_id: jobData.client_id,
      title: jobData.title,
      service_type: jobData.service_type,
      property_type: jobData.property_type || 'residential', // Default value
      scheduled_date: jobData.scheduled_date,
      status: 'scheduled',
      user_id: user.id,
      is_recurring: jobData.is_recurring || false,
    };

    // Add optional fields only if they have values
    if (jobData.description) insertData.description = jobData.description;
    if (jobData.scheduled_time) insertData.scheduled_time = jobData.scheduled_time;
    if (jobData.estimated_duration) insertData.estimated_duration = jobData.estimated_duration;
    if (jobData.estimated_price) insertData.estimated_price = jobData.estimated_price;
    if (jobData.address) insertData.address = jobData.address;
    if (jobData.special_instructions) insertData.special_instructions = jobData.special_instructions;
    if (jobData.access_instructions) insertData.access_instructions = jobData.access_instructions;
    if (jobData.square_footage) insertData.square_footage = jobData.square_footage;
    if (jobData.number_of_floors) insertData.number_of_floors = jobData.number_of_floors;
    if (jobData.building_type) insertData.building_type = jobData.building_type;
    if (jobData.number_of_bedrooms) insertData.number_of_bedrooms = jobData.number_of_bedrooms;
    if (jobData.number_of_bathrooms) insertData.number_of_bathrooms = jobData.number_of_bathrooms;
    if (jobData.house_type) insertData.house_type = jobData.house_type;
    if (jobData.recurring_frequency) insertData.recurring_frequency = jobData.recurring_frequency;
    if (jobData.recurring_end_date) insertData.recurring_end_date = jobData.recurring_end_date;
    
    // Add arrival window information
    if (jobData.arrival_window_start) insertData.arrival_window_start = jobData.arrival_window_start;
    if (jobData.arrival_window_end) insertData.arrival_window_end = jobData.arrival_window_end;
    
    // Add line items if provided
    if (jobData.line_items && jobData.line_items.length > 0) {
      insertData.line_items = jobData.line_items;
      
      // Calculate total estimated price from line items if not already set
      if (!jobData.estimated_price) {
        insertData.estimated_price = jobData.line_items.reduce(
          (sum, item) => sum + (item.price * (item.quantity || 1)), 
          0
        );
      }
    }

    console.log('Creating job with cleaned data:', insertData);

    const { data, error } = await supabase
      .from('jobs')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error creating job:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error message:', error.message);
      console.error('Error hint:', error.hint);
      throw new Error(error.message || 'Failed to create job');
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
      .is('parent_job_id', null) // Only get parent jobs, not instances
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
      .is('parent_job_id', null) // Only get parent jobs, not instances
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
      .select('status, actual_price, estimated_price')
      .is('parent_job_id', null); // Only count parent jobs, not recurring instances

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
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,special_instructions.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
      .is('parent_job_id', null) // Only search parent jobs, not instances
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

    const updatedJob = await this.update(id, updates);

    // TODO: Re-enable email notifications after SendGrid setup is complete
    // Send email notification for status changes
    /*
    if (status === 'in_progress' || status === 'completed') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Call the edge function to send email
          const { error } = await supabase.functions.invoke('send-job-status-email', {
            body: {
              jobId: id,
              status: status,
              userId: user.id
            }
          });

          if (error) {
            console.error('Failed to send status email:', error);
            // Don't throw - email failure shouldn't block status update
          }
        }
      } catch (error) {
        console.error('Error sending status email:', error);
        // Don't throw - email failure shouldn't block status update
      }
    }
    */

    return updatedJob;
  },

  // Create a recurring job with multiple instances
  async createRecurring(jobData: CreateJobInput & RecurringPattern): Promise<Job> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First, create the parent recurring job
    const parentJobData = {
      ...jobData,
      user_id: user.id,
      is_recurring: true,
      recurring_frequency: jobData.recurring_frequency,
      recurring_end_date: jobData.recurring_end_date,
      recurring_days_of_week: jobData.recurring_days_of_week,
      recurring_day_of_month: jobData.recurring_day_of_month,
      recurring_occurrences: jobData.recurring_occurrences,
      recurring_end_type: jobData.recurring_end_type
    };

    const { data: parentJob, error: parentError } = await supabase
      .from('jobs')
      .insert([parentJobData])
      .select('*')
      .single();

    if (parentError) {
      console.error('Error creating parent job:', parentError);
      throw new Error('Failed to create recurring job');
    }

    // Generate instances for the next 3 months
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    try {
      await this.generateRecurringInstances(parentJob.id, parentJob.scheduled_date, endDate.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error generating recurring instances:', error);
      // Don't throw here - the parent job was created successfully
    }

    return parentJob;
  },

  // Generate recurring job instances
  async generateRecurringInstances(parentJobId: string, startDate: string, endDate: string): Promise<Job[]> {
    const { data, error } = await supabase.rpc('generate_recurring_job_instances', {
      p_parent_job_id: parentJobId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) {
      console.error('Error generating recurring instances:', error);
      throw new Error('Failed to generate recurring instances');
    }

    // Now insert the generated instances
    if (data && data.length > 0) {
      const { data: insertedJobs, error: insertError } = await supabase
        .from('jobs')
        .insert(data)
        .select('*');

      if (insertError) {
        console.error('Error inserting recurring instances:', insertError);
        throw new Error('Failed to insert recurring instances');
      }

      return insertedJobs || [];
    }

    return [];
  },

  // Get all instances of a recurring job
  async getRecurringInstances(parentJobId: string): Promise<Job[]> {
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
      .or(`id.eq.${parentJobId},parent_job_id.eq.${parentJobId}`)
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Error fetching recurring instances:', error);
      throw new Error('Failed to fetch recurring instances');
    }

    return data || [];
  },

  // Cancel all future instances of a recurring job
  async cancelRecurringSeries(parentJobId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Cancel all future instances
    const { error: cancelError } = await supabase
      .from('jobs')
      .update({ status: 'cancelled' })
      .eq('parent_job_id', parentJobId)
      .gte('scheduled_date', today)
      .in('status', ['scheduled']);

    if (cancelError) {
      console.error('Error cancelling recurring instances:', cancelError);
      throw new Error('Failed to cancel recurring instances');
    }

    // Update the parent job to stop recurrence
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ 
        is_recurring: false,
        recurring_end_date: today
      })
      .eq('id', parentJobId);

    if (updateError) {
      console.error('Error updating parent job:', updateError);
      throw new Error('Failed to update parent job');
    }
  },

  // Update a single instance or entire series
  async updateRecurring(id: string, updates: UpdateJobInput, updateSeries: boolean = false): Promise<Job | Job[]> {
    if (!updateSeries) {
      // Update only this instance
      return this.update(id, updates);
    }

    // Get the parent job ID
    const job = await this.getById(id);
    if (!job) {
      throw new Error('Job not found');
    }

    const parentJobId = job.parent_job_id || job.id;

    // Update all future instances
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .or(`id.eq.${parentJobId},parent_job_id.eq.${parentJobId}`)
      .gte('scheduled_date', today)
      .in('status', ['scheduled'])
      .select('*');

    if (error) {
      console.error('Error updating recurring series:', error);
      throw new Error('Failed to update recurring series');
    }

    return data || [];
  },

  // Check for scheduling conflicts
  async checkSchedulingConflicts(scheduledDate: string, scheduledTime?: string, excludeJobId?: string): Promise<Job[]> {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        client:clients(name)
      `)
      .eq('scheduled_date', scheduledDate)
      .in('status', ['scheduled', 'in_progress']);

    if (excludeJobId) {
      query = query.neq('id', excludeJobId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking conflicts:', error);
      throw new Error('Failed to check scheduling conflicts');
    }

    // If no specific time provided, return all jobs on that date
    if (!scheduledTime) {
      return data || [];
    }

    // Filter jobs that might conflict based on time and duration
    const conflicts = (data || []).filter(job => {
      if (!job.scheduled_time) return false;
      
      const jobStart = new Date(`2000-01-01T${job.scheduled_time}`);
      const jobEnd = new Date(jobStart.getTime() + (job.estimated_duration || 120) * 60000);
      
      const checkStart = new Date(`2000-01-01T${scheduledTime}`);
      
      // Check if the times overlap
      return checkStart >= jobStart && checkStart < jobEnd;
    });

    return conflicts;
  },
};