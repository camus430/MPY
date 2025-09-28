-- Update thumbnail URLs to use the generated images
UPDATE public.videos 
SET thumbnail_url = CASE 
  WHEN title ILIKE '%React%' OR title ILIKE '%JavaScript%' THEN '/src/assets/thumbnail-coding.jpg'
  WHEN title ILIKE '%Islande%' OR title ILIKE '%Norvège%' THEN '/src/assets/thumbnail-travel.jpg'  
  WHEN title ILIKE '%Croissants%' OR title ILIKE '%CARBONARA%' THEN '/src/assets/thumbnail-cooking.jpg'
  WHEN title ILIKE '%GAMING%' OR title ILIKE '%JEUX%' OR title ILIKE '%SETUP%' THEN '/src/assets/thumbnail-gaming.jpg'
  ELSE '/src/assets/thumbnail-coding.jpg'
END;