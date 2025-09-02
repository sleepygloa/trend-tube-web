import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

// YouTube API 클라이언트 초기화
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.REACT_APP_YOUTUBE_API_KEY,
});

export default async function handler(req, res) {
  try {
    console.log('데이터 수집을 시작합니다...');

    // 1. YouTube API로 한국의 인기 동영상 50개 가져오기
    const response = await youtube.videos.list({
      part: 'snippet,statistics',
      chart: 'mostPopular',
      regionCode: 'KR',
      maxResults: 50,
    });

    const popularVideos = response.data.items;
    if (!popularVideos || popularVideos.length === 0) {
      return res.status(200).json({ message: '가져올 인기 동영상이 없습니다.' });
    }

    // 2. 수집된 데이터를 우리 DB 형식에 맞게 가공하기
    const videosToUpsert = []; // videos 테이블에 저장할 데이터
    const statsToInsert = [];  // video_stats 테이블에 저장할 데이터

    for (const video of popularVideos) {
      // videos 테이블 데이터 준비 (upsert: 없으면 insert, 있으면 update)
      videosToUpsert.push({
        video_id: video.id,
        title: video.snippet.title,
        channel_title: video.snippet.channelTitle,
        published_at: video.snippet.publishedAt,
      });

      // video_stats 테이블 데이터 준비 (insert)
      statsToInsert.push({
        video_id: video.id,
        view_count: video.statistics.viewCount,
        like_count: video.statistics.likeCount,
        collected_at: new Date().toISOString(), // 현재 시간
      });
    }

    // 3. Supabase 데이터베이스에 저장하기
    // 3-1. 동영상 기본 정보 저장
    const { error: videosError } = await supabase.from('videos').upsert(videosToUpsert, {
      onConflict: 'video_id', // video_id가 겹치면 덮어쓰기
    });
    if (videosError) throw videosError;

    // 3-2. 동영상 통계 정보 저장
    const { error: statsError } = await supabase.from('video_stats').insert(statsToInsert);
    if (statsError) throw statsError;

    console.log(`성공: ${popularVideos.length}개의 동영상 데이터를 수집하고 저장했습니다.`);
    res.status(200).json({ message: `성공: ${popularVideos.length}개의 동영상 데이터를 수집했습니다.` });
  } catch (error) {
    console.error('데이터 수집 중 오류 발생:', error);
    res.status(500).json({ error: error.message });
  }
}