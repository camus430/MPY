import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeChannelInfo {
  name: string;
  avatar_url: string;
  subscriber_count: number;
  description: string;
}

function extractChannelId(url: string): string | null {
  // Handle different YouTube URL formats
  if (url.includes('youtube.com/channel/')) {
    return url.split('youtube.com/channel/')[1].split('/')[0].split('?')[0];
  }
  if (url.includes('youtube.com/c/')) {
    return url.split('youtube.com/c/')[1].split('/')[0].split('?')[0];
  }
  if (url.includes('youtube.com/@')) {
    return url.split('youtube.com/@')[1].split('/')[0].split('?')[0];
  }
  if (url.includes('youtube.com/user/')) {
    return url.split('youtube.com/user/')[1].split('/')[0].split('?')[0];
  }
  
  // If it's just an ID/handle
  if (url.startsWith('@')) {
    return url;
  }
  
  // If it's already a channel ID (24 characters starting with UC)
  if (url.length === 24 && url.startsWith('UC')) {
    return url;
  }
  
  return url; // Assume it's a handle or channel name
}

async function getChannelInfo(channelIdentifier: string): Promise<YouTubeChannelInfo> {
  const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
  
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  console.log('Fetching channel info for:', channelIdentifier);
  
  let apiUrl: string;
  
  // Determine if it's a channel ID or handle/username
  if (channelIdentifier.startsWith('UC') && channelIdentifier.length === 24) {
    // It's a channel ID
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIdentifier}&key=${YOUTUBE_API_KEY}`;
  } else if (channelIdentifier.startsWith('@')) {
    // It's a handle (new format)
    const handle = channelIdentifier.startsWith('@') ? channelIdentifier : `@${channelIdentifier}`;
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${encodeURIComponent(handle)}&key=${YOUTUBE_API_KEY}`;
  } else {
    // Try as username first
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forUsername=${channelIdentifier}&key=${YOUTUBE_API_KEY}`;
  }

  console.log('API URL:', apiUrl);

  const response = await fetch(apiUrl);
  const data = await response.json();
  
  console.log('YouTube API response:', JSON.stringify(data, null, 2));
  
  if (!response.ok || !data.items || data.items.length === 0) {
    // If username didn't work, try searching by channel name
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelIdentifier)}&maxResults=1&key=${YOUTUBE_API_KEY}`;
    console.log('Trying search URL:', searchUrl);
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    console.log('Search response:', JSON.stringify(searchData, null, 2));
    
    if (!searchResponse.ok || !searchData.items || searchData.items.length === 0) {
      throw new Error(`Chaîne YouTube non trouvée pour: ${channelIdentifier}`);
    }
    
    // Get the channel details using the found channel ID
    const foundChannelId = searchData.items[0].snippet.channelId;
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${foundChannelId}&key=${YOUTUBE_API_KEY}`;
    
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();
    
    if (!channelResponse.ok || !channelData.items || channelData.items.length === 0) {
      throw new Error(`Impossible de récupérer les détails de la chaîne: ${channelIdentifier}`);
    }
    
    const channel = channelData.items[0];
    return {
      name: channel.snippet.title,
      avatar_url: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url || '',
      subscriber_count: parseInt(channel.statistics?.subscriberCount || '0'),
      description: channel.snippet.description || ''
    };
  }
  
  const channel = data.items[0];
  return {
    name: channel.snippet.title,
    avatar_url: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url || '',
    subscriber_count: parseInt(channel.statistics?.subscriberCount || '0'),
    description: channel.snippet.description || ''
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL YouTube requise');
    }

    const channelIdentifier = extractChannelId(url);
    
    if (!channelIdentifier) {
      throw new Error('Format d\'URL YouTube non valide');
    }

    console.log('Extracted channel identifier:', channelIdentifier);
    
    const channelInfo = await getChannelInfo(channelIdentifier);
    
    return new Response(JSON.stringify(channelInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-youtube-creator function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des informations YouTube';
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});