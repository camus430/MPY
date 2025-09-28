import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: string;
  view_count: number;
  published_at: string;
}

function formatDuration(duration: string): string {
  // Convert ISO 8601 duration (PT4M13S) to readable format (4:13)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function getChannelVideos(channelId: string): Promise<YouTubeVideo[]> {
  const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
  
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  console.log('Fetching ALL videos for channel:', channelId);
  
  let allVideos: YouTubeVideo[] = [];
  let nextPageToken = '';
  let totalFetched = 0;
  const maxResults = 50; // Maximum allowed per request
  
  do {
    // Get videos from the channel with pagination
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    
    console.log(`Fetching page ${Math.floor(totalFetched / maxResults) + 1}... (nextPageToken: ${nextPageToken || 'none'})`);
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    console.log(`API Response status: ${searchResponse.status}`);
    console.log(`API Response data:`, JSON.stringify(searchData, null, 2));
    
    if (!searchResponse.ok || !searchData.items) {
      console.error('Search API error:', searchData);
      throw new Error('Impossible de récupérer les vidéos');
    }

    if (searchData.items.length === 0) {
      console.log('No more videos found, breaking pagination loop');
      break; // No more videos
    }

    console.log(`Found ${searchData.items.length} videos on this page`);
    console.log(`Page info - Total results: ${searchData.pageInfo?.totalResults || 'unknown'}, Results per page: ${searchData.pageInfo?.resultsPerPage || 'unknown'}`);
    
    // Get video details (duration, view count) for this batch
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();
    
    if (!videosResponse.ok || !videosData.items) {
      console.error('Videos API error:', videosData);
      throw new Error('Impossible de récupérer les détails des vidéos');
    }

    // Combine search results with video details for this batch
    const batchVideos: YouTubeVideo[] = searchData.items.map((searchItem: any) => {
      const videoDetails = videosData.items.find((video: any) => video.id === searchItem.id.videoId);
      
      return {
        id: searchItem.id.videoId,
        title: searchItem.snippet.title,
        thumbnail_url: searchItem.snippet.thumbnails?.high?.url || searchItem.snippet.thumbnails?.default?.url || '',
        duration: formatDuration(videoDetails?.contentDetails?.duration || 'PT0S'),
        view_count: parseInt(videoDetails?.statistics?.viewCount || '0'),
        published_at: searchItem.snippet.publishedAt
      };
    });

    allVideos = allVideos.concat(batchVideos);
    totalFetched += searchData.items.length;
    nextPageToken = searchData.nextPageToken || '';
    
    console.log(`Total videos fetched so far: ${totalFetched}`);
    console.log(`Next page token: ${nextPageToken || 'none'}`);
    
    // Add a small delay to avoid hitting rate limits
    if (nextPageToken) {
      console.log(`Continuing to next page after delay...`);
      await new Promise(resolve => setTimeout(resolve, 200));
    } else {
      console.log('No more pages to fetch');
    }
    
  } while (nextPageToken && totalFetched < 5000); // Increased limit to handle channels with many videos

  console.log(`Finished fetching. Total videos found: ${allVideos.length}`);
  return allVideos;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { creator_id, channel_id } = await req.json();
    
    if (!creator_id || !channel_id) {
      throw new Error('creator_id et channel_id sont requis');
    }

    console.log('Fetching videos for creator:', creator_id, 'channel:', channel_id);
    
    const videos = await getChannelVideos(channel_id);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Insert videos into database
    const { data: insertedVideos, error } = await supabase
      .from('videos')
      .insert(
        videos.map(video => ({
          title: video.title,
          thumbnail_url: video.thumbnail_url,
          duration: video.duration,
          view_count: video.view_count,
          creator_id: creator_id,
        }))
      )
      .select();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Erreur lors de l\'insertion des vidéos en base de données');
    }

    console.log(`Successfully inserted ${insertedVideos?.length || 0} videos`);
    
    return new Response(JSON.stringify({ 
      message: `${videos.length} vidéos récupérées et ajoutées`,
      videos_count: videos.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-youtube-videos function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des vidéos YouTube';
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});