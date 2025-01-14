import { createClient } from '@supabase/supabase-js'
import { XMLParser } from 'fast-xml-parser'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a single supabase client for interacting with your database
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

async function fetchYouTubeRSS(channelId: string) {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  console.log(`Fetching RSS feed for channel ${channelId}`)
  
  try {
    const response = await fetch(rssUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const xmlData = await response.text()
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    })
    
    return parser.parse(xmlData)
  } catch (error) {
    console.error(`Error fetching RSS feed for channel ${channelId}:`, error)
    throw error
  }
}

async function processVideoData(feed: any, channelId: string) {
  if (!feed.feed || !feed.feed.entry) {
    console.log(`No videos found for channel ${channelId}`)
    return
  }

  const entries = Array.isArray(feed.feed.entry) ? feed.feed.entry : [feed.feed.entry]
  const channelName = feed.feed.author?.name || 'Unknown Channel'
  
  console.log(`Processing ${entries.length} videos for channel ${channelId}`)

  for (const entry of entries) {
    const videoData = {
      channel_id: channelId,
      channel_name: channelName,
      video_id: entry.id.split(':').pop(),
      video_title: entry.title,
      video_url: entry.link["@_href"],
      thumbnail_url: `https://i.ytimg.com/vi/${entry.id.split(':').pop()}/hqdefault.jpg`,
      published_at: new Date(entry.published),
      updated_at: new Date(entry.updated),
      views: 0, // These will be updated later if we add YouTube API integration
      rating_count: 0,
      rating_average: 0
    }

    const { error } = await supabase
      .from('youtube_videos')
      .upsert(videoData, {
        onConflict: 'video_id',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error inserting video:', error)
      throw error
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Fetch all creators from the database
    const { data: creators, error: fetchError } = await supabase
      .from('creators')
      .select('channel_id')
    
    if (fetchError) throw fetchError
    
    console.log(`Found ${creators?.length || 0} creators to process`)

    // Process each creator's YouTube channel
    for (const creator of creators || []) {
      try {
        const feed = await fetchYouTubeRSS(creator.channel_id)
        await processVideoData(feed, creator.channel_id)
      } catch (error) {
        console.error(`Error processing channel ${creator.channel_id}:`, error)
        // Continue with next creator even if one fails
        continue
      }
    }

    return new Response(
      JSON.stringify({ message: 'Videos fetched and stored successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in fetch-youtube-videos function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})