import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env._SUPABASE_URL,
  process.env._SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  try {
    // categoryId 파라미터 추가
    const { from, to, keyword, categoryId } = req.query;

    let query = supabase.from('video_stats').select(`
        *,
        videos ( title, channel_title, category_id )
    `);


    if (from) query = query.gte('collected_at', from);
    if (to) query = query.lte('collected_at', to);
    if (keyword) query = query.ilike('videos.title', `%${keyword}%`);
    

    // categoryId가 있으면, videos 테이블의 category_id로 필터링 (신규 추가)
    if (categoryId) {
      query = query.eq('videos.category_id', categoryId);
    }

    // keyword가 존재하면, videos 테이블의 title에서 해당 키워드를 포함하는 데이터만 조회
    if (keyword) {
      // ilike는 대소문자를 구분하지 않는 검색을 의미
      query = query.ilike('videos.title', `%${keyword}%`);
    }

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