import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

const supabase = createClient(
  process.env._SUPABASE_URL,
  process.env._SUPABASE_SERVICE_KEY
);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  try {
    // 1. 어제 수집된 최신 동영상 데이터 가져오기
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();
    const { data: recentVideos, error: videoError } = await supabase
      .from('video_stats')
      .select('*, videos(*)')
      .gte('collected_at', yesterday);
    if (videoError) throw videoError;

    // 2. 모든 구독자 정보 가져오기
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*');
    if (subError) throw subError;

    // 3. 구독자별로 맞춤 이메일 내용 생성
    const emailsToSend = [];
    for (const sub of subscriptions) {
      const matchedVideos = recentVideos.filter(
        (video) => video.videos.category_id === sub.category_id
      );

      if (matchedVideos.length > 0) {
        const emailHtml = `
          <h1>오늘의 TrendTube 🎵음악 트렌드!</h1>
          <p>어제 가장 인기 있었던 음악 동영상 목록입니다.</p>
          <ul>
            ${matchedVideos.map(v => `<li><a href="https://www.youtube.com/watch?v=${v.video_id}">${v.videos.title}</a> - 조회수: ${v.view_count.toLocaleString()}</li>`).join('')}
          </ul>
        `;
        emailsToSend.push({
          to: sub.email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: '오늘의 TrendTube 음악 트렌드 알림',
          html: emailHtml,
        });
      }
    }
    
    // 4. 이메일 발송
    if (emailsToSend.length > 0) {
      await sgMail.send(emailsToSend);
    }

    res.status(200).json({ message: `${emailsToSend.length}개의 이메일을 성공적으로 발송했습니다.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}