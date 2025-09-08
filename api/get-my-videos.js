// /api/get-my-videos.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1];

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );

    // RLS 정책이 자동으로 user_id를 필터링해 줌
    const { data, error } = await supabase
      .from('saved_videos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}