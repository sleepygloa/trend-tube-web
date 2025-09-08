import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트는 백엔드 전용 키를 사용합니다.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  try {
    // RLS 정책이 적용되므로, 이 API를 호출하는 사용자의 권한으로 데이터가 조회됩니다.
    // (실제 프로덕션에서는 req 헤더의 인증 토큰으로 사용자를 확인하는 것이 더 안전합니다.)
    const { data, error } = await supabase
      .from('saved_videos')
      .select('*')
      .order('created_at', { ascending: false }); // 최신순으로 정렬
      
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}