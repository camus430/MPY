-- Create creators table
CREATE TABLE public.creators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  subscriber_count INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (YouTube-style platform)
CREATE POLICY "Creators are publicly viewable" 
ON public.creators 
FOR SELECT 
USING (true);

CREATE POLICY "Videos are publicly viewable" 
ON public.videos 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_creators_updated_at
  BEFORE UPDATE ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample data
INSERT INTO public.creators (name, avatar_url, subscriber_count, description) VALUES 
('CodeAcademy FR', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face', 125000, 'Formations en développement web et programmation'),
('Adventure Seekers', 'https://images.unsplash.com/photo-1494790108755-2616b612b547?w=50&h=50&fit=crop&crop=face', 89000, 'Voyages et aventures à travers le monde'),
('Chef Antoine', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face', 256000, 'Recettes traditionnelles et secrets de cuisine'),
('Gaming Pro', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face', 67000, 'Tests matériel gaming et critiques de jeux'),
('Dev Masters', 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=50&h=50&fit=crop&crop=face', 198000, 'Tutoriels avancés en développement'),
('Travel Stories', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face', 143000, 'Récits de voyage et conseils pratiques'),
('Cucina Italiana', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face', 312000, 'Cuisine italienne authentique'),
('Game Reviews', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face', 445000, 'Reviews et actualités gaming');

-- Insert sample videos (using the creator IDs)
INSERT INTO public.videos (title, thumbnail_url, duration, view_count, creator_id) VALUES 
('Apprendre React en 2024 : Guide Complet pour Débutants', '/placeholder-thumb-1.jpg', '15:42', 125000, (SELECT id FROM public.creators WHERE name = 'CodeAcademy FR')),
('VOYAGE ÉPIQUE en Islande | Les plus beaux paysages du monde', '/placeholder-thumb-2.jpg', '22:18', 89000, (SELECT id FROM public.creators WHERE name = 'Adventure Seekers')),
('La MEILLEURE Recette de Croissants Maison (Secret de Boulanger)', '/placeholder-thumb-3.jpg', '18:35', 256000, (SELECT id FROM public.creators WHERE name = 'Chef Antoine')),
('MON SETUP GAMING 2024 | 5000€ de matériel !', '/placeholder-thumb-4.jpg', '12:20', 67000, (SELECT id FROM public.creators WHERE name = 'Gaming Pro')),
('JavaScript ES6+ : Les fonctionnalités que tout dev doit connaître', '/placeholder-thumb-5.jpg', '25:14', 198000, (SELECT id FROM public.creators WHERE name = 'Dev Masters')),
('Road Trip en Norvège : 7 jours d aventure pure !', '/placeholder-thumb-6.jpg', '28:47', 143000, (SELECT id FROM public.creators WHERE name = 'Travel Stories')),
('PASTA CARBONARA Authentique | La VRAIE recette italienne', '/placeholder-thumb-7.jpg', '14:28', 312000, (SELECT id FROM public.creators WHERE name = 'Cucina Italiana')),
('TOP 10 des JEUX à Absolument Jouer en 2024', '/placeholder-thumb-8.jpg', '16:52', 445000, (SELECT id FROM public.creators WHERE name = 'Game Reviews'));