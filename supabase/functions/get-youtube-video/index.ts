import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Fetching video data for URL:', url);

    if (!url || typeof url !== 'string') {
      throw new Error('URL de vidéo invalide');
    }

    // Extraire l'ID de la vidéo depuis l'URL
    let videoId: string | null = null;
    
    // Format: youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
    
    // Format: youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }

    if (!videoId) {
      throw new Error('Impossible d\'extraire l\'ID de la vidéo depuis l\'URL');
    }

    console.log('Extracted video ID:', videoId);

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY non configurée');
    }

    // Récupérer les détails de la vidéo
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    console.log('Fetching video details...');
    
    const videoResponse = await fetch(videoUrl);
    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      throw new Error('Vidéo non trouvée');
    }

    const video = videoData.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;
    const statistics = video.statistics;

    // Récupérer les infos du créateur
    const channelId = snippet.channelId;
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    console.log('Fetching channel details...');
    
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('Chaîne non trouvée');
    }

    const channel = channelData.items[0];

    // Formater la durée (de ISO 8601 vers format lisible)
    const formatDuration = (duration: string): string => {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return '0:00';
      
      const hours = match[1] ? parseInt(match[1]) : 0;
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const seconds = match[3] ? parseInt(match[3]) : 0;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const result = {
      video: {
        youtube_video_id: videoId,
        title: snippet.title,
        description: snippet.description,
        thumbnail_url: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
        duration: formatDuration(contentDetails.duration),
        view_count: parseInt(statistics.viewCount || '0'),
        published_at: snippet.publishedAt,
      },
      creator: {
        name: channel.snippet.title,
        youtube_channel_id: channelId,
        avatar_url: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
        description: channel.snippet.description,
        subscriber_count: parseInt(channel.statistics.subscriberCount || '0'),
      }
    };

    console.log('Video data fetched successfully:', result.video.title);
    console.log('Creator data:', result.creator.name);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in get-youtube-video:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
