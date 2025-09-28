import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

async function getLatestVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    // Get channel's latest videos
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${apiKey}`
    );
    
    if (!searchResponse.ok) {
      throw new Error(`YouTube API search error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    // Get video details (duration, view count)
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`
    );
    
    if (!videosResponse.ok) {
      throw new Error(`YouTube API videos error: ${videosResponse.status}`);
    }
    
    const videosData = await videosResponse.json();

    // Combine search results with video details
    const videos: YouTubeVideo[] = searchData.items.map((item: any) => {
      const videoDetails = videosData.items.find((v: any) => v.id === item.id.videoId);
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails?.maxres?.url || 
                     item.snippet.thumbnails?.high?.url || 
                     item.snippet.thumbnails?.medium?.url || 
                     item.snippet.thumbnails?.default?.url || '',
        duration: formatDuration(videoDetails?.contentDetails?.duration || 'PT0S'),
        viewCount: parseInt(videoDetails?.statistics?.viewCount || '0'),
        publishedAt: item.snippet.publishedAt,
      };
    });

    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting video sync...');

    // Get all creators with YouTube channel IDs
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('id, name, youtube_channel_id')
      .not('youtube_channel_id', 'is', null);

    if (creatorsError) {
      throw creatorsError;
    }

    console.log(`Found ${creators?.length || 0} creators with YouTube channels`);

    let totalNewVideos = 0;

    for (const creator of creators || []) {
      try {
        console.log(`Syncing videos for ${creator.name} (${creator.youtube_channel_id})`);

        // Get latest videos from YouTube
        const latestVideos = await getLatestVideos(creator.youtube_channel_id, 5);
        
        for (const video of latestVideos) {
          // Check if video already exists in database
          const { data: existingVideo } = await supabase
            .from('videos')
            .select('id')
            .eq('title', video.title)
            .eq('creator_id', creator.id)
            .single();

          if (!existingVideo) {
            // Insert new video
            const { error: insertError } = await supabase
              .from('videos')
              .insert({
                title: video.title,
                thumbnail_url: video.thumbnailUrl,
                duration: video.duration,
                view_count: video.viewCount,
                creator_id: creator.id,
              });

            if (insertError) {
              console.error(`Error inserting video for ${creator.name}:`, insertError);
            } else {
              totalNewVideos++;
              console.log(`Added new video: ${video.title}`);
            }
          }
        }

        // Add a small delay between creators to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error syncing videos for creator ${creator.name}:`, error);
        // Continue with next creator
      }
    }

    console.log(`Sync complete. Added ${totalNewVideos} new videos.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sync completed successfully. Added ${totalNewVideos} new videos.`,
        newVideosCount: totalNewVideos 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: any) {
    console.error('Error in sync function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error?.message || 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});