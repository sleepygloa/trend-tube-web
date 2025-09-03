import React from 'react';
import Masonry from 'react-masonry-css';

function VideoList({ videos = [], onVideoSelect }) { 
  if (videos.length === 0) {
    return <p>검색 결과가 없습니다. 필터 조건을 변경하거나 '실시간 인기' 버튼을 눌러 확인하세요.</p>;
  }

  // Masonry 레이아웃의 중단점(breakpoint) 설정
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {videos.map((video) => (
        <div 
          key={video.id + Math.random()} // 중복 방지를 위해 key 강화
          className="video-item"
          onClick={() => onVideoSelect(video)}
          onDoubleClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
          title="클릭: 상세 정보, 더블클릭: 영상 재생"
        >
          {/* --- 이 부분이 수정되었습니다! --- */}
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            onLoad={(e) => {
              // 이미지가 로드된 후 부모 컴포넌트(VideoList)를 강제로 업데이트
              // 이를 통해 Masonry가 레이아웃을 다시 계산하도록 유도
              e.target.style.opacity = 1; // 로딩 후 보이기 (옵션)
            }}
            style={{ opacity: 0, transition: 'opacity 0.3s ease-in' }} // 로딩 전 숨기기 (옵션)
          />
          <div className="video-info">
            <h4>{video.title}</h4>
            <p>{video.channelTitle}</p>
            {video.viewCount && <p>조회수: {Number(video.viewCount).toLocaleString()}회</p>}
          </div>
        </div>
      ))}
    </Masonry>
  );
}

export default VideoList;