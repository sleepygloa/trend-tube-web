import { google } from 'googleapis';

// YouTube API 클라이언트 초기화
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.REACT_APP_YOUTUBE_API_KEY,
});

export default async function handler(req, res) {
  try {
    // YouTube API로 한국의 실시간 인기 동영상 20개 가져오기
    const response = await youtube.videos.list({
      part: 'snippet,statistics',
      chart: 'mostPopular',
      regionCode: 'KR',
      maxResults: 20, // 인급동은 너무 많지 않게 20개 정도만 표시
    });

    // Vercel의 CDN 캐시를 1시간(3600초)으로 설정하여 불필요한 API 호출을 줄입니다.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(response.data.items);
  } catch (error) {
    console.error('실시간 인기 동영상 조회 중 오류 발생:', error);
    res.status(500).json({ error: error.message });
  }
}