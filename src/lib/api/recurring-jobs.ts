import { supabase } from '@/lib/supabase';
import { jobsApi } from './jobs';

export const recurringJobsApi = {
  // Generate instances for all active recurring jobs
  async generateAllRecurringInstances(): Promise<void> {
    try {
      // Get all active recurring jobs
      const { data: recurringJobs, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_recurring', true)
        .is('parent_job_id', null) // Only parent jobs
        .or('recurring_end_type.eq.never,recurring_end_date.gte.' + new Date().toISOString().split('T')[0]);

      if (fetchError) {
        console.error('Error fetching recurring jobs:', fetchError);
        throw new Error('Failed to fetch recurring jobs');
      }

      if (!recurringJobs || recurringJobs.length === 0) {
        console.log('No active recurring jobs found');
        return;
      }

      // Generate instances for each recurring job
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // Generate 3 months ahead

      for (const job of recurringJobs) {
        try {
          // Check if we need to generate more instances
          const { data: existingInstances } = await supabase
            .from('jobs')
            .select('scheduled_date')
            .eq('parent_job_id', job.id)
            .gte('scheduled_date', startDate.toISOString().split('T')[0])
            .order('scheduled_date', { ascending: false })
            .limit(1);

          // If we already have instances for the next 3 months, skip
          if (existingInstances && existingInstances.length > 0) {
            const lastInstanceDate = new Date(existingInstances[0].scheduled_date);
            if (lastInstanceDate >= endDate) {
              continue;
            }
          }

          // Generate new instances
          await jobsApi.generateRecurringInstances(
            job.id,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          );

          console.log(`Generated instances for recurring job ${job.id}`);
        } catch (error) {
          console.error(`Error generating instances for job ${job.id}:`, error);
          // Continue with other jobs even if one fails
        }
      }
    } catch (error) {
      console.error('Error in generateAllRecurringInstances:', error);
      throw error;
    }
  },

  // Check and update recurring job statuses
  async updateRecurringJobStatuses(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // End recurring jobs that have reached their end date
      const { error: endError } = await supabase
        .from('jobs')
        .update({ is_recurring: false })
        .eq('is_recurring', true)
        .eq('recurring_end_type', 'date')
        .lte('recurring_end_date', today);

      if (endError) {
        console.error('Error ending expired recurring jobs:', endError);
      }

      // Check for jobs with occurrence limits
      const { data: occurrenceJobs, error: occError } = await supabase
        .from('jobs')
        .select('id, recurring_occurrences')
        .eq('is_recurring', true)
        .eq('recurring_end_type', 'occurrences')
        .not('recurring_occurrences', 'is', null);

      if (occError) {
        console.error('Error fetching occurrence-limited jobs:', occError);
        return;
      }

      // Check each job to see if it has reached its occurrence limit
      for (const job of occurrenceJobs || []) {
        const { count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('parent_job_id', job.id);

        if (count && count >= job.recurring_occurrences) {
          // End this recurring job
          await supabase
            .from('jobs')
            .update({ is_recurring: false })
            .eq('id', job.id);

          console.log(`Ended recurring job ${job.id} after ${count} occurrences`);
        }
      }
    } catch (error) {
      console.error('Error updating recurring job statuses:', error);
      throw error;
    }
  }
}; 