import React, { useState } from 'react';
import ReactPlayer from 'react-player';

function VideoItem({ video, onVideoSelect }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="video-item"
      // 마우스를 올리면 isHovering을 true로, 떠나면 false로 설정
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="video-player-wrapper" onClick={() => onVideoSelect(video)}>
        {/* isHovering이 true일 때만 미리보기 플레이어 표시 */}
        {isHovering ? (
          <ReactPlayer
            className="react-player"
            url={`https://www.youtube.com/watch?v=${video.id}`}
            width="100%"
            height="100%"
            playing={true} // 자동 재생
            muted={true}   // 소리 끄기
            loop={true}    // 반복 재생
            controls={false} // 컨트롤 바 숨기기
          />
        ) : (
          <img src={video.thumbnail} alt={video.title} />
        )}
      </div>
      <div className="video-info" onClick={() => onVideoSelect(video)}>
        <h4>{video.title}</h4>
        <p>{video.channelTitle}</p>
        {video.viewCount && <p>조회수: {Number(video.viewCount).toLocaleString()}회</p>}
      </div>
    </div>
  );
}

export default VideoItem;