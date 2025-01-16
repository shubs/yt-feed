import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChannelStatistics {
  subscriberCount: string;
}

interface YouTubeResponse {
  items: Array<{
    statistics: ChannelStatistics;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all creators
    const { data: creators, error: fetchError } = await supabaseClient
      .from('creators')
      .select('channel_id');

    if (fetchError) throw fetchError;

    // Process creators in batches of 50 (YouTube API limit)
    const batchSize = 50;
    for (let i = 0; i < creators.length; i += batchSize) {
      const batch = creators.slice(i, i + batchSize);
      const channelIds = batch.map(creator => creator.channel_id).join(',');

      // Fetch subscriber counts from YouTube API
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${Deno.env.get('YOUTUBE_API_KEY')}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data: YouTubeResponse = await response.json();

      // Update subscriber counts in database
      for (const item of data.items) {
        const subscriberCount = parseInt(item.statistics.subscriberCount, 10);
        const channelId = batch.find(c => data.items.some(i => i.id === c.channel_id))?.channel_id;

        if (channelId) {
          await supabaseClient
            .from('creators')
            .update({ subscribers_count: subscriberCount })
            .eq('channel_id', channelId);
        }
      }
    }

    return new Response(
      JSON.stringify({ message: 'Successfully updated subscriber counts' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});