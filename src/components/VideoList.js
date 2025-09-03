import React from 'react';
import Masonry from 'react-masonry-css';
import VideoItem from './VideoItem'; // 새로 만든 VideoItem을 import

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
      {/* 각 비디오 데이터를 VideoItem 컴포넌트에 전달 */}
      {videos.map((video) => (
        <VideoItem key={video.id + Math.random()} video={video} onVideoSelect={onVideoSelect} />
      ))}
    </Masonry>
  );
}

export default VideoList;