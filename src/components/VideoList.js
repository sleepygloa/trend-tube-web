// src/components/VideoList.js

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

  // 'masonry' 뷰일 때 (기존 List 역할)
  if (viewType === 'masonry') {
    return (
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {videos.map(video => (
          <VideoItem key={video.id + Math.random()} video={video} onVideoSelect={onVideoSelect} viewType={viewType} />
        ))}
      </Masonry>
    );
  }

  // 'grid' 또는 'list' 뷰일 때
  return (
    <div className={viewType === 'grid' ? 'video-grid-table' : 'video-list-table'}>
      {videos.map(video => (
        <VideoItem key={video.id + Math.random()} video={video} onVideoSelect={onVideoSelect} viewType={viewType} />
      ))}
    </div>
  );
}

export default VideoList;