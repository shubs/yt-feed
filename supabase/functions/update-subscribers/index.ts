import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

async function updateSubscriberCount(channelId: string): Promise<number> {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
  )
  const data = await response.json()
  
  if (!data.items?.[0]?.statistics?.subscriberCount) {
    throw new Error(`No subscriber count found for channel ${channelId}`)
  }
  
  return parseInt(data.items[0].statistics.subscriberCount)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // If a specific channelId is provided, update only that channel
    const body = await req.json().catch(() => ({}))
    
    if (body.channelId) {
      console.log('Updating subscriber count for channel:', body.channelId)
      const subscriberCount = await updateSubscriberCount(body.channelId)
      console.log('Fetched subscriber count:', subscriberCount)

      const { error } = await supabase
        .from('creators')
        .update({ subscribers_count: subscriberCount })
        .eq('channel_id', body.channelId)

      if (error) throw error

      return new Response(
        JSON.stringify({ subscriberCount }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // If no channelId provided, update all creators
    console.log('Updating subscriber counts for all creators')
    const { data: creators, error: fetchError } = await supabase
      .from('creators')
      .select('channel_id')

    if (fetchError) throw fetchError

    const results = await Promise.all(
      creators!.map(async (creator) => {
        try {
          const subscriberCount = await updateSubscriberCount(creator.channel_id)
          const { error } = await supabase
            .from('creators')
            .update({ subscribers_count: subscriberCount })
            .eq('channel_id', creator.channel_id)

          if (error) throw error

          return {
            channelId: creator.channel_id,
            subscriberCount,
            status: 'success'
          }
        } catch (error) {
          console.error(`Error updating ${creator.channel_id}:`, error)
          return {
            channelId: creator.channel_id,
            error: error.message,
            status: 'error'
          }
        }
      })
    )

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})