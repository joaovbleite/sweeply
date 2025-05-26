import { supabase } from '@/lib/supabase';
import { 
  Employee, 
  CreateEmployeeInput, 
  UpdateEmployeeInput, 
  EmployeeFilters, 
  EmployeeStats,
  PayrollPeriod,
  PayrollEntry,
  CreatePayrollEntryInput,
  PerformanceReview,
  CreatePerformanceReviewInput,
  PerformanceMetrics
} from '@/types/employee';

export const employeesApi = {
  // Employee CRUD Operations
  async getAll(filters?: EmployeeFilters): Promise<Employee[]> {
    let query = supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    
    if (filters?.role && filters.role.length > 0) {
      query = query.in('role', filters.role);
    }
    
    if (filters?.department) {
      query = query.eq('department', filters.department);
    }
    
    if (filters?.hire_date_from) {
      query = query.gte('hire_date', filters.hire_date_from);
    }
    
    if (filters?.hire_date_to) {
      query = query.lte('hire_date', filters.hire_date_to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching employees:', error);
      throw new Error('Failed to fetch employees');
    }

    return data || [];
  },

  async getById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching employee:', error);
      throw new Error('Failed to fetch employee');
    }

    return data;
  },

  async create(employeeData: CreateEmployeeInput): Promise<Employee> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate employee ID
    const { data: employeeIdData } = await supabase.rpc('generate_employee_id');
    const employeeId = employeeIdData || `EMP${Date.now()}`;

    const { data, error } = await supabase
      .from('employees')
      .insert([
        {
          ...employeeData,
          user_id: user.id,
          employee_id: employeeId,
          skills: employeeData.skills || [],
          certifications: employeeData.certifications || [],
          languages: employeeData.languages || [],
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      throw new Error('Failed to create employee');
    }

    return data;
  },

  async update(id: string, updates: UpdateEmployeeInput): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee:', error);
      throw new Error('Failed to update employee');
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      throw new Error('Failed to delete employee');
    }
  },

  async search(searchTerm: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching employees:', error);
      throw new Error('Failed to search employees');
    }

    return data || [];
  },

  async getStats(): Promise<EmployeeStats> {
    const { data, error } = await supabase
      .from('employees')
      .select('status, hourly_rate, salary, current_rating, total_hours_worked');

    if (error) {
      console.error('Error fetching employee stats:', error);
      throw new Error('Failed to fetch employee statistics');
    }

    const stats: EmployeeStats = {
      total: data.length,
      active: 0,
      inactive: 0,
      on_leave: 0,
      terminated: 0,
      total_payroll: 0,
      avg_hourly_rate: 0,
      avg_performance_rating: 0,
      total_hours_this_month: 0,
    };

    let totalHourlyRate = 0;
    let totalRating = 0;
    let ratedEmployees = 0;
    let activeEmployees = 0;

    data.forEach(employee => {
      // Count by status
      stats[employee.status]++;

      if (employee.status === 'active') {
        activeEmployees++;
        totalHourlyRate += employee.hourly_rate || 0;
        
        // Calculate monthly payroll (assuming 4 weeks per month)
        const weeklyPay = (employee.hourly_rate || 0) * 40; // 40 hours per week
        stats.total_payroll += weeklyPay * 4;
      }

      // Calculate average rating
      if (employee.current_rating) {
        const ratingValue = this.getRatingValue(employee.current_rating);
        totalRating += ratingValue;
        ratedEmployees++;
      }

      // Add hours worked this month (simplified calculation)
      stats.total_hours_this_month += employee.total_hours_worked || 0;
    });

    // Calculate averages
    if (activeEmployees > 0) {
      stats.avg_hourly_rate = totalHourlyRate / activeEmployees;
    }
    
    if (ratedEmployees > 0) {
      stats.avg_performance_rating = totalRating / ratedEmployees;
    }

    return stats;
  },

  getRatingValue(rating: string): number {
    const ratingMap = {
      'excellent': 5,
      'good': 4,
      'satisfactory': 3,
      'needs_improvement': 2,
      'unsatisfactory': 1
    };
    return ratingMap[rating as keyof typeof ratingMap] || 0;
  },

  // Payroll Management
  async getPayrollPeriods(): Promise<PayrollPeriod[]> {
    const { data, error } = await supabase
      .from('payroll_periods')
      .select('*')
      .order('period_start', { ascending: false });

    if (error) {
      console.error('Error fetching payroll periods:', error);
      throw new Error('Failed to fetch payroll periods');
    }

    return data || [];
  },

  async createPayrollPeriod(periodData: {
    period_start: string;
    period_end: string;
    pay_date: string;
  }): Promise<PayrollPeriod> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('payroll_periods')
      .insert([
        {
          ...periodData,
          user_id: user.id,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating payroll period:', error);
      throw new Error('Failed to create payroll period');
    }

    return data;
  },

  async getPayrollEntries(periodId: string): Promise<PayrollEntry[]> {
    const { data, error } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        employee:employees(
          id,
          first_name,
          last_name,
          employee_id,
          role,
          hourly_rate
        )
      `)
      .eq('payroll_period_id', periodId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payroll entries:', error);
      throw new Error('Failed to fetch payroll entries');
    }

    return data || [];
  },

  async createPayrollEntry(entryData: CreatePayrollEntryInput): Promise<PayrollEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get employee hourly rate
    const { data: employee } = await supabase
      .from('employees')
      .select('hourly_rate')
      .eq('id', entryData.employee_id)
      .single();

    if (!employee) {
      throw new Error('Employee not found');
    }

    const regularRate = employee.hourly_rate;
    const overtimeRate = regularRate * 1.5; // 1.5x for overtime
    const holidayRate = regularRate * 2; // 2x for holidays

    const { data, error } = await supabase
      .from('payroll_entries')
      .insert([
        {
          ...entryData,
          user_id: user.id,
          regular_rate: regularRate,
          overtime_rate: overtimeRate,
          holiday_rate: holidayRate,
          overtime_hours: entryData.overtime_hours || 0,
          holiday_hours: entryData.holiday_hours || 0,
          sick_hours: entryData.sick_hours || 0,
          vacation_hours: entryData.vacation_hours || 0,
          bonus: entryData.bonus || 0,
          adjustments: entryData.adjustments || 0,
          jobs_completed: entryData.jobs_completed || 0,
          performance_bonus: entryData.performance_bonus || 0,
          tax_deductions: entryData.tax_deductions || 0,
          insurance_deductions: entryData.insurance_deductions || 0,
          other_deductions: entryData.other_deductions || 0,
        }
      ])
      .select(`
        *,
        employee:employees(
          id,
          first_name,
          last_name,
          employee_id,
          role,
          hourly_rate
        )
      `)
      .single();

    if (error) {
      console.error('Error creating payroll entry:', error);
      throw new Error('Failed to create payroll entry');
    }

    return data;
  },

  async updatePayrollPeriodStatus(periodId: string, status: 'draft' | 'processed' | 'paid'): Promise<PayrollPeriod> {
    const { data, error } = await supabase
      .from('payroll_periods')
      .update({ status })
      .eq('id', periodId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payroll period status:', error);
      throw new Error('Failed to update payroll period status');
    }

    return data;
  },

  // Performance Management
  async getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> {
    let query = supabase
      .from('performance_reviews')
      .select(`
        *,
        employee:employees(
          id,
          first_name,
          last_name,
          employee_id,
          role
        )
      `)
      .order('review_date', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching performance reviews:', error);
      throw new Error('Failed to fetch performance reviews');
    }

    return data || [];
  },

  async createPerformanceReview(reviewData: CreatePerformanceReviewInput): Promise<PerformanceReview> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('performance_reviews')
      .insert([
        {
          ...reviewData,
          user_id: user.id,
        }
      ])
      .select(`
        *,
        employee:employees(
          id,
          first_name,
          last_name,
          employee_id,
          role
        )
      `)
      .single();

    if (error) {
      console.error('Error creating performance review:', error);
      throw new Error('Failed to create performance review');
    }

    // Update employee's current rating
    await this.update(reviewData.employee_id, {
      current_rating: reviewData.overall_rating
    });

    return data;
  },

  async getPerformanceMetrics(employeeId: string, periodStart: string, periodEnd: string): Promise<PerformanceMetrics> {
    // This would typically aggregate data from jobs, client feedback, etc.
    // For now, we'll return a basic structure
    const metrics: PerformanceMetrics = {
      employee_id: employeeId,
      period_start: periodStart,
      period_end: periodEnd,
      jobs_completed: 0,
      total_hours: 0,
      average_job_rating: 0,
      client_complaints: 0,
      client_compliments: 0,
      attendance_rate: 0,
      punctuality_rate: 0,
      revenue_generated: 0,
    };

    // TODO: Implement actual metrics calculation from jobs and other data
    
    return metrics;
  },

  // Utility functions
  async getActiveEmployees(): Promise<Employee[]> {
    return this.getAll({ status: ['active'] });
  },

  async getEmployeesByRole(role: string): Promise<Employee[]> {
    return this.getAll({ role: [role as any] });
  },

  async updateEmployeePerformance(employeeId: string, jobsCompleted: number, hoursWorked: number, rating: number): Promise<void> {
    const employee = await this.getById(employeeId);
    if (!employee) return;

    const newTotalJobs = employee.total_jobs_completed + jobsCompleted;
    const newTotalHours = employee.total_hours_worked + hoursWorked;
    const newAverageRating = ((employee.average_rating * employee.total_jobs_completed) + rating) / newTotalJobs;

    await this.update(employeeId, {
      total_jobs_completed: newTotalJobs,
      total_hours_worked: newTotalHours,
      average_rating: newAverageRating,
    });
  }
}; 
 
 
 
 