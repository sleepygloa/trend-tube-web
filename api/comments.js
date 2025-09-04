import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { videoId, pageToken } = req.query; // pageToken을 받도록 추가

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const response = await youtube.commentThreads.list({
      part: 'snippet',
      videoId: videoId,
      maxResults: 10,
      order: 'relevance',
      pageToken: pageToken || undefined, // pageToken이 있으면 사용
    });

    // 프론트엔드에 댓글 목록과 다음 페이지 토큰을 함께 전달
    res.status(200).json({
      items: response.data.items,
      nextPageToken: response.data.nextPageToken,
    });

  } catch (error) {
    res.status(500).json({ error: '댓글을 불러오는 중 오류가 발생했습니다.' });
  }
}