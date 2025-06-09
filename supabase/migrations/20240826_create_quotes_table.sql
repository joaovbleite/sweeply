-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    valid_until DATE,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount NUMERIC(10,2) DEFAULT 0,
    tax NUMERIC(5,2) DEFAULT 0,
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    terms TEXT,
    worker TEXT
);

-- Add RLS policies
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own quotes
CREATE POLICY "Users can view their own quotes" 
ON public.quotes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for users to insert their own quotes
CREATE POLICY "Users can insert their own quotes" 
ON public.quotes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own quotes
CREATE POLICY "Users can update their own quotes" 
ON public.quotes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy for users to delete their own quotes
CREATE POLICY "Users can delete their own quotes" 
ON public.quotes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS quotes_user_id_idx ON public.quotes (user_id);
CREATE INDEX IF NOT EXISTS quotes_client_id_idx ON public.quotes (client_id);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON public.quotes (status);
CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON public.quotes (created_at);

-- Set up updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 