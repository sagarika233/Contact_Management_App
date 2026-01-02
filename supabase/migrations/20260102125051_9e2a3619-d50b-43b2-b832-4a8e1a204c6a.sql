-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (contacts are visible to all)
CREATE POLICY "Anyone can view contacts" 
ON public.contacts 
FOR SELECT 
USING (true);

-- Create policy for public insert access (anyone can submit a contact)
CREATE POLICY "Anyone can create contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public delete access (for the bonus feature)
CREATE POLICY "Anyone can delete contacts" 
ON public.contacts 
FOR DELETE 
USING (true);

-- Enable realtime for contacts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;