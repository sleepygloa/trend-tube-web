import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  try {
    // 쿼리 파라미터(URL에 담겨오는 조건)를 읽어옴
    const { from, to, keyword } = req.query;

    // Supabase DB에 쿼리 요청
    let query = supabase.from('video_stats').select(`
        *,
        videos ( title, channel_title )
    `);

    // 조건이 있으면 쿼리에 추가
    if (from) query = query.gte('collected_at', from); // from 날짜보다 크거나 같음
    if (to) query = query.lte('collected_at', to);     // to 날짜보다 작거나 같음

    // (keyword 검색 로직은 추후 추가)

    // 조회수(view_count)가 높은 순으로 정렬하고 상위 50개만 가져옴
    query = query.order('view_count', { ascending: false }).limit(50);

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}