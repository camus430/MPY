-- Créer une table pour stocker les vidéos téléchargées/sauvegardées par les utilisateurs
CREATE TABLE public.downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Activer RLS
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les téléchargements
CREATE POLICY "Users can view their own downloads" 
ON public.downloads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own downloads" 
ON public.downloads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own downloads" 
ON public.downloads 
FOR DELETE 
USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX idx_downloads_video_id ON public.downloads(video_id);