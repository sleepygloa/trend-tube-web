import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { keyword, duration, categoryId, pageToken, order, publishedAfter } = req.query;

    const searchResponse = await youtube.search.list({
      part: 'id,snippet',
      q: keyword || '',
      type: 'video',
      regionCode: 'KR',
      maxResults: 20,
      pageToken: pageToken || undefined,
      videoDuration: duration || 'any',
      videoCategoryId: categoryId || undefined,
      order: order || 'relevance', // 정렬 기준 추가
      publishedAfter: publishedAfter || undefined, // 업로드 날짜 필터 추가
    });

    const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

    if (!videoIds) {
      return res.status(200).json({ items: [], nextPageToken: null });
    }

    // 2. videos.list API로 검색된 영상들의 상세 정보(조회수 포함)를 한 번에 조회
    const videoResponse = await youtube.videos.list({
      part: 'snippet,statistics,contentDetails', // <-- contentDetails 추가
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