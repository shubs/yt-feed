import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { channelHandle } = await req.json()
    console.log('Searching for channel:', channelHandle)

    // First, search for the channel
    const searchResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${channelHandle}&type=channel&key=${Deno.env.get('YOUTUBE_API_KEY')}`
    )
    const searchData = await searchResponse.json()
    console.log('Channel search response:', searchData)

    if (!searchData.items?.length) {
      return new Response(
        JSON.stringify({ error: 'Channel not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    const channelId = searchData.items[0].id.channelId

    // Then, get detailed channel information
    const channelResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${Deno.env.get('YOUTUBE_API_KEY')}`
    )
    const channelData = await channelResponse.json()
    console.log('Channel details response:', channelData)

    if (!channelData.items?.length) {
      return new Response(
        JSON.stringify({ error: 'Could not fetch channel details' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    return new Response(
      JSON.stringify(channelData.items[0]),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})