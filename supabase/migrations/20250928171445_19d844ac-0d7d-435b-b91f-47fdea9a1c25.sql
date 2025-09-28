-- Add missing RLS policies for videos table

-- Allow anyone to insert videos (needed for the edge function)
CREATE POLICY "Anyone can insert videos" 
ON public.videos 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update videos
CREATE POLICY "Anyone can update videos" 
ON public.videos 
FOR UPDATE 
USING (true);

-- Allow anyone to delete videos  
CREATE POLICY "Anyone can delete videos" 
ON public.videos 
FOR DELETE 
USING (true);