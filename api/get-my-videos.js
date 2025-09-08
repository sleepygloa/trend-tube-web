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
    
    console.log('Attempting to fetch data from Supabase...');
    const { data, error } = await supabase
      .from('saved_videos')
      .select('*')
      .order('created_at', { ascending: false })
      ;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    console.log('Fetched Data:', data);
    res.status(200).json(data);
  } catch (error) {
    console.error('Handler catch block error:', error);
    res.status(500).json({ error: error.message });
  }
}