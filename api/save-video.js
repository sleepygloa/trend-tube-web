import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { videoData, accessToken } = req.body;
    
    const supabase = createClient(
      process.env.SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_KEY,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );
      
    // RLS 정책에 따라 현재 로그인된 사용자의 user_id가 자동으로 삽입됨
    const { data, error } = await supabase
      .from('saved_videos')
      .insert([
        { 
          video_id: videoData.video_id, 
          title: videoData.title, 
          channel_title: videoData.channel_title, 
          thumbnail_url: videoData.thumbnail_url,
          memo: videoData.memo, // memo 데이터 추가
          tags: videoData.tags, // tags 데이터 추가
        }
      ]);
      
    if (error) throw error;
    
    res.status(200).json({ message: '영상 정보가 저장되었습니다.', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
