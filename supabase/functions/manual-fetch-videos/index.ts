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

  // Split videoIds into chunks of 50 (YouTube API limit)
  const chunks = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }

  const allStats = [];
  for (const chunk of chunks) {
    const videoIdsString = chunk.join(',')
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIdsString}&key=${YOUTUBE_API_KEY}`
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      allStats.push(...(data.items || []))
    } catch (error) {
      console.error('Error fetching video statistics:', error)
      throw error
    }
  }

  return allStats
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

  // Prepare all video data before insertion
  const videosToUpsert = entries.map(entry => {
    const videoId = entry.id.split(':').pop()
    const stats = statsMap.get(videoId) || { viewCount: 0, likeCount: 0 }
    
    return {
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
  })

  // Batch upsert all videos
  const { error } = await supabase
    .from('youtube_videos')
    .upsert(videosToUpsert, {
      onConflict: 'video_id',
      ignoreDuplicates: false
    })

  if (error) {
    console.error('Error inserting videos:', error)
    throw error
  }

  return videosToUpsert.length
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Manual fetch triggered')
    const startTime = Date.now()

    const { data: creators, error: fetchError } = await supabase
      .from('creators')
      .select('channel_id')
    
    if (fetchError) {
      console.error('Error fetching creators:', fetchError)
      throw fetchError
    }
    
    console.log(`Found ${creators?.length || 0} creators to process`)

    const errors = []
    let totalVideosProcessed = 0

    // Process creators in parallel with a limit of 5 concurrent requests
    const batchSize = 5
    for (let i = 0; i < (creators?.length || 0); i += batchSize) {
      const batch = creators?.slice(i, i + batchSize) || []
      const promises = batch.map(async (creator) => {
        try {
          const feed = await fetchYouTubeRSS(creator.channel_id)
          const processedCount = await processVideoData(feed, creator.channel_id)
          if (processedCount) totalVideosProcessed += processedCount
          return { success: true, channelId: creator.channel_id, count: processedCount }
        } catch (error) {
          console.error(`Error processing channel ${creator.channel_id}:`, error)
          errors.push({ channelId: creator.channel_id, error: error.message })
          return { success: false, channelId: creator.channel_id, error: error.message }
        }
      })
      await Promise.all(promises)
    }

    const endTime = Date.now()
    const processingTime = (endTime - startTime) / 1000 // Convert to seconds

    const response = {
      message: 'Videos fetched and stored successfully',
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime.toFixed(2)} seconds`,
      totalVideosProcessed,
      errors: errors.length > 0 ? errors : undefined
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errors.length > 0 ? 207 : 200, // Use 207 Multi-Status if some operations failed
      }
    )
  } catch (error) {
    console.error('Error in manual-fetch-videos function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})