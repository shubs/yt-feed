import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

async function updateSubscriberCount(channelId: string): Promise<{ channelId: string; subscriberCount: number; status: string }> {
  console.log(`Fetching subscriber count for channel: ${channelId}`)
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`YouTube API responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('YouTube API response:', JSON.stringify(data))
    
    if (!data.items?.[0]?.statistics?.subscriberCount) {
      throw new Error(`No subscriber count found for channel ${channelId}`)
    }
    
    const subscriberCount = parseInt(data.items[0].statistics.subscriberCount)
    console.log(`Subscriber count for ${channelId}: ${subscriberCount}`)
    
    const { error: updateError } = await supabase
      .from('creators')
      .update({ subscribers_count: subscriberCount })
      .eq('channel_id', channelId)
    
    if (updateError) {
      throw updateError
    }
    
    return {
      channelId,
      subscriberCount,
      status: 'success'
    }
  } catch (error) {
    console.error(`Error updating ${channelId}:`, error)
    return {
      channelId,
      subscriberCount: 0,
      status: 'error'
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received request to update subscribers')
    const body = await req.json().catch(() => ({}))
    
    if (body.channelId) {
      console.log('Updating single channel:', body.channelId)
      const result = await updateSubscriberCount(body.channelId)
      
      return new Response(
        JSON.stringify({ result }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    console.log('Fetching all creators')
    const { data: creators, error: fetchError } = await supabase
      .from('creators')
      .select('channel_id')

    if (fetchError) {
      throw fetchError
    }

    if (!creators || creators.length === 0) {
      return new Response(
        JSON.stringify({ results: [], message: 'No creators found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`Found ${creators.length} creators to update`)
    const results = await Promise.all(
      creators.map(creator => updateSubscriberCount(creator.channel_id))
    )

    console.log('Update complete. Results:', JSON.stringify(results))
    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in update-subscribers function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})