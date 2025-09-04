import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export default async function handler(req, res) {
  console.log('Search API called with query:', req.query);
  console.log('Using API Key:', process.env.YOUTUBE_API_KEY ? 'Yes' : 'No');
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { keyword, duration, categoryId, pageToken } = req.query;

    // 1. search.list API로 조건에 맞는 영상 ID 목록 검색
    const searchResponse = await youtube.search.list({
      part: 'id,snippet',
      q: keyword || '',
      type: 'video',
      regionCode: 'KR',
      maxResults: 20,
      pageToken: pageToken || undefined,
      videoDuration: duration || 'any',
      videoCategoryId: categoryId || undefined,
    });

    const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

    if (!videoIds) {
      return res.status(200).json({ items: [], nextPageToken: null });
    }

    // 2. videos.list API로 검색된 영상들의 상세 정보(조회수 포함)를 한 번에 조회
    const videoResponse = await youtube.videos.list({
      part: 'snippet,statistics,contentDetails',
      id: videoIds,
    });

    res.status(200).json({
      items: videoResponse.data.items,
      nextPageToken: searchResponse.data.nextPageToken,
    });
  } catch (error) {
    console.error('Search API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'YouTube 검색 중 오류가 발생했습니다.' });
  }
}