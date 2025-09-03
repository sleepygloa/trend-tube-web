import { google } from 'googleapis';

// YouTube API 클라이언트 초기화
const youtube = google.youtube({
  version: 'v3',
  auth: process.env._YOUTUBE_API_KEY,
});

export default async function handler(req, res) {
  try {
    // 프론트엔드에서 보낸 pageToken 값을 받습니다.
    const { pageToken } = req.query;

    const response = await youtube.videos.list({
      part: 'snippet,statistics',
      chart: 'mostPopular',
      regionCode: 'KR',
      maxResults: 20,
      pageToken: pageToken || undefined, // pageToken이 있으면 사용하고, 없으면 사용하지 않음
    });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    // 이제 items 배열과 함께 nextPageToken도 프론트엔드로 보냅니다.
    res.status(200).json({
      items: response.data.items,
      nextPageToken: response.data.nextPageToken,
    });
  } catch (error) {
    console.error('실시간 인기 동영상 조회 중 오류 발생:', error);
    res.status(500).json({ error: error.message });
  }
}