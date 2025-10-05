-- Nettoyer les doublons existants (garder le plus ancien de chaque youtube_channel_id)
DELETE FROM creators a USING creators b
WHERE a.id > b.id 
  AND a.youtube_channel_id = b.youtube_channel_id
  AND a.youtube_channel_id IS NOT NULL;

-- Ajouter une contrainte UNIQUE sur youtube_channel_id pour éviter les doublons futurs
-- Note: Cette contrainte n'empêche pas les valeurs NULL multiples
ALTER TABLE creators 
ADD CONSTRAINT creators_youtube_channel_id_unique 
UNIQUE (youtube_channel_id);

-- Créer un index pour améliorer les performances des recherches par youtube_channel_id
CREATE INDEX IF NOT EXISTS idx_creators_youtube_channel_id 
ON creators(youtube_channel_id) 
WHERE youtube_channel_id IS NOT NULL;