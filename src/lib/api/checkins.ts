import { supabase } from '@/lib/supabase';
import { CheckInData, CheckOutData, LocationCoordinates } from '@/lib/gps-service';

export interface CheckIn {
  id: string;
  job_id: string;
  employee_id: string;
  check_in_time: string;
  check_in_location: LocationCoordinates;
  check_in_address: string;
  check_in_notes?: string;
  check_out_time?: string;
  check_out_location?: LocationCoordinates;
  check_out_notes?: string;
  duration_minutes?: number;
  completion_status?: 'completed' | 'partial' | 'cancelled';
  created_at: string;
  updated_at: string;
}

class CheckInsApi {
  /**
   * Create a new check-in record
   */
  async checkIn(data: CheckInData): Promise<CheckIn> {
    const checkInRecord = {
      job_id: data.jobId,
      employee_id: data.employeeId,
      check_in_time: new Date(data.timestamp).toISOString(),
      check_in_location: data.location,
      check_in_address: data.address,
      check_in_notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: checkIn, error } = await supabase
      .from('job_checkins')
      .insert(checkInRecord)
      .select()
      .single();

    if (error) {
      console.error('Check-in error:', error);
      throw new Error(`Failed to check in: ${error.message}`);
    }

    return checkIn;
  }

  /**
   * Update check-in with check-out data
   */
  async checkOut(data: CheckOutData): Promise<CheckIn> {
    const checkOutData = {
      check_out_time: new Date(data.timestamp).toISOString(),
      check_out_location: data.location,
      check_out_notes: data.notes || null,
      duration_minutes: data.duration,
      completion_status: data.completionStatus,
      updated_at: new Date().toISOString()
    };

    const { data: checkIn, error } = await supabase
      .from('job_checkins')
      .update(checkOutData)
      .eq('id', data.checkInId)
      .select()
      .single();

    if (error) {
      console.error('Check-out error:', error);
      throw new Error(`Failed to check out: ${error.message}`);
    }

    return checkIn;
  }

  /**
   * Get all check-ins for a job
   */
  async getJobCheckIns(jobId: string): Promise<CheckIn[]> {
    const { data, error } = await supabase
      .from('job_checkins')
      .select('*')
      .eq('job_id', jobId)
      .order('check_in_time', { ascending: false });

    if (error) {
      console.error('Error fetching job check-ins:', error);
      throw new Error(`Failed to fetch check-ins: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get active check-in for a job (not checked out yet)
   */
  async getActiveCheckIn(jobId: string, employeeId: string): Promise<CheckIn | null> {
    const { data, error } = await supabase
      .from('job_checkins')
      .select('*')
      .eq('job_id', jobId)
      .eq('employee_id', employeeId)
      .is('check_out_time', null)
      .order('check_in_time', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching active check-in:', error);
      throw new Error(`Failed to fetch active check-in: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Get all check-ins for an employee
   */
  async getEmployeeCheckIns(employeeId: string, limit?: number): Promise<CheckIn[]> {
    let query = supabase
      .from('job_checkins')
      .select(`
        *,
        jobs:job_id (
          title,
          client:client_id (name),
          address
        )
      `)
      .eq('employee_id', employeeId)
      .order('check_in_time', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching employee check-ins:', error);
      throw new Error(`Failed to fetch employee check-ins: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get today's check-ins for an employee
   */
  async getTodayCheckIns(employeeId: string): Promise<CheckIn[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('job_checkins')
      .select(`
        *,
        jobs:job_id (
          title,
          client:client_id (name),
          address
        )
      `)
      .eq('employee_id', employeeId)
      .gte('check_in_time', `${today}T00:00:00.000Z`)
      .lt('check_in_time', `${today}T23:59:59.999Z`)
      .order('check_in_time', { ascending: false });

    if (error) {
      console.error('Error fetching today\'s check-ins:', error);
      throw new Error(`Failed to fetch today's check-ins: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Calculate total hours worked today
   */
  async getTodayHours(employeeId: string): Promise<number> {
    const checkIns = await this.getTodayCheckIns(employeeId);
    
    let totalMinutes = 0;
    
    for (const checkIn of checkIns) {
      if (checkIn.duration_minutes) {
        totalMinutes += checkIn.duration_minutes;
      } else if (checkIn.check_in_time && !checkIn.check_out_time) {
        // Still checked in, calculate current duration
        const checkInTime = new Date(checkIn.check_in_time);
        const now = new Date();
        const currentMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / (1000 * 60));
        totalMinutes += currentMinutes;
      }
    }
    
    return Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Delete a check-in record
   */
  async deleteCheckIn(checkInId: string): Promise<void> {
    const { error } = await supabase
      .from('job_checkins')
      .delete()
      .eq('id', checkInId);

    if (error) {
      console.error('Error deleting check-in:', error);
      throw new Error(`Failed to delete check-in: ${error.message}`);
    }
  }

  /**
   * Update check-in notes
   */
  async updateCheckInNotes(checkInId: string, checkInNotes?: string, checkOutNotes?: string): Promise<CheckIn> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (checkInNotes !== undefined) {
      updateData.check_in_notes = checkInNotes;
    }

    if (checkOutNotes !== undefined) {
      updateData.check_out_notes = checkOutNotes;
    }

    const { data, error } = await supabase
      .from('job_checkins')
      .update(updateData)
      .eq('id', checkInId)
      .select()
      .single();

    if (error) {
      console.error('Error updating check-in notes:', error);
      throw new Error(`Failed to update notes: ${error.message}`);
    }

    return data;
  }

  /**
   * Get check-in statistics for a date range
   */
  async getCheckInStats(employeeId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('job_checkins')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('check_in_time', startDate)
      .lte('check_in_time', endDate);

    if (error) {
      console.error('Error fetching check-in stats:', error);
      throw new Error(`Failed to fetch check-in stats: ${error.message}`);
    }

    const checkIns = data || [];
    
    const totalJobs = checkIns.length;
    const completedJobs = checkIns.filter(c => c.completion_status === 'completed').length;
    const totalHours = checkIns.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) / 60;
    const averageJobTime = totalJobs > 0 ? totalHours / totalJobs : 0;

    return {
      totalJobs,
      completedJobs,
      totalHours: Math.round(totalHours * 100) / 100,
      averageJobTime: Math.round(averageJobTime * 100) / 100,
      completionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0
    };
  }
}

export const checkInsApi = new CheckInsApi(); 