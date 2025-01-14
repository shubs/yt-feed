import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

async function fetchVideoStatistics(videoIds: string[]) {
  const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not found')
  }

  const videoIdsString = videoIds.join(',')
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIdsString}&key=${YOUTUBE_API_KEY}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error('Error fetching video statistics:', error)
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

  const videoIds = entries.map((entry: any) => entry.id.split(':').pop())
  const statistics = await fetchVideoStatistics(videoIds)
  const statsMap = new Map(statistics.map((stat: any) => [stat.id, stat.statistics]))

  for (const entry of entries) {
    const videoId = entry.id.split(':').pop()
    const stats = statsMap.get(videoId) || { viewCount: 0, likeCount: 0 }
    
    const videoData = {
      channel_id: channelId,
      channel_name: channelName,
      video_id: videoId,
      video_title: entry.title,
      video_url: entry.link["@_href"],
      thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      published_at: new Date(entry.published),
      updated_at: new Date(),
      views: parseInt(stats.viewCount) || 0,
      rating_count: parseInt(stats.likeCount) || 0,
      rating_average: stats.likeCount ? 5 : 0,
      rating_min: 1,
      rating_max: 5
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Manual fetch triggered')
    const { data: creators, error: fetchError } = await supabase
      .from('creators')
      .select('channel_id')
    
    if (fetchError) throw fetchError
    
    console.log(`Found ${creators?.length || 0} creators to process`)

    for (const creator of creators || []) {
      try {
        const feed = await fetchYouTubeRSS(creator.channel_id)
        await processVideoData(feed, creator.channel_id)
      } catch (error) {
        console.error(`Error processing channel ${creator.channel_id}:`, error)
        continue
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Videos fetched and stored successfully',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in manual-fetch-videos function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})