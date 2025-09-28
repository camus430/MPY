-- Allow public insertion of creators (since this is a public platform like YouTube)
CREATE POLICY "Anyone can insert creators" 
ON public.creators 
FOR INSERT 
WITH CHECK (true);

-- Allow public updates of creators (for editing)
CREATE POLICY "Anyone can update creators" 
ON public.creators 
FOR UPDATE 
USING (true);

-- Allow public deletion of creators (for management)
CREATE POLICY "Anyone can delete creators" 
ON public.creators 
FOR DELETE 
USING (true);