-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('job', 'payment', 'client', 'system', 'reminder', 'team')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- System can insert notifications (for triggers and functions)
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title TEXT,
  p_message TEXT,
  p_priority VARCHAR(10) DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, priority, 
    action_url, action_label, metadata
  )
  VALUES (
    p_user_id, p_type, p_title, p_message, p_priority,
    p_action_url, p_action_label, p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger function to create notifications on job status changes
CREATE OR REPLACE FUNCTION notify_job_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_name TEXT;
  v_title TEXT;
  v_message TEXT;
  v_priority VARCHAR(10);
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get client name
  SELECT name INTO v_client_name
  FROM clients
  WHERE id = NEW.client_id;

  -- Set notification details based on status
  CASE NEW.status
    WHEN 'scheduled' THEN
      v_title := 'Job Scheduled';
      v_message := format('New job scheduled for %s on %s', 
        COALESCE(v_client_name, 'Unknown Client'),
        to_char(NEW.scheduled_date, 'Mon DD, YYYY')
      );
      v_priority := 'medium';
    
    WHEN 'in_progress' THEN
      v_title := 'Job Started';
      v_message := format('Job for %s has started', 
        COALESCE(v_client_name, 'Unknown Client')
      );
      v_priority := 'medium';
    
    WHEN 'completed' THEN
      v_title := 'Job Completed';
      v_message := format('Job for %s has been completed successfully', 
        COALESCE(v_client_name, 'Unknown Client')
      );
      v_priority := 'low';
    
    WHEN 'cancelled' THEN
      v_title := 'Job Cancelled';
      v_message := format('Job for %s has been cancelled', 
        COALESCE(v_client_name, 'Unknown Client')
      );
      v_priority := 'high';
    
    ELSE
      RETURN NEW;
  END CASE;

  -- Create notification
  PERFORM create_notification(
    p_user_id := NEW.user_id,
    p_type := 'job',
    p_title := v_title,
    p_message := v_message,
    p_priority := v_priority,
    p_action_url := format('/jobs/%s', NEW.id),
    p_action_label := 'View Job',
    p_metadata := jsonb_build_object(
      'job_id', NEW.id,
      'client_id', NEW.client_id,
      'old_status', OLD.status,
      'new_status', NEW.status
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger for job status changes
CREATE TRIGGER on_job_status_change
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION notify_job_status_change();

-- Trigger function for new client notifications
CREATE OR REPLACE FUNCTION notify_new_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM create_notification(
    p_user_id := NEW.user_id,
    p_type := 'client',
    p_title := 'New Client Added',
    p_message := format('%s has been added as a new client', NEW.name),
    p_priority := 'low',
    p_action_url := format('/clients/%s', NEW.id),
    p_action_label := 'View Client',
    p_metadata := jsonb_build_object(
      'client_id', NEW.id,
      'client_name', NEW.name
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new clients
CREATE TRIGGER on_new_client
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_client();

-- Trigger function for invoice status changes
CREATE OR REPLACE FUNCTION notify_invoice_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_name TEXT;
  v_title TEXT;
  v_message TEXT;
  v_priority VARCHAR(10);
BEGIN
  -- Only proceed if status changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get client name
  SELECT name INTO v_client_name
  FROM clients
  WHERE id = NEW.client_id;

  -- Set notification details based on status
  CASE NEW.status
    WHEN 'paid' THEN
      v_title := 'Payment Received';
      v_message := format('Payment of %s has been received from %s for Invoice %s',
        '$' || NEW.total_amount::TEXT,
        COALESCE(v_client_name, 'Unknown Client'),
        NEW.invoice_number
      );
      v_priority := 'medium';
    
    WHEN 'overdue' THEN
      v_title := 'Invoice Overdue';
      v_message := format('Invoice %s for %s is now overdue. Amount due: %s',
        NEW.invoice_number,
        COALESCE(v_client_name, 'Unknown Client'),
        '$' || NEW.balance_due::TEXT
      );
      v_priority := 'high';
    
    ELSE
      RETURN NEW;
  END CASE;

  -- Create notification
  PERFORM create_notification(
    p_user_id := NEW.user_id,
    p_type := 'payment',
    p_title := v_title,
    p_message := v_message,
    p_priority := v_priority,
    p_action_url := format('/invoices/%s', NEW.id),
    p_action_label := 'View Invoice',
    p_metadata := jsonb_build_object(
      'invoice_id', NEW.id,
      'client_id', NEW.client_id,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'amount', NEW.total_amount
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger for invoice status changes
CREATE TRIGGER on_invoice_status_change
  AFTER UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION notify_invoice_status_change();

-- Function to create job reminders (to be called by a cron job)
CREATE OR REPLACE FUNCTION create_job_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job RECORD;
BEGIN
  -- Find jobs starting in the next 30 minutes
  FOR v_job IN
    SELECT j.*, c.name as client_name, c.address as client_address
    FROM jobs j
    LEFT JOIN clients c ON j.client_id = c.id
    WHERE j.status = 'scheduled'
    AND j.scheduled_date = CURRENT_DATE
    AND j.scheduled_time IS NOT NULL
    AND j.scheduled_time::time BETWEEN CURRENT_TIME AND CURRENT_TIME + INTERVAL '30 minutes'
    AND NOT EXISTS (
      -- Check if reminder already sent
      SELECT 1 FROM notifications n
      WHERE n.type = 'reminder'
      AND n.metadata->>'job_id' = j.id::TEXT
      AND n.created_at > NOW() - INTERVAL '1 hour'
    )
  LOOP
    PERFORM create_notification(
      p_user_id := v_job.user_id,
      p_type := 'reminder',
      p_title := 'Job Reminder',
      p_message := format('Don''t forget! You have a %s job at %s in 30 minutes.',
        COALESCE(v_job.service_type, 'cleaning'),
        COALESCE(v_job.client_address, v_job.address, 'the scheduled location')
      ),
      p_priority := 'high',
      p_action_url := format('/jobs/%s', v_job.id),
      p_action_label := 'View Job',
      p_metadata := jsonb_build_object(
        'job_id', v_job.id,
        'client_id', v_job.client_id,
        'scheduled_time', v_job.scheduled_time
      )
    );
  END LOOP;
END;
$$;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update timestamp
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 