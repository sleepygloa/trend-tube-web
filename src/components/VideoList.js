import React from 'react';

function VideoList({ videos = [], onVideoSelect }) { 
  if (videos.length === 0) {
    return <p>검색 결과가 없습니다. 필터 조건을 변경하거나 '실시간 인기' 버튼을 눌러 확인하세요.</p>;
  }

  return (
    <div className="video-list">
      {videos.map((video) => (
        <div 
          key={video.id}
          className="video-item"
          onClick={() => onVideoSelect(video)}
          onDoubleClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
          title="클릭: 상세 정보, 더블클릭: 영상 재생"
        >
          <img src={video.thumbnail} alt={video.title} />
          <div className="video-info">
            <h4>{video.title}</h4>
            <p>{video.channelTitle}</p>
            {/* viewCount가 있을 때만 조회수 표시 */}
            {video.viewCount && <p>조회수: {Number(video.viewCount).toLocaleString()}회</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default VideoList;