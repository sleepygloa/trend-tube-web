// /api/save-video.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { video_id, title, channel_title, thumbnail_url } = req.body;
    
    const { data, error } = await supabase
      .from('saved_videos')
      .insert([{ video_id, title, channel_title, thumbnail_url }]);
      
    if (error) throw error;
    
    res.status(200).json({ message: '영상 정보가 저장되었습니다.', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}