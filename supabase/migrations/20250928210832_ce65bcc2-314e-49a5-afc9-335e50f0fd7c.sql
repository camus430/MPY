-- Activer les mises à jour en temps réel pour les vidéos
ALTER TABLE public.videos REPLICA IDENTITY FULL;
ALTER TABLE public.creators REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime pour les mises à jour en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE videos;
ALTER PUBLICATION supabase_realtime ADD TABLE creators;