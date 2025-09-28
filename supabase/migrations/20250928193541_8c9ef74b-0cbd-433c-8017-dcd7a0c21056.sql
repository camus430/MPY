-- Enable the pg_cron extension to allow scheduling edge functions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to sync YouTube videos every hour
SELECT cron.schedule(
  'sync-youtube-videos-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://sagvgkbmnwzlfrlrtwok.supabase.co/functions/v1/sync-youtube-videos',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZ3Zna2Jtbnd6bGZybHJ0d29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzI2MzksImV4cCI6MjA3NDY0ODYzOX0.ncN7wLW5jutWiHnkLQ0f7prpjoR7lhsp72KEB_1ouJc"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);