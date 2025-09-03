import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, category_id } = req.body;

    if (!email || !category_id) {
      return res.status(400).json({ error: 'Email and category_id are required.' });
    }

    // 'subscriptions' 테이블에 데이터 삽입
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{ email, category_id }]);

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'Subscription successful!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}