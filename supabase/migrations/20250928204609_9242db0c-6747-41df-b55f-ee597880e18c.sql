-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies - users can only manage their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Update trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Drop dangerous public policies on videos table
DROP POLICY IF EXISTS "Anyone can delete videos" ON public.videos;
DROP POLICY IF EXISTS "Anyone can insert videos" ON public.videos; 
DROP POLICY IF EXISTS "Anyone can update videos" ON public.videos;

-- Drop dangerous public policies on creators table  
DROP POLICY IF EXISTS "Anyone can delete creators" ON public.creators;
DROP POLICY IF EXISTS "Anyone can insert creators" ON public.creators;
DROP POLICY IF EXISTS "Anyone can update creators" ON public.creators;

-- Create secure policies for videos - only authenticated users can modify
CREATE POLICY "Authenticated users can insert videos" 
ON public.videos 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update videos" 
ON public.videos 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete videos" 
ON public.videos 
FOR DELETE 
TO authenticated
USING (true);

-- Create secure policies for creators - only authenticated users can modify  
CREATE POLICY "Authenticated users can insert creators" 
ON public.creators 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update creators" 
ON public.creators 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete creators" 
ON public.creators 
FOR DELETE 
TO authenticated
USING (true);