import React from 'react';

function VideoList({ videos }) {
  if (videos.length === 0) {
    return <p>검색 결과가 없습니다. (현재 DB에 데이터가 없으면 정상입니다)</p>;
  }

  return (
    <div className="video-list">
      {videos.map((videoStat) => (
        <div key={videoStat.id} className="video-item">
          {/* Supabase에서 videos 테이블과 join했기 때문에 videoStat.videos.title 접근 가능 */}
          <img src={`https://i.ytimg.com/vi/${videoStat.video_id}/mqdefault.jpg`} alt={videoStat.videos.title} />
          <div className="video-info">
            <h4>{videoStat.videos.title}</h4>
            <p>{videoStat.videos.channel_title}</p>
            <p>조회수: {Number(videoStat.view_count).toLocaleString()}회</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default VideoList;