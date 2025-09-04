import React from 'react';
import Masonry from 'react-masonry-css';
import VideoItem from './VideoItem';

function VideoList({ videos = [], onVideoSelect, viewType }) {
  if (videos.length === 0) {
    return <p>검색 결과가 없습니다. 필터 조건을 변경하거나 '실시간 인기' 버튼을 눌러 확인하세요.</p>;
  }

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  if (viewType === 'masonry') {
    return (
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {videos.map(video => (
          <VideoItem key={video.id + Math.random()} video={video} onVideoSelect={onVideoSelect} />
        ))}
      </Masonry>
    );
  }

  return (
    <div className="video-grid-table">
      {videos.map(video => (
        <VideoItem key={video.id + Math.random()} video={video} onVideoSelect={onVideoSelect} />
      ))}
    </div>
  );
}

export default VideoList;