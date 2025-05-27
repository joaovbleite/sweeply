import { Job } from '@/types/job';
import { Client } from '@/types/client';
import { format, isSameDay, parseISO } from 'date-fns';

interface CalendarConflict {
  jobId: string;
  conflictingJobIds: string[];
  type: 'time' | 'location' | 'employee';
  description: string;
}

export const calendarUtils = {
  // Check for scheduling conflicts
  detectConflicts(jobs: Job[]): CalendarConflict[] {
    const conflicts: CalendarConflict[] = [];
    
    // Group jobs by date
    const jobsByDate = jobs.reduce((acc, job) => {
      const date = job.scheduled_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(job);
      return acc;
    }, {} as Record<string, Job[]>);

    // Check for time conflicts within each day
    Object.values(jobsByDate).forEach(dayJobs => {
      for (let i = 0; i < dayJobs.length; i++) {
        for (let j = i + 1; j < dayJobs.length; j++) {
          const job1 = dayJobs[i];
          const job2 = dayJobs[j];
          
          if (job1.scheduled_time && job2.scheduled_time) {
            const start1 = parseTime(job1.scheduled_time);
            const end1 = addMinutes(start1, job1.estimated_duration || 60);
            const start2 = parseTime(job2.scheduled_time);
            const end2 = addMinutes(start2, job2.estimated_duration || 60);
            
            // Check if times overlap
            if (start1 < end2 && start2 < end1) {
              conflicts.push({
                jobId: job1.id,
                conflictingJobIds: [job2.id],
                type: 'time',
                description: `Time conflict with job at ${job2.scheduled_time}`
              });
            }
          }
        }
      }
    });
    
    return conflicts;
  },

  // Validate job data integrity
  validateJobData(job: Job): string[] {
    const errors: string[] = [];
    
    if (!job.client_id) {
      errors.push('Job is missing client assignment');
    }
    
    if (!job.scheduled_date) {
      errors.push('Job is missing scheduled date');
    }
    
    if (!job.service_type) {
      errors.push('Job is missing service type');
    }
    
    if (job.scheduled_time && !isValidTimeFormat(job.scheduled_time)) {
      errors.push('Invalid time format (should be HH:MM)');
    }
    
    if (job.estimated_duration && job.estimated_duration < 0) {
      errors.push('Invalid duration (must be positive)');
    }
    
    if (job.estimated_price && job.estimated_price < 0) {
      errors.push('Invalid price (must be positive)');
    }
    
    return errors;
  },

  // Calculate optimal route for a day's jobs
  calculateOptimalRoute(jobs: Job[]): Job[] {
    // Simple implementation - sort by time for now
    // In a real app, this would use geolocation and route optimization
    return [...jobs].sort((a, b) => {
      if (!a.scheduled_time || !b.scheduled_time) return 0;
      return a.scheduled_time.localeCompare(b.scheduled_time);
    });
  },

  // Generate calendar export data
  generateICalendar(jobs: Job[]): string {
    let icalContent = 'BEGIN:VCALENDAR\r\n';
    icalContent += 'VERSION:2.0\r\n';
    icalContent += 'PRODID:-//Sweeply//Calendar//EN\r\n';
    
    jobs.forEach(job => {
      icalContent += 'BEGIN:VEVENT\r\n';
      icalContent += `UID:${job.id}@sweeply.com\r\n`;
      icalContent += `DTSTART:${formatICalDate(job.scheduled_date, job.scheduled_time)}\r\n`;
      
      if (job.estimated_duration) {
        const endTime = calculateEndTime(job.scheduled_time || '09:00', job.estimated_duration);
        icalContent += `DTEND:${formatICalDate(job.scheduled_date, endTime)}\r\n`;
      }
      
      icalContent += `SUMMARY:${job.title || `${job.service_type} - ${job.client?.name || 'Unknown Client'}`}\r\n`;
      
      if (job.description) {
        icalContent += `DESCRIPTION:${job.description.replace(/\n/g, '\\n')}\r\n`;
      }
      
      if (job.address) {
        icalContent += `LOCATION:${job.address}\r\n`;
      }
      
      icalContent += 'END:VEVENT\r\n';
    });
    
    icalContent += 'END:VCALENDAR\r\n';
    return icalContent;
  },

  // Check if client exists for all jobs
  validateClientRelationships(jobs: Job[], clients: Client[]): Job[] {
    const clientIds = new Set(clients.map(c => c.id));
    return jobs.filter(job => job.client_id && !clientIds.has(job.client_id));
  },

  // Calculate job statistics by client
  getClientStats(jobs: Job[], clientId: string) {
    const clientJobs = jobs.filter(job => job.client_id === clientId);
    
    return {
      totalJobs: clientJobs.length,
      completedJobs: clientJobs.filter(j => j.status === 'completed').length,
      totalRevenue: clientJobs
        .filter(j => j.status === 'completed')
        .reduce((sum, job) => sum + (job.actual_price || job.estimated_price || 0), 0),
      upcomingJobs: clientJobs.filter(j => 
        j.status === 'scheduled' && 
        new Date(j.scheduled_date) >= new Date()
      ).length,
      averageJobValue: clientJobs.length > 0 
        ? clientJobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0) / clientJobs.length 
        : 0
    };
  }
};

// Helper functions
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function addMinutes(time: number, minutes: number): number {
  return time + minutes;
}

function isValidTimeFormat(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

function formatICalDate(date: string, time?: string): string {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  if (time) {
    const [hours, minutes] = time.split(':');
    return `${year}${month}${day}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;
  }
  
  return `${year}${month}${day}`;
}

function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
} 