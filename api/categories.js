import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export default async function handler(req, res) {
  try {
    const response = await youtube.videoCategories.list({
      part: 'snippet',
      regionCode: 'KR', // 한국 기준 카테고리
    });
    // Vercel 캐시를 1일(86400초)로 설정하여 매번 호출하지 않도록 함
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json(response.data.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}