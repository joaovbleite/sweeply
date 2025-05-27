-- Add property_type and related fields to jobs table for residential vs commercial support
ALTER TABLE jobs 
ADD COLUMN property_type TEXT CHECK (property_type IN ('residential', 'commercial')) DEFAULT 'residential' NOT NULL;

-- Add commercial-specific fields
ALTER TABLE jobs 
ADD COLUMN square_footage INTEGER,
ADD COLUMN number_of_floors INTEGER,
ADD COLUMN building_type TEXT;

-- Add residential-specific fields  
ALTER TABLE jobs 
ADD COLUMN number_of_bedrooms INTEGER,
ADD COLUMN number_of_bathrooms INTEGER,
ADD COLUMN house_type TEXT;

-- Create index for property_type for filtering performance
CREATE INDEX idx_jobs_property_type ON jobs(property_type);

-- Add comments for clarity
COMMENT ON COLUMN jobs.property_type IS 'Type of property: residential or commercial';
COMMENT ON COLUMN jobs.square_footage IS 'Total square footage for commercial properties';
COMMENT ON COLUMN jobs.number_of_floors IS 'Number of floors for commercial properties';
COMMENT ON COLUMN jobs.building_type IS 'Type of commercial building (office, retail, warehouse, etc.)';
COMMENT ON COLUMN jobs.number_of_bedrooms IS 'Number of bedrooms for residential properties';
COMMENT ON COLUMN jobs.number_of_bathrooms IS 'Number of bathrooms for residential properties';
COMMENT ON COLUMN jobs.house_type IS 'Type of residential property (apartment, house, condo, etc.)'; 