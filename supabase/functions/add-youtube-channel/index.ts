import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { channelHandle } = await req.json()
    console.log("Processing channel:", channelHandle)

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
    if (!YOUTUBE_API_KEY) {
      throw new Error('Missing YouTube API key')
    }

    // First get channel details
    const channelResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelHandle}&key=${YOUTUBE_API_KEY}`
    )
    const channelData = await channelResponse.json()
    
    if (!channelData.items?.[0]) {
      throw new Error('Channel not found')
    }

    const channel = channelData.items[0]
    console.log("Channel details fetched:", channel.id)

    return new Response(
      JSON.stringify({
        id: channel.id,
        snippet: channel.snippet,
        statistics: channel.statistics
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
})