-- Add line_items column to jobs table for itemized services
ALTER TABLE jobs ADD COLUMN line_items JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN jobs.line_items IS 'Array of line items with description, quantity, and price';

-- Update function to handle line items in the total price calculation
CREATE OR REPLACE FUNCTION calculate_job_total_from_line_items()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total from line items if they exist
  IF NEW.line_items IS NOT NULL AND jsonb_array_length(NEW.line_items) > 0 THEN
    -- Sum up price * quantity for each line item
    NEW.estimated_price = (
      SELECT COALESCE(SUM((item->>'price')::decimal * COALESCE((item->>'quantity')::integer, 1)), 0)
      FROM jsonb_array_elements(NEW.line_items) AS item
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate estimated price from line items
CREATE TRIGGER calculate_job_price_from_line_items
  BEFORE INSERT OR UPDATE OF line_items ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_job_total_from_line_items(); 