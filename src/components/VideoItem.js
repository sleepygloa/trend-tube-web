import React from 'react';

function VideoItem({ video, onVideoSelect, viewType, isSaved, onSave, session }) {


  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (!isSaved) { // 저장되지 않았을 때만 onSave 함수 호출
      onSave(video);
    }
  };
  
  // --- List 뷰일 때의 렌더링 ---
  if (viewType === 'list') {
    return (
      <div className="video-list-item" onClick={() => onVideoSelect(video)}>
        <div className="list-item-checkbox" onClick={handleSaveClick}>
          <input type="checkbox" checked={isSaved} readOnly />
        </div>
        {/* 썸네일과 영상 시간을 감싸는 wrapper 추가 */}
        <div className="video-player-wrapper">
          <img src={video.thumbnail} alt={video.title} className="list-item-thumbnail" />
          {video.duration && <span className="video-duration">{video.duration}</span>}
        </div>
        <div className="list-item-info">
          <span className="list-item-title">{video.title}</span>
          <span className="list-item-channel">{video.channelTitle}</span>
        </div>
        <div className="list-item-meta">
          {/* 유튜브 ID 제거 */}
          <span className="meta-item">{video.viewCount ? `${Number(video.viewCount).toLocaleString()}회` : ''}</span>
        </div>
      </div>
    );
  }

  // --- Grid 또는 Masonry 뷰일 때의 렌더링 ---
  return (
    <div className="video-item">
      <div className="video-player-wrapper" onClick={() => onVideoSelect(video)}>
        <img src={video.thumbnail} alt={video.title} />
        {video.duration && <span className="video-duration">{video.duration}</span>}
      </div>
      <div className="video-info">
        <h4>{video.title}</h4>
        <p>{video.channelTitle}</p>
        <div className="video-meta">
            {video.viewCount && <span className="view-count">조회수: {Number(video.viewCount).toLocaleString()}회</span>}
            {session && (
              <button onClick={handleSaveClick} className="save-button" disabled={isSaved}>
                {isSaved ? '저장완료' : '저장'}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default VideoItem;