-- Ajouter des colonnes pour les fichiers locaux dans la table videos
ALTER TABLE public.videos 
ADD COLUMN video_file_url TEXT,
ADD COLUMN audio_file_url TEXT,
ADD COLUMN file_type VARCHAR(20) DEFAULT 'youtube',
ADD COLUMN file_size BIGINT;

-- Créer un bucket pour les fichiers vidéo/audio
INSERT INTO storage.buckets (id, name, public) VALUES ('media-files', 'media-files', true);

-- Politiques pour le bucket media-files
CREATE POLICY "Authenticated users can upload media files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media-files' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view media files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media-files');

CREATE POLICY "Authenticated users can update their media files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their media files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media-files' AND auth.role() = 'authenticated');