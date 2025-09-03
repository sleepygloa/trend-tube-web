import React, { useState, useRef } from 'react'; // useRef를 import합니다.
import ReactPlayer from 'react-player';

function VideoItem({ video, onVideoSelect }) {
  const [isHovering, setIsHovering] = useState(false);
  
  // setTimeout의 ID를 저장하기 위한 useRef
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    // 200ms(0.2초) 후에 미리보기를 시작하도록 예약
    timerRef.current = setTimeout(() => {
      setIsHovering(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    // 마우스가 떠나면 예약을 즉시 취소
    clearTimeout(timerRef.current);
    setIsHovering(false);
  };

  return (
    <div
      className="video-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="video-player-wrapper" onClick={() => onVideoSelect(video)}>
        {isHovering ? (
          <ReactPlayer
            className="react-player"
            url={`https://www.youtube.com/watch?v=${video.id}`}
            width="100%"
            height="100%"
            playing={true}
            muted={true}
            loop={true}
            controls={false}
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